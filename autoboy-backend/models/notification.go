package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// NotificationType represents different types of notifications
type NotificationType string

const (
	NotificationTypeOrder       NotificationType = "order"
	NotificationTypePayment     NotificationType = "payment"
	NotificationTypeShipping    NotificationType = "shipping"
	NotificationTypeDelivery    NotificationType = "delivery"
	NotificationTypeWishlist    NotificationType = "wishlist"
	NotificationTypeAlert       NotificationType = "alert"
	NotificationTypeReview      NotificationType = "review"
	NotificationTypePromotion   NotificationType = "promotion"
	NotificationTypeSystem      NotificationType = "system"
	NotificationTypeMessage     NotificationType = "message"
	NotificationTypePriceDrop   NotificationType = "price_drop"
	NotificationTypeAchievement NotificationType = "achievement"
	NotificationTypeExclusive   NotificationType = "exclusive"
)

// Notification represents a user notification
type Notification struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	Type        NotificationType   `bson:"type" json:"type"`
	Title       string             `bson:"title" json:"title"`
	Message     string             `bson:"message" json:"message"`
	IsRead      bool               `bson:"is_read" json:"is_read"`
	ActionURL   string             `bson:"action_url,omitempty" json:"action_url,omitempty"`
	RelatedID   *primitive.ObjectID `bson:"related_id,omitempty" json:"related_id,omitempty"`
	ImageURL    string             `bson:"image_url,omitempty" json:"image_url,omitempty"`
	Priority    int                `bson:"priority" json:"priority"` // 1=high, 2=normal, 3=low
	ExpiresAt   *time.Time         `bson:"expires_at,omitempty" json:"expires_at,omitempty"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	ReadAt      *time.Time         `bson:"read_at,omitempty" json:"read_at,omitempty"`
}

// NotificationTemplate represents notification message templates
type NotificationTemplate struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name            string             `bson:"name" json:"name"`
	Type            NotificationType   `bson:"type" json:"type"`
	TitleTemplate   string             `bson:"title_template" json:"title_template"`
	MessageTemplate string             `bson:"message_template" json:"message_template"`
	Variables       []string           `bson:"variables,omitempty" json:"variables,omitempty"`
	IsActive        bool               `bson:"is_active" json:"is_active"`
	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}