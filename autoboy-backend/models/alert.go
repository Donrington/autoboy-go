package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AlertType represents the type of alert
type AlertType string

const (
	AlertTypePriceDrop    AlertType = "price_drop"
	AlertTypeBackInStock  AlertType = "back_in_stock"
	AlertTypeLowStock     AlertType = "low_stock"
	AlertTypeNewArrival   AlertType = "new_arrival"
	AlertTypeExclusiveDeal AlertType = "exclusive_deal"
)

// AlertStatus represents the status of an alert
type AlertStatus string

const (
	AlertStatusActive    AlertStatus = "active"
	AlertStatusTriggered AlertStatus = "triggered"
	AlertStatusExpired   AlertStatus = "expired"
	AlertStatusCancelled AlertStatus = "cancelled"
)



// StockAlert represents a back-in-stock alert
type StockAlert struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID         primitive.ObjectID `bson:"user_id" json:"user_id"`
	ProductID      primitive.ObjectID `bson:"product_id" json:"product_id"`
	Status         AlertStatus        `bson:"status" json:"status"`
	NotifyEmail    bool               `bson:"notify_email" json:"notify_email"`
	NotifySMS      bool               `bson:"notify_sms" json:"notify_sms"`
	NotifyPush     bool               `bson:"notify_push" json:"notify_push"`
	TriggeredAt    *time.Time         `bson:"triggered_at,omitempty" json:"triggered_at,omitempty"`
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time          `bson:"updated_at" json:"updated_at"`
}





// ExclusiveDeal represents a premium/exclusive deal
type ExclusiveDeal struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title           string             `bson:"title" json:"title" validate:"required"`
	Description     string             `bson:"description" json:"description"`
	DealType        string             `bson:"deal_type" json:"deal_type"` // flash_sale, vip_only, early_access
	DiscountPercent float64            `bson:"discount_percent" json:"discount_percent"`
	DiscountAmount  float64            `bson:"discount_amount" json:"discount_amount"`
	Category        string             `bson:"category" json:"category"`

	// Eligibility
	RequiredTier    PremiumStatus      `bson:"required_tier" json:"required_tier"` // Who can access
	RequiredBadge   *primitive.ObjectID `bson:"required_badge,omitempty" json:"required_badge,omitempty"`

	// Products included
	ProductIDs      []primitive.ObjectID `bson:"product_ids,omitempty" json:"product_ids,omitempty"`
	CategoryIDs     []primitive.ObjectID `bson:"category_ids,omitempty" json:"category_ids,omitempty"`
	AllProducts     bool               `bson:"all_products" json:"all_products"` // Apply to all products

	// Limits
	MaxUsesPerUser  int                `bson:"max_uses_per_user" json:"max_uses_per_user"`
	TotalUses       int                `bson:"total_uses" json:"total_uses"`
	MaxTotalUses    int                `bson:"max_total_uses" json:"max_total_uses"`
	MinPurchase     float64            `bson:"min_purchase" json:"min_purchase"`

	// Availability
	ItemsAvailable  int                `bson:"items_available" json:"items_available"`
	IsActive        bool               `bson:"is_active" json:"is_active"`
	IsFeatured      bool               `bson:"is_featured" json:"is_featured"`
	StartDate       time.Time          `bson:"start_date" json:"start_date"`
	EndDate         time.Time          `bson:"end_date" json:"end_date"`

	// Visual
	BannerImage     string             `bson:"banner_image,omitempty" json:"banner_image,omitempty"`
	BadgeText       string             `bson:"badge_text,omitempty" json:"badge_text,omitempty"` // "VIP ONLY", "24H FLASH"

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}

// DealRedemption tracks when users redeem exclusive deals
type DealRedemption struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	DealID      primitive.ObjectID `bson:"deal_id" json:"deal_id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	OrderID     *primitive.ObjectID `bson:"order_id,omitempty" json:"order_id,omitempty"`
	SavedAmount float64            `bson:"saved_amount" json:"saved_amount"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
}
