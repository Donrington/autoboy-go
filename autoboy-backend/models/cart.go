package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CartItem represents an item in a user's shopping cart
type CartItem struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	ProductID primitive.ObjectID `bson:"product_id" json:"product_id"`
	
	// Product snapshot at time of adding to cart
	ProductTitle string  `bson:"product_title" json:"product_title"`
	ProductImage string  `bson:"product_image" json:"product_image"`
	UnitPrice    float64 `bson:"unit_price" json:"unit_price"`
	Currency     string  `bson:"currency" json:"currency"`
	
	// Cart item details
	Quantity     int     `bson:"quantity" json:"quantity" validate:"required,min=1"`
	TotalPrice   float64 `bson:"total_price" json:"total_price"`
	
	// Availability check
	IsAvailable  bool    `bson:"is_available" json:"is_available"`
	
	// Special options (if any)
	Options      map[string]interface{} `bson:"options,omitempty" json:"options,omitempty"`
	Notes        string                 `bson:"notes,omitempty" json:"notes,omitempty"`
	
	CreatedAt    time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time `bson:"updated_at" json:"updated_at"`
}

// Cart represents a user's shopping cart summary
type Cart struct {
	UserID       primitive.ObjectID `bson:"user_id" json:"user_id"`
	Items        []CartItem         `bson:"items" json:"items"`
	ItemCount    int                `bson:"item_count" json:"item_count"`
	TotalAmount  float64            `bson:"total_amount" json:"total_amount"`
	Currency     string             `bson:"currency" json:"currency"`
	UpdatedAt    time.Time          `bson:"updated_at" json:"updated_at"`
}

// CartSummary represents cart totals and summary
type CartSummary struct {
	ItemCount     int     `json:"item_count"`
	SubtotalAmount float64 `json:"subtotal_amount"`
	TaxAmount     float64 `json:"tax_amount"`
	ShippingAmount float64 `json:"shipping_amount"`
	TotalAmount   float64 `json:"total_amount"`
	Currency      string  `json:"currency"`
}