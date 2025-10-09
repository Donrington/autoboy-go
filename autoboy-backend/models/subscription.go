package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Subscription represents a user's premium subscription
type Subscription struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID           primitive.ObjectID `bson:"user_id" json:"user_id"`
	PlanID           string             `bson:"plan_id" json:"plan_id"`
	Status           string             `bson:"status" json:"status"` // active, cancelled, expired, suspended
	StartDate        time.Time          `bson:"start_date" json:"start_date"`
	EndDate          time.Time          `bson:"end_date" json:"end_date"`
	Amount           float64            `bson:"amount" json:"amount"`
	Currency         string             `bson:"currency" json:"currency"`
	PaymentMethod    string             `bson:"payment_method" json:"payment_method"`
	PaymentReference string             `bson:"payment_reference,omitempty" json:"payment_reference,omitempty"`
	AutoRenew        bool               `bson:"auto_renew" json:"auto_renew"`
	CancelledAt      *time.Time         `bson:"cancelled_at,omitempty" json:"cancelled_at,omitempty"`
	CreatedAt        time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt        time.Time          `bson:"updated_at" json:"updated_at"`
}

// SubscriptionPlan represents available subscription plans
type SubscriptionPlan struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	Price          float64  `json:"price"`
	DurationMonths int      `json:"duration_months"`
	Currency       string   `json:"currency"`
	UserType       string   `json:"user_type"` // buyer, seller
	Features       []string `json:"features"`
	IsActive       bool     `json:"is_active"`
}