package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// PromoCodeType represents different types of promo codes
type PromoCodeType string

const (
	PromoCodeTypePercentage PromoCodeType = "percentage"
	PromoCodeTypeFixed      PromoCodeType = "fixed"
	PromoCodeTypeShipping   PromoCodeType = "shipping"
	PromoCodeTypeBOGO       PromoCodeType = "bogo" // Buy One Get One
)

// PromoCode represents promotional discount codes
type PromoCode struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Code        string             `bson:"code" json:"code" validate:"required,min=3,max=50"`
	Name        string             `bson:"name" json:"name" validate:"required"`
	Description string             `bson:"description,omitempty" json:"description,omitempty"`
	Type        PromoCodeType      `bson:"type" json:"type" validate:"required"`
	
	// Discount details
	DiscountValue   float64 `bson:"discount_value" json:"discount_value"` // percentage (0-100) or fixed amount
	MaxDiscount     float64 `bson:"max_discount,omitempty" json:"max_discount,omitempty"` // max discount for percentage
	MinOrderAmount  float64 `bson:"min_order_amount,omitempty" json:"min_order_amount,omitempty"`
	
	// Usage limits
	UsageLimit      int `bson:"usage_limit,omitempty" json:"usage_limit,omitempty"` // 0 = unlimited
	UsageCount      int `bson:"usage_count" json:"usage_count"`
	UserUsageLimit  int `bson:"user_usage_limit,omitempty" json:"user_usage_limit,omitempty"` // per user limit
	
	// Validity
	StartDate       time.Time  `bson:"start_date" json:"start_date"`
	EndDate         time.Time  `bson:"end_date" json:"end_date"`
	IsActive        bool       `bson:"is_active" json:"is_active"`
	
	// Restrictions
	ApplicableCategories []primitive.ObjectID `bson:"applicable_categories,omitempty" json:"applicable_categories,omitempty"`
	ApplicableProducts   []primitive.ObjectID `bson:"applicable_products,omitempty" json:"applicable_products,omitempty"`
	ExcludedCategories   []primitive.ObjectID `bson:"excluded_categories,omitempty" json:"excluded_categories,omitempty"`
	ExcludedProducts     []primitive.ObjectID `bson:"excluded_products,omitempty" json:"excluded_products,omitempty"`
	
	// User restrictions
	EligibleUsers        []primitive.ObjectID `bson:"eligible_users,omitempty" json:"eligible_users,omitempty"`
	RequiredUserType     UserType             `bson:"required_user_type,omitempty" json:"required_user_type,omitempty"`
	RequiredPremiumTier  PremiumStatus        `bson:"required_premium_tier,omitempty" json:"required_premium_tier,omitempty"`
	FirstTimeUsersOnly   bool                 `bson:"first_time_users_only" json:"first_time_users_only"`
	
	// Metadata
	CreatedBy   primitive.ObjectID `bson:"created_by" json:"created_by"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}

// PromoCodeUsage represents usage tracking for promo codes
type PromoCodeUsage struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PromoCodeID  primitive.ObjectID `bson:"promo_code_id" json:"promo_code_id"`
	UserID       primitive.ObjectID `bson:"user_id" json:"user_id"`
	OrderID      primitive.ObjectID `bson:"order_id" json:"order_id"`
	Code         string             `bson:"code" json:"code"`
	DiscountAmount float64          `bson:"discount_amount" json:"discount_amount"`
	OrderAmount    float64          `bson:"order_amount" json:"order_amount"`
	UsedAt         time.Time        `bson:"used_at" json:"used_at"`
}

// CartPromoCode represents applied promo code in cart
type CartPromoCode struct {
	Code           string    `bson:"code" json:"code"`
	Type           PromoCodeType `bson:"type" json:"type"`
	DiscountAmount float64   `bson:"discount_amount" json:"discount_amount"`
	Description    string    `bson:"description" json:"description"`
	AppliedAt      time.Time `bson:"applied_at" json:"applied_at"`
}