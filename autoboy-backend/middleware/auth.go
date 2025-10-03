package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"autoboy-backend/config"
	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// JWTClaims represents the JWT token claims
type JWTClaims struct {
	UserID   string `json:"user_id"`
	Email    string `json:"email"`
	UserType string `json:"user_type"`
	jwt.RegisteredClaims
}

// AuthMiddleware validates JWT tokens and sets user context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Authorization token required", nil)
			c.Abort()
			return
		}

		claims, err := validateToken(token)
		if err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid or expired token", err)
			c.Abort()
			return
		}

		// Check if user exists and is active
		user, err := getUserFromClaims(claims)
		if err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, "User not found or inactive", err)
			c.Abort()
			return
		}

		// Check if session is valid
		if !isSessionValid(claims.UserID, token) {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Session expired or invalid", nil)
			c.Abort()
			return
		}

		// Set user context
		c.Set("user_id", user.ID.Hex())
		c.Set("user", user)
		c.Set("user_type", user.UserType)
		c.Set("token", token)

		// Update last activity
		go updateUserActivity(user.ID, c.ClientIP(), c.Request.UserAgent())

		c.Next()
	}
}

// OptionalAuthMiddleware validates JWT tokens if present but doesn't require them
func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			c.Next()
			return
		}

		claims, err := validateToken(token)
		if err != nil {
			c.Next()
			return
		}

		user, err := getUserFromClaims(claims)
		if err != nil {
			c.Next()
			return
		}

		if isSessionValid(claims.UserID, token) {
			c.Set("user_id", user.ID.Hex())
			c.Set("user", user)
			c.Set("user_type", user.UserType)
			c.Set("token", token)
		}

		c.Next()
	}
}

// RequireUserType middleware ensures user has specific user type
func RequireUserType(userTypes ...models.UserType) gin.HandlerFunc {
	return func(c *gin.Context) {
		userType, exists := c.Get("user_type")
		if !exists {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Authentication required", nil)
			c.Abort()
			return
		}

		currentUserType := userType.(models.UserType)
		for _, allowedType := range userTypes {
			if currentUserType == allowedType {
				c.Next()
				return
			}
		}

		utils.ErrorResponse(c, http.StatusForbidden, "Insufficient permissions", nil)
		c.Abort()
	}
}

// RequireVerification middleware ensures user is verified
func RequireVerification() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Authentication required", nil)
			c.Abort()
			return
		}

		currentUser := user.(*models.User)
		if !currentUser.IsEmailVerified {
			utils.ErrorResponse(c, http.StatusForbidden, "Email verification required", nil)
			c.Abort()
			return
		}

		c.Next()
	}
}

// extractToken extracts JWT token from Authorization header or cookie
func extractToken(c *gin.Context) string {
	// Try Authorization header first
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" {
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) == 2 && parts[0] == "Bearer" {
			return parts[1]
		}
	}

	// Try cookie as fallback
	token, err := c.Cookie("auth_token")
	if err == nil {
		return token
	}

	return ""
}

// validateToken validates JWT token and returns claims
func validateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(utils.GetEnv("JWT_SECRET", "your-secret-key")), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

// getUserFromClaims retrieves user from database using JWT claims
func getUserFromClaims(claims *JWTClaims) (*models.User, error) {
	userID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		return nil, err
	}

	var user models.User
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = config.Coll.Users.FindOne(ctx, bson.M{
		"_id":    userID,
		"status": models.UserStatusActive,
	}).Decode(&user)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

// isSessionValid checks if the session is still valid
func isSessionValid(userID, token string) bool {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var session models.UserSession
	err := config.Coll.UserSessions.FindOne(ctx, bson.M{
		"user_id":       userID,
		"session_token": token,
		"is_active":     true,
		"expires_at":    bson.M{"$gt": time.Now()},
	}).Decode(&session)

	return err == nil
}

// updateUserActivity updates user's last activity
func updateUserActivity(userID primitive.ObjectID, ipAddress, userAgent string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Update user's last login
	config.Coll.Users.UpdateOne(ctx, 
		bson.M{"_id": userID},
		bson.M{"$set": bson.M{"last_login": time.Now()}},
	)
}

// GenerateToken generates a new JWT token for user
func GenerateToken(user *models.User) (string, error) {
	claims := JWTClaims{
		UserID:   user.ID.Hex(),
		Email:    user.Email,
		UserType: string(user.UserType),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "autoboy-api",
			Subject:   user.ID.Hex(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(utils.GetEnv("JWT_SECRET", "your-secret-key")))
}

// ValidateJWTToken validates JWT token and returns claims (for WebSocket)
func ValidateJWTToken(tokenString string) (*JWTClaims, error) {
	return validateToken(tokenString)
}