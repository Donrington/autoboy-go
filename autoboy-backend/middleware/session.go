package middleware

import (
	"context"
	"time"

	"autoboy-backend/config"
	"autoboy-backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CreateUserSession creates a new user session
func CreateUserSession(userID primitive.ObjectID, token, ipAddress, userAgent string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	session := models.UserSession{
		ID:           primitive.NewObjectID(),
		UserID:       userID,
		SessionToken: token,
		DeviceInfo: models.DeviceInfo{
			UserAgent:  userAgent,
			DeviceType: "web",
		},
		IPAddress:    ipAddress,
		IsActive:     true,
		ExpiresAt:    time.Now().Add(24 * time.Hour),
		CreatedAt:    time.Now(),
		LastActivity: time.Now(),
	}

	_, err := config.Coll.UserSessions.InsertOne(ctx, session)
	return err
}

// InvalidateUserSession invalidates a user session
func InvalidateUserSession(userID, token string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Convert userID string to ObjectID
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	_, err = config.Coll.UserSessions.UpdateOne(ctx,
		bson.M{
			"user_id":       userObjectID,
			"session_token": token,
		},
		bson.M{
			"$set": bson.M{
				"is_active": false,
			},
		},
	)
	return err
}