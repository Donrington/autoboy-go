package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// PriceAlertStatus represents the status of a price alert
type PriceAlertStatus string

const (
	PriceAlertStatusActive    PriceAlertStatus = "active"
	PriceAlertStatusTriggered PriceAlertStatus = "triggered"
	PriceAlertStatusExpired   PriceAlertStatus = "expired"
	PriceAlertStatusPaused    PriceAlertStatus = "paused"
)

// PriceAlert represents a user's price alert for a product
type PriceAlert struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	ProductID primitive.ObjectID `bson:"product_id" json:"product_id"`
	
	// Alert criteria
	TargetPrice     float64 `bson:"target_price" json:"target_price"`
	CurrentPrice    float64 `bson:"current_price" json:"current_price"`
	Currency        string  `bson:"currency" json:"currency"`
	AlertType       string  `bson:"alert_type" json:"alert_type"` // "below", "above", "exact"
	
	// Product snapshot
	ProductTitle    string `bson:"product_title" json:"product_title"`
	ProductImage    string `bson:"product_image" json:"product_image"`
	SellerID        primitive.ObjectID `bson:"seller_id" json:"seller_id"`
	SellerName      string `bson:"seller_name" json:"seller_name"`
	
	// Alert settings
	Status          PriceAlertStatus `bson:"status" json:"status"`
	IsActive        bool             `bson:"is_active" json:"is_active"`
	NotifyEmail     bool             `bson:"notify_email" json:"notify_email"`
	NotifySMS       bool             `bson:"notify_sms" json:"notify_sms"`
	NotifyPush      bool             `bson:"notify_push" json:"notify_push"`
	
	// Tracking
	LastChecked     time.Time  `bson:"last_checked" json:"last_checked"`
	TriggeredAt     *time.Time `bson:"triggered_at,omitempty" json:"triggered_at,omitempty"`
	NotifiedAt      *time.Time `bson:"notified_at,omitempty" json:"notified_at,omitempty"`
	ExpiresAt       *time.Time `bson:"expires_at,omitempty" json:"expires_at,omitempty"`
	
	// Price history tracking
	PriceHistory    []PricePoint `bson:"price_history,omitempty" json:"price_history,omitempty"`
	
	CreatedAt       time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time `bson:"updated_at" json:"updated_at"`
}

// PricePoint represents a price point in history
type PricePoint struct {
	Price     float64   `bson:"price" json:"price"`
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
}

// PriceAlertNotification represents a triggered price alert notification
type PriceAlertNotification struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PriceAlertID  primitive.ObjectID `bson:"price_alert_id" json:"price_alert_id"`
	UserID        primitive.ObjectID `bson:"user_id" json:"user_id"`
	ProductID     primitive.ObjectID `bson:"product_id" json:"product_id"`
	
	// Alert details
	TargetPrice   float64 `bson:"target_price" json:"target_price"`
	CurrentPrice  float64 `bson:"current_price" json:"current_price"`
	PreviousPrice float64 `bson:"previous_price" json:"previous_price"`
	PriceChange   float64 `bson:"price_change" json:"price_change"`
	PercentChange float64 `bson:"percent_change" json:"percent_change"`
	
	// Notification status
	EmailSent     bool       `bson:"email_sent" json:"email_sent"`
	SMSSent       bool       `bson:"sms_sent" json:"sms_sent"`
	PushSent      bool       `bson:"push_sent" json:"push_sent"`
	EmailSentAt   *time.Time `bson:"email_sent_at,omitempty" json:"email_sent_at,omitempty"`
	SMSSentAt     *time.Time `bson:"sms_sent_at,omitempty" json:"sms_sent_at,omitempty"`
	PushSentAt    *time.Time `bson:"push_sent_at,omitempty" json:"push_sent_at,omitempty"`
	
	CreatedAt     time.Time `bson:"created_at" json:"created_at"`
}

// PriceAlertJob represents a background job for checking price alerts
type PriceAlertJob struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ProductID     primitive.ObjectID `bson:"product_id" json:"product_id"`
	CurrentPrice  float64            `bson:"current_price" json:"current_price"`
	PreviousPrice float64            `bson:"previous_price" json:"previous_price"`
	AlertsCount   int                `bson:"alerts_count" json:"alerts_count"`
	Status        string             `bson:"status" json:"status"` // pending, processing, completed, failed
	ProcessedAt   *time.Time         `bson:"processed_at,omitempty" json:"processed_at,omitempty"`
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
}