package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Wishlist represents a user's wishlist
type Wishlist struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID   `bson:"user_id" json:"user_id"`
	Name        string               `bson:"name" json:"name" validate:"required,min=1,max=100"`
	Description string               `bson:"description,omitempty" json:"description,omitempty"`
	ProductIDs  []primitive.ObjectID `bson:"product_ids" json:"product_ids"`
	IsPrivate   bool                 `bson:"is_private" json:"is_private"`
	ShareToken  string               `bson:"share_token,omitempty" json:"share_token,omitempty"`
	ItemCount   int                  `bson:"item_count" json:"item_count"`
	CreatedAt   time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time            `bson:"updated_at" json:"updated_at"`
}

// WishlistItem represents an individual item in a wishlist
type WishlistItem struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	WishlistID primitive.ObjectID `bson:"wishlist_id" json:"wishlist_id"`
	UserID     primitive.ObjectID `bson:"user_id" json:"user_id"`
	ProductID  primitive.ObjectID `bson:"product_id" json:"product_id"`
	
	// Product snapshot at time of adding
	ProductTitle string  `bson:"product_title" json:"product_title"`
	ProductImage string  `bson:"product_image" json:"product_image"`
	Price        float64 `bson:"price" json:"price"`
	Currency     string  `bson:"currency" json:"currency"`
	
	// Availability tracking
	IsAvailable    bool      `bson:"is_available" json:"is_available"`
	LastChecked    time.Time `bson:"last_checked" json:"last_checked"`
	PriceChanged   bool      `bson:"price_changed" json:"price_changed"`
	OriginalPrice  float64   `bson:"original_price" json:"original_price"`
	
	// User notes
	Notes       string `bson:"notes,omitempty" json:"notes,omitempty"`
	Priority    int    `bson:"priority" json:"priority"` // 1=high, 2=medium, 3=low
	
	AddedAt     time.Time `bson:"added_at" json:"added_at"`
	UpdatedAt   time.Time `bson:"updated_at" json:"updated_at"`
}

// WishlistShare represents shared wishlist access
type WishlistShare struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	WishlistID primitive.ObjectID `bson:"wishlist_id" json:"wishlist_id"`
	SharedBy   primitive.ObjectID `bson:"shared_by" json:"shared_by"`
	SharedWith *primitive.ObjectID `bson:"shared_with,omitempty" json:"shared_with,omitempty"` // nil for public
	ShareToken string             `bson:"share_token" json:"share_token"`
	Permission string             `bson:"permission" json:"permission"` // view, edit
	ExpiresAt  *time.Time         `bson:"expires_at,omitempty" json:"expires_at,omitempty"`
	ViewCount  int                `bson:"view_count" json:"view_count"`
	CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
	LastViewed *time.Time         `bson:"last_viewed,omitempty" json:"last_viewed,omitempty"`
}