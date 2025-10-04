package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Subscription represents a user's premium subscription
type Subscription struct {
	ID            primitive.ObjectID `json:"id" bson:"_id"`
	UserID        uint               `json:"user_id" bson:"user_id"`
	PlanID        string             `json:"plan_id" bson:"plan_id"`
	Status        string             `json:"status" bson:"status"` // active, cancelled, expired, suspended
	StartDate     time.Time          `json:"start_date" bson:"start_date"`
	EndDate       time.Time          `json:"end_date" bson:"end_date"`
	Amount        float64            `json:"amount" bson:"amount"`
	Currency      string             `json:"currency" bson:"currency"`
	PaymentMethod string             `json:"payment_method" bson:"payment_method"`
	CancelledAt   *time.Time         `json:"cancelled_at,omitempty" bson:"cancelled_at,omitempty"`
	CreatedAt     time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at" bson:"updated_at"`
}

// SubscriptionPlan represents available subscription plans
type SubscriptionPlan struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	Price          float64  `json:"price"`
	Currency       string   `json:"currency"`
	DurationMonths int      `json:"duration_months"`
	Features       []string `json:"features"`
	IsPopular      bool     `json:"is_popular"`
	Savings        string   `json:"savings,omitempty"`
}

// FlashDeal represents flash deals available to users
type FlashDeal struct {
	ID            primitive.ObjectID `json:"id" bson:"_id"`
	Title         string             `json:"title" bson:"title"`
	Description   string             `json:"description" bson:"description"`
	DealType      string             `json:"deal_type" bson:"deal_type"` // flash, exclusive, vip
	DiscountType  string             `json:"discount_type" bson:"discount_type"` // percentage, fixed
	DiscountValue float64            `json:"discount_value" bson:"discount_value"`
	StartTime     time.Time          `json:"start_time" bson:"start_time"`
	EndTime       time.Time          `json:"end_time" bson:"end_time"`
	IsActive      bool               `json:"is_active" bson:"is_active"`
	IsPremiumOnly bool               `json:"is_premium_only" bson:"is_premium_only"`
	MaxUses       int                `json:"max_uses" bson:"max_uses"`
	CurrentUses   int                `json:"current_uses" bson:"current_uses"`
	Category      string             `json:"category" bson:"category"`
	CreatedAt     time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at" bson:"updated_at"`
}

