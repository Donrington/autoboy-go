package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// NotificationType represents the type of notification
type NotificationType string

const (
	NotificationTypeOrder       NotificationType = "order"
	NotificationTypePayment     NotificationType = "payment"
	NotificationTypeShipping    NotificationType = "shipping"
	NotificationTypeDelivery    NotificationType = "delivery"
	NotificationTypeMessage     NotificationType = "message"
	NotificationTypeReview      NotificationType = "review"
	NotificationTypeAlert       NotificationType = "alert"
	NotificationTypeSystem      NotificationType = "system"
	NotificationTypePromotion   NotificationType = "promotion"
	NotificationTypeExclusive   NotificationType = "exclusive"
	NotificationTypeEarlyAccess NotificationType = "early_access"
	NotificationTypePriceDrop   NotificationType = "price_drop"
	NotificationTypeWishlist    NotificationType = "wishlist"
	NotificationTypeAchievement NotificationType = "achievement"
	NotificationTypeReport      NotificationType = "report"
)

// NotificationPriority represents the priority level of a notification
type NotificationPriority string

const (
	NotificationPriorityLow      NotificationPriority = "low"
	NotificationPriorityNormal   NotificationPriority = "normal"
	NotificationPriorityHigh     NotificationPriority = "high"
	NotificationPriorityCritical NotificationPriority = "critical"
)

// Notification represents a user notification
type Notification struct {
	ID           primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	UserID       primitive.ObjectID   `bson:"user_id" json:"user_id"`
	Type         NotificationType     `bson:"type" json:"type"`
	Priority     NotificationPriority `bson:"priority" json:"priority"`
	Title        string               `bson:"title" json:"title" validate:"required"`
	Message      string               `bson:"message" json:"message" validate:"required"`
	IsRead       bool                 `bson:"is_read" json:"is_read"`
	ReadAt       *time.Time           `bson:"read_at,omitempty" json:"read_at,omitempty"`

	// Action details
	ActionURL    string               `bson:"action_url,omitempty" json:"action_url,omitempty"`
	ActionText   string               `bson:"action_text,omitempty" json:"action_text,omitempty"`

	// Related resource information
	ResourceType string               `bson:"resource_type,omitempty" json:"resource_type,omitempty"` // order, product, message, etc.
	ResourceID   *primitive.ObjectID  `bson:"resource_id,omitempty" json:"resource_id,omitempty"`

	// Additional metadata
	Metadata     map[string]interface{} `bson:"metadata,omitempty" json:"metadata,omitempty"`
	ImageURL     string               `bson:"image_url,omitempty" json:"image_url,omitempty"`

	// Delivery channels
	SentViaEmail bool                 `bson:"sent_via_email" json:"sent_via_email"`
	SentViaSMS   bool                 `bson:"sent_via_sms" json:"sent_via_sms"`
	SentViaPush  bool                 `bson:"sent_via_push" json:"sent_via_push"`

	// Expiry
	ExpiresAt    *time.Time           `bson:"expires_at,omitempty" json:"expires_at,omitempty"`

	// Timestamps
	CreatedAt    time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time            `bson:"updated_at" json:"updated_at"`
}

// NotificationPreferences represents user notification preferences
type NotificationPreferences struct {
	ID                  primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID              primitive.ObjectID `bson:"user_id" json:"user_id"`

	// Email notifications
	EmailEnabled        bool               `bson:"email_enabled" json:"email_enabled"`
	EmailOrders         bool               `bson:"email_orders" json:"email_orders"`
	EmailPayments       bool               `bson:"email_payments" json:"email_payments"`
	EmailMessages       bool               `bson:"email_messages" json:"email_messages"`
	EmailPromotions     bool               `bson:"email_promotions" json:"email_promotions"`
	EmailPriceDrops     bool               `bson:"email_price_drops" json:"email_price_drops"`

	// SMS notifications
	SMSEnabled          bool               `bson:"sms_enabled" json:"sms_enabled"`
	SMSOrders           bool               `bson:"sms_orders" json:"sms_orders"`
	SMSPayments         bool               `bson:"sms_payments" json:"sms_payments"`
	SMSDelivery         bool               `bson:"sms_delivery" json:"sms_delivery"`

	// Push notifications
	PushEnabled         bool               `bson:"push_enabled" json:"push_enabled"`
	PushOrders          bool               `bson:"push_orders" json:"push_orders"`
	PushMessages        bool               `bson:"push_messages" json:"push_messages"`
	PushPromotions      bool               `bson:"push_promotions" json:"push_promotions"`
	PushPriceDrops      bool               `bson:"push_price_drops" json:"push_price_drops"`

	// Premium notifications
	ExclusiveDeals      bool               `bson:"exclusive_deals" json:"exclusive_deals"`
	EarlyAccess         bool               `bson:"early_access" json:"early_access"`
	VIPEvents           bool               `bson:"vip_events" json:"vip_events"`

	// Quiet hours
	QuietHoursEnabled   bool               `bson:"quiet_hours_enabled" json:"quiet_hours_enabled"`
	QuietHoursStart     string             `bson:"quiet_hours_start,omitempty" json:"quiet_hours_start,omitempty"` // Format: "22:00"
	QuietHoursEnd       string             `bson:"quiet_hours_end,omitempty" json:"quiet_hours_end,omitempty"`     // Format: "08:00"

	CreatedAt           time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt           time.Time          `bson:"updated_at" json:"updated_at"`
}

// NotificationTemplate represents a notification template for bulk sending
type NotificationTemplate struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name         string             `bson:"name" json:"name" validate:"required"`
	Type         NotificationType   `bson:"type" json:"type"`
	TitleTemplate string            `bson:"title_template" json:"title_template" validate:"required"`
	MessageTemplate string          `bson:"message_template" json:"message_template" validate:"required"`
	Variables    []string           `bson:"variables,omitempty" json:"variables,omitempty"`
	IsActive     bool               `bson:"is_active" json:"is_active"`
	CreatedAt    time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time          `bson:"updated_at" json:"updated_at"`
}
