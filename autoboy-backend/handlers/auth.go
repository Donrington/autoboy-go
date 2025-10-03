package handlers

import (
	"context"
	"net/http"
	"time"

	"autoboy-backend/config"
	"autoboy-backend/middleware"
	"autoboy-backend/models"
	"autoboy-backend/services"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// AuthHandler handles authentication-related requests
type AuthHandler struct {
	emailService *services.EmailService
	smsService   *services.SMSService
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(emailService *services.EmailService, smsService *services.SMSService) *AuthHandler {
	return &AuthHandler{
		emailService: emailService,
		smsService:   smsService,
	}
}

// RegisterRequest represents user registration request
type RegisterRequest struct {
	Username    string `json:"username" binding:"required,min=3,max=30"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=8"`
	Phone       string `json:"phone" binding:"required"`
	FirstName   string `json:"first_name" binding:"required"`
	LastName    string `json:"last_name" binding:"required"`
	UserType    string `json:"user_type" binding:"required,oneof=buyer seller"`
	AcceptTerms bool   `json:"accept_terms" binding:"required"`
}

// LoginRequest represents user login request
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	// Validate password strength
	if !utils.IsValidPassword(req.Password) {
		utils.BadRequestResponse(c, "Password must contain at least 8 characters with uppercase, lowercase, number and special character", nil)
		return
	}

	// Validate phone number
	if !utils.IsValidPhone(req.Phone) {
		utils.BadRequestResponse(c, "Invalid phone number format", nil)
		return
	}

	// Check if user already exists
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var existingUser models.User
	err := config.Coll.Users.FindOne(ctx, bson.M{
		"$or": []bson.M{
			{"email": req.Email},
			{"username": req.Username},
			{"phone": utils.NormalizePhone(req.Phone)},
		},
	}).Decode(&existingUser)

	if err == nil {
		utils.ConflictResponse(c, "User with this email, username, or phone already exists")
		return
	} else if err != mongo.ErrNoDocuments {
		utils.InternalServerErrorResponse(c, "Database error", err.Error())
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to process password", err.Error())
		return
	}

	// Create user
	user := models.User{
		ID:              primitive.NewObjectID(),
		Username:        req.Username,
		Email:           req.Email,
		Password:        hashedPassword,
		Phone:           utils.NormalizePhone(req.Phone),
		UserType:        models.UserType(req.UserType),
		Status:          models.UserStatusActive,
		IsEmailVerified: false,
		IsPhoneVerified: false,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
		Profile: models.Profile{
			FirstName:          req.FirstName,
			LastName:           req.LastName,
			VerificationStatus: models.VerificationStatusUnverified,
			PremiumStatus:      models.PremiumStatusNone,
			BadgeLevel:         1,
			Rating:             0.0,
			TotalRatings:       0,
			Preferences: models.UserPreferences{
				Language:             "en",
				Currency:             "NGN",
				Timezone:             "Africa/Lagos",
				EmailNotifications:   true,
				SMSNotifications:     true,
				PushNotifications:    true,
				MarketingEmails:      false,
				Theme:                "light",
			},
		},
	}

	// Insert user
	_, err = config.Coll.Users.InsertOne(ctx, user)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create user", err.Error())
		return
	}

	// Generate JWT token immediately for seamless login
	token, err := middleware.GenerateToken(&user)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to generate token", err.Error())
		return
	}

	// Create user session
	err = middleware.CreateUserSession(user.ID, token, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create session", err.Error())
		return
	}

	// Generate email verification token
	verificationToken := utils.GenerateRandomString(32)
	
	// Send verification email
	go h.emailService.SendVerificationEmail(user.Email, user.Profile.FirstName, verificationToken)

	// Generate OTP for phone verification
	phoneOTP := utils.GenerateOTP()
	
	// Send SMS OTP
	go h.smsService.SendOTP(user.Phone, phoneOTP)

	// Store verification tokens
	config.Coll.Users.UpdateOne(ctx,
		bson.M{"_id": user.ID},
		bson.M{"$set": bson.M{
			"email_verification_token": verificationToken,
			"phone_otp":               phoneOTP,
			"otp_expires_at":          time.Now().Add(10 * time.Minute),
		}},
	)

	// Return success response with token for immediate login
	response := map[string]interface{}{
		"user": map[string]interface{}{
			"id":               user.ID.Hex(),
			"username":         user.Username,
			"email":            user.Email,
			"user_type":        user.UserType,
			"status":           user.Status,
			"is_email_verified": user.IsEmailVerified,
			"is_phone_verified": user.IsPhoneVerified,
			"profile":          user.Profile,
			"created_at":       user.CreatedAt,
		},
		"token":      token,
		"expires_in": 86400,
	}

	utils.CreatedResponse(c, "User registered successfully. Please verify your email and phone number.", response)
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find user by email
	var user models.User
	err := config.Coll.Users.FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		utils.UnauthorizedResponse(c, "Invalid email or password")
		return
	}

	// Check if account is locked
	if user.LockedUntil != nil && user.LockedUntil.After(time.Now()) {
		utils.UnauthorizedResponse(c, "Account is temporarily locked due to multiple failed login attempts")
		return
	}

	// Verify password
	if !utils.CheckPasswordHash(req.Password, user.Password) {
		// Increment login attempts
		attempts := user.LoginAttempts + 1
		update := bson.M{"$set": bson.M{"login_attempts": attempts}}
		
		// Lock account after 5 failed attempts
		if attempts >= 5 {
			lockUntil := time.Now().Add(30 * time.Minute)
			update["$set"].(bson.M)["locked_until"] = lockUntil
		}
		
		config.Coll.Users.UpdateOne(ctx, bson.M{"_id": user.ID}, update)
		utils.UnauthorizedResponse(c, "Invalid email or password")
		return
	}

	// Check if user is active
	if user.Status != models.UserStatusActive {
		utils.UnauthorizedResponse(c, "Account is not active. Please contact support.")
		return
	}

	// Reset login attempts on successful login
	config.Coll.Users.UpdateOne(ctx,
		bson.M{"_id": user.ID},
		bson.M{
			"$set": bson.M{
				"login_attempts": 0,
				"last_login":     time.Now(),
			},
			"$unset": bson.M{"locked_until": ""},
		},
	)

	// Generate JWT token
	token, err := middleware.GenerateToken(&user)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to generate token", err.Error())
		return
	}

	// Create user session
	err = middleware.CreateUserSession(user.ID, token, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create session", err.Error())
		return
	}

	// Set cookie
	c.SetCookie("auth_token", token, 86400, "/", "", false, true)

	// Return response
	response := map[string]interface{}{
		"user": map[string]interface{}{
			"id":               user.ID.Hex(),
			"username":         user.Username,
			"email":            user.Email,
			"user_type":        user.UserType,
			"status":           user.Status,
			"is_email_verified": user.IsEmailVerified,
			"is_phone_verified": user.IsPhoneVerified,
			"profile":          user.Profile,
		},
		"token":      token,
		"expires_in": 86400,
	}

	utils.SuccessResponse(c, http.StatusOK, "Login successful", response)
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *gin.Context) {
	userID, _ := c.Get("user_id")
	token, _ := c.Get("token")

	if userID != nil && token != nil {
		middleware.InvalidateUserSession(userID.(string), token.(string))
	}

	// Clear cookie
	c.SetCookie("auth_token", "", -1, "/", "", false, true)

	utils.SuccessResponse(c, http.StatusOK, "Logout successful", nil)
}

