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
	SellerID  primitive.ObjectID `bson:"seller_id" json:"seller_id"`
	
	// Product snapshot at time of adding to cart
	ProductTitle string  `bson:"product_title" json:"product_title"`
	ProductImage string  `bson:"product_image" json:"product_image"`
	UnitPrice    float64 `bson:"unit_price" json:"unit_price"`
	Currency     string  `bson:"currency" json:"currency"`
	Condition    ProductCondition `bson:"condition" json:"condition"`
	Brand        string  `bson:"brand,omitempty" json:"brand,omitempty"`
	Model        string  `bson:"model,omitempty" json:"model,omitempty"`
	
	// Cart item details
	Quantity     int     `bson:"quantity" json:"quantity" validate:"required,min=1"`
	TotalPrice   float64 `bson:"total_price" json:"total_price"`
	
	// Availability and stock check
	IsAvailable  bool    `bson:"is_available" json:"is_available"`
	StockCount   int     `bson:"stock_count" json:"stock_count"`
	
	// Special options (if any)
	Options      map[string]interface{} `bson:"options,omitempty" json:"options,omitempty"`
	Notes        string                 `bson:"notes,omitempty" json:"notes,omitempty"`
	
	// Seller information
	SellerName   string  `bson:"seller_name" json:"seller_name"`
	SellerRating float64 `bson:"seller_rating" json:"seller_rating"`
	
	CreatedAt    time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time `bson:"updated_at" json:"updated_at"`
}

// Cart represents a user's shopping cart summary
type Cart struct {
	UserID         primitive.ObjectID `bson:"user_id" json:"user_id"`
	Items          []CartItem         `bson:"items" json:"items"`
	SavedItems     []SavedForLater    `bson:"saved_items,omitempty" json:"saved_items,omitempty"`
	ItemCount      int                `bson:"item_count" json:"item_count"`
	SubtotalAmount float64            `bson:"subtotal_amount" json:"subtotal_amount"`
	TaxAmount      float64            `bson:"tax_amount" json:"tax_amount"`
	ShippingAmount float64            `bson:"shipping_amount" json:"shipping_amount"`
	DiscountAmount float64            `bson:"discount_amount" json:"discount_amount"`
	TotalAmount    float64            `bson:"total_amount" json:"total_amount"`
	Currency       string             `bson:"currency" json:"currency"`
	AppliedPromo   *CartPromoCode     `bson:"applied_promo,omitempty" json:"applied_promo,omitempty"`
	TaxRate        float64            `bson:"tax_rate" json:"tax_rate"`
	UpdatedAt      time.Time          `bson:"updated_at" json:"updated_at"`
}

// CartSummary represents cart totals and summary
type CartSummary struct {
	ItemCount      int            `json:"item_count"`
	SubtotalAmount float64        `json:"subtotal_amount"`
	TaxAmount      float64        `json:"tax_amount"`
	ShippingAmount float64        `json:"shipping_amount"`
	DiscountAmount float64        `json:"discount_amount"`
	TotalAmount    float64        `json:"total_amount"`
	Currency       string         `json:"currency"`
	AppliedPromo   *CartPromoCode `json:"applied_promo,omitempty"`
	TaxRate        float64        `json:"tax_rate"` // VAT rate (e.g., 0.075 for 7.5%)
}

// SavedForLater represents items saved for later in cart
type SavedForLater struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	ProductID primitive.ObjectID `bson:"product_id" json:"product_id"`
	
	// Product snapshot
	ProductTitle string  `bson:"product_title" json:"product_title"`
	ProductImage string  `bson:"product_image" json:"product_image"`
	UnitPrice    float64 `bson:"unit_price" json:"unit_price"`
	Currency     string  `bson:"currency" json:"currency"`
	
	// Item details
	Quantity     int                    `bson:"quantity" json:"quantity"`
	Options      map[string]interface{} `bson:"options,omitempty" json:"options,omitempty"`
	Notes        string                 `bson:"notes,omitempty" json:"notes,omitempty"`
	
	// Availability
	IsAvailable  bool `bson:"is_available" json:"is_available"`
	
	SavedAt      time.Time `bson:"saved_at" json:"saved_at"`
	UpdatedAt    time.Time `bson:"updated_at" json:"updated_at"`
}