// VerifyEmail handles email verification
func (h *AuthHandler) VerifyEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		utils.BadRequestResponse(c, "Verification token is required", nil)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find user with verification token
	var user models.User
	err := config.Coll.Users.FindOne(ctx, bson.M{
		"email_verification_token": token,
	}).Decode(&user)

	if err != nil {
		utils.BadRequestResponse(c, "Invalid or expired verification token", nil)
		return
	}

	// Update user as verified
	_, err = config.Coll.Users.UpdateOne(ctx,
		bson.M{"_id": user.ID},
		bson.M{
			"$set": bson.M{
				"is_email_verified": true,
				"status":           models.UserStatusActive,
				"updated_at":       time.Now(),
			},
			"$unset": bson.M{"email_verification_token": ""},
		},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to verify email", err.Error())
		return
	}

	// Send welcome email
	go h.emailService.SendWelcomeEmail(user.Email, user.Profile.FirstName)

	utils.SuccessResponse(c, http.StatusOK, "Email verified successfully", nil)
}

// VerifyPhone handles phone verification
func (h *AuthHandler) VerifyPhone(c *gin.Context) {
	var req struct {
		OTP string `json:"otp" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	if userID == nil {
		utils.UnauthorizedResponse(c, "Authentication required")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, _ := primitive.ObjectIDFromHex(userID.(string))
	
	// Find user and verify OTP
	var user models.User
	err := config.Coll.Users.FindOne(ctx, bson.M{
		"_id":              objID,
		"phone_otp":        req.OTP,
		"otp_expires_at":   bson.M{"$gt": time.Now()},
	}).Decode(&user)

	if err != nil {
		utils.BadRequestResponse(c, "Invalid or expired OTP", nil)
		return
	}

	// Update user as phone verified
	_, err = config.Coll.Users.UpdateOne(ctx,
		bson.M{"_id": user.ID},
		bson.M{
			"$set": bson.M{
				"is_phone_verified": true,
				"updated_at":        time.Now(),
			},
			"$unset": bson.M{
				"phone_otp":      "",
				"otp_expires_at": "",
			},
		},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to verify phone", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Phone verified successfully", nil)
}

// ForgotPassword handles password reset request
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find user by email
	var user models.User
	err := config.Coll.Users.FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		// Don't reveal if email exists or not for security
		utils.SuccessResponse(c, http.StatusOK, "If the email exists, a password reset link has been sent", nil)
		return
	}

	// Generate reset token
	resetToken := utils.GenerateRandomString(32)
	resetExpiry := time.Now().Add(1 * time.Hour)

	// Store reset token
	_, err = config.Coll.Users.UpdateOne(ctx,
		bson.M{"_id": user.ID},
		bson.M{"$set": bson.M{
			"password_reset_token": resetToken,
			"password_reset_expires": resetExpiry,
		}},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to process request", err.Error())
		return
	}

	// Send password reset email
	go h.emailService.SendPasswordResetEmail(user.Email, user.Profile.FirstName, resetToken)

	utils.SuccessResponse(c, http.StatusOK, "If the email exists, a password reset link has been sent", nil)
}

// ResetPassword handles password reset with token
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req struct {
		Token       string `json:"token" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	// Validate password strength
	if !utils.IsValidPassword(req.NewPassword) {
		utils.BadRequestResponse(c, "Password must contain at least 8 characters with uppercase, lowercase, number and special character", nil)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find user with valid reset token
	var user models.User
	err := config.Coll.Users.FindOne(ctx, bson.M{
		"password_reset_token": req.Token,
		"password_reset_expires": bson.M{"$gt": time.Now()},
	}).Decode(&user)

	if err != nil {
		utils.BadRequestResponse(c, "Invalid or expired reset token", nil)
		return
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to process password", err.Error())
		return
	}

	// Update password and clear reset token
	_, err = config.Coll.Users.UpdateOne(ctx,
		bson.M{"_id": user.ID},
		bson.M{
			"$set": bson.M{
				"password": hashedPassword,
				"updated_at": time.Now(),
			},
			"$unset": bson.M{
				"password_reset_token": "",
				"password_reset_expires": "",
			},
		},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to reset password", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Password reset successfully", nil)
}

// ResendEmailVerification resends email verification
func (h *AuthHandler) ResendEmailVerification(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find user
	var user models.User
	err := config.Coll.Users.FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		utils.BadRequestResponse(c, "User not found", nil)
		return
	}

	if user.IsEmailVerified {
		utils.BadRequestResponse(c, "Email already verified", nil)
		return
	}

	// Generate new token
	verificationToken := utils.GenerateRandomString(32)

	// Update token
	config.Coll.Users.UpdateOne(ctx,
		bson.M{"_id": user.ID},
		bson.M{"$set": bson.M{"email_verification_token": verificationToken}},
	)

	// Send email
	go h.emailService.SendVerificationEmail(user.Email, user.Profile.FirstName, verificationToken)

	utils.SuccessResponse(c, http.StatusOK, "Verification email sent", nil)
}

// ResendPhoneOTP resends phone OTP
func (h *AuthHandler) ResendPhoneOTP(c *gin.Context) {
	userID, _ := c.Get("user_id")
	if userID == nil {
		utils.UnauthorizedResponse(c, "Authentication required")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, _ := primitive.ObjectIDFromHex(userID.(string))

	// Find user
	var user models.User
	err := config.Coll.Users.FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		utils.BadRequestResponse(c, "User not found", nil)
		return
	}

	if user.IsPhoneVerified {
		utils.BadRequestResponse(c, "Phone already verified", nil)
		return
	}

	// Generate new OTP
	phoneOTP := utils.GenerateOTP()

	// Update OTP
	config.Coll.Users.UpdateOne(ctx,
		bson.M{"_id": user.ID},
		bson.M{"$set": bson.M{
			"phone_otp": phoneOTP,
			"otp_expires_at": time.Now().Add(10 * time.Minute),
		}},
	)

	// Send SMS
	go h.smsService.SendOTP(user.Phone, phoneOTP)

	utils.SuccessResponse(c, http.StatusOK, "OTP sent to your phone", nil)
}