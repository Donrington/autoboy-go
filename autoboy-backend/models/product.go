package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ProductStatus represents the status of a product
type ProductStatus string

const (
	ProductStatusDraft     ProductStatus = "draft"
	ProductStatusActive    ProductStatus = "active"
	ProductStatusInactive  ProductStatus = "inactive"
	ProductStatusSold      ProductStatus = "sold"
	ProductStatusSuspended ProductStatus = "suspended"
	ProductStatusDeleted   ProductStatus = "deleted"
	ProductStatusRejected  ProductStatus = "rejected"
)

// ProductCondition represents the condition of a product
type ProductCondition string

const (
	ProductConditionNew         ProductCondition = "new"
	ProductConditionUKUsed      ProductCondition = "uk_used"
	ProductConditionNigeriaUsed ProductCondition = "nigeria_used"
	ProductConditionRefurbished ProductCondition = "refurbished"
)

// Product represents the main product model
type Product struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	SellerID      primitive.ObjectID `bson:"seller_id" json:"seller_id"`
	CategoryID    primitive.ObjectID `bson:"category_id" json:"category_id"`
	Title         string             `bson:"title" json:"title" validate:"required,min=5,max=200"`
	Description   string             `bson:"description" json:"description" validate:"required,min=20,max=5000"`
	Price         float64            `bson:"price" json:"price" validate:"required,min=0"`
	Currency      string             `bson:"currency" json:"currency"`
	Condition     ProductCondition   `bson:"condition" json:"condition" validate:"required"`
	Brand         string             `bson:"brand,omitempty" json:"brand,omitempty"`
	Model         string             `bson:"model,omitempty" json:"model,omitempty"`
	Color         string             `bson:"color,omitempty" json:"color,omitempty"`

	// Product specifications
	Specifications map[string]interface{} `bson:"specifications,omitempty" json:"specifications,omitempty"`

	// Media files
	Images        []ProductMedia     `bson:"images,omitempty" json:"images,omitempty"`
	Videos        []ProductMedia     `bson:"videos,omitempty" json:"videos,omitempty"`

	// Inventory and availability
	Quantity      int                `bson:"quantity" json:"quantity"`
	SoldCount     int                `bson:"sold_count" json:"sold_count"`
	SKU           string             `bson:"sku,omitempty" json:"sku,omitempty"`
	Location      ProductLocation    `bson:"location" json:"location"`
	IsInStock     bool               `bson:"is_in_stock" json:"is_in_stock"`
	LowStockThreshold int            `bson:"low_stock_threshold" json:"low_stock_threshold"`

	// Swap functionality
	SwapAvailable bool               `bson:"swap_available" json:"swap_available"`
	SwapPreferences []SwapPreference `bson:"swap_preferences,omitempty" json:"swap_preferences,omitempty"`

	// Metrics and tracking
	ViewCount     int                `bson:"view_count" json:"view_count"`
	LikeCount     int                `bson:"like_count" json:"like_count"`
	ShareCount    int                `bson:"share_count" json:"share_count"`
	SaveCount     int                `bson:"save_count" json:"save_count"`
	WishlistCount int                `bson:"wishlist_count" json:"wishlist_count"`
	QuestionCount int                `bson:"question_count" json:"question_count"`
	
	// Rating and reviews
	AverageRating float64            `bson:"average_rating" json:"average_rating"`
	ReviewCount   int                `bson:"review_count" json:"review_count"`
	RatingBreakdown map[string]int   `bson:"rating_breakdown,omitempty" json:"rating_breakdown,omitempty"` // "5": 10, "4": 5, etc.

	// Status and visibility
	Status        ProductStatus      `bson:"status" json:"status"`
	IsFeatured    bool               `bson:"is_featured" json:"is_featured"`
	IsPremiumListing bool            `bson:"is_premium_listing" json:"is_premium_listing"`
	IsNew         bool               `bson:"is_new" json:"is_new"`
	IsHot         bool               `bson:"is_hot" json:"is_hot"`
	IsTrending    bool               `bson:"is_trending" json:"is_trending"`
	BoostLevel    int                `bson:"boost_level" json:"boost_level"`
	BoostExpiresAt *time.Time        `bson:"boost_expires_at,omitempty" json:"boost_expires_at,omitempty"`
	
	// Seller information (denormalized for performance)
	SellerName    string             `bson:"seller_name" json:"seller_name"`
	SellerRating  float64            `bson:"seller_rating" json:"seller_rating"`
	SellerVerified bool              `bson:"seller_verified" json:"seller_verified"`

	// SEO and searchability
	Tags          []string           `bson:"tags,omitempty" json:"tags,omitempty"`
	Keywords      []string           `bson:"keywords,omitempty" json:"keywords,omitempty"`
	SearchVector  []float64          `bson:"search_vector,omitempty" json:"search_vector,omitempty"`

	// Timestamps
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt     time.Time          `bson:"updated_at" json:"updated_at"`
	PublishedAt   *time.Time         `bson:"published_at,omitempty" json:"published_at,omitempty"`
	ExpiresAt     *time.Time         `bson:"expires_at,omitempty" json:"expires_at,omitempty"`

	// Admin fields
	AdminNotes    string             `bson:"admin_notes,omitempty" json:"admin_notes,omitempty"`
	FlaggedReason string             `bson:"flagged_reason,omitempty" json:"flagged_reason,omitempty"`
	ModeratedBy   *primitive.ObjectID `bson:"moderated_by,omitempty" json:"moderated_by,omitempty"`
	ModeratedAt   *time.Time         `bson:"moderated_at,omitempty" json:"moderated_at,omitempty"`
}

// ProductMedia represents media files associated with products
type ProductMedia struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	URL       string             `bson:"url" json:"url"`
	Type      string             `bson:"type" json:"type"` // image, video
	Format    string             `bson:"format" json:"format"` // jpg, png, mp4, etc.
	Size      int64              `bson:"size" json:"size"`
	Width     int                `bson:"width,omitempty" json:"width,omitempty"`
	Height    int                `bson:"height,omitempty" json:"height,omitempty"`
	Duration  int                `bson:"duration,omitempty" json:"duration,omitempty"` // for videos in seconds
	AltText   string             `bson:"alt_text,omitempty" json:"alt_text,omitempty"`
	Caption   string             `bson:"caption,omitempty" json:"caption,omitempty"`
	SortOrder int                `bson:"sort_order" json:"sort_order"`
	IsMain    bool               `bson:"is_main" json:"is_main"`
	UploadedAt time.Time         `bson:"uploaded_at" json:"uploaded_at"`
}

// ProductLocation represents product location information
type ProductLocation struct {
	City        string    `bson:"city" json:"city"`
	State       string    `bson:"state" json:"state"`
	Country     string    `bson:"country" json:"country"`
	Coordinates []float64 `bson:"coordinates,omitempty" json:"coordinates,omitempty"` // [longitude, latitude]
	PostalCode  string    `bson:"postal_code,omitempty" json:"postal_code,omitempty"`
}

// SwapPreference represents what the seller wants in exchange
type SwapPreference struct {
	CategoryID    primitive.ObjectID `bson:"category_id,omitempty" json:"category_id,omitempty"`
	Brand         string             `bson:"brand,omitempty" json:"brand,omitempty"`
	Model         string             `bson:"model,omitempty" json:"model,omitempty"`
	MinValue      float64            `bson:"min_value,omitempty" json:"min_value,omitempty"`
	MaxValue      float64            `bson:"max_value,omitempty" json:"max_value,omitempty"`
	Condition     ProductCondition   `bson:"condition,omitempty" json:"condition,omitempty"`
	Description   string             `bson:"description,omitempty" json:"description,omitempty"`
}

// Category represents product categories
type Category struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	Name        string              `bson:"name" json:"name" validate:"required"`
	Slug        string              `bson:"slug" json:"slug" validate:"required"`
	Description string              `bson:"description,omitempty" json:"description,omitempty"`
	ParentID    *primitive.ObjectID `bson:"parent_id,omitempty" json:"parent_id,omitempty"`
	Image       string              `bson:"image,omitempty" json:"image,omitempty"`
	Icon        string              `bson:"icon,omitempty" json:"icon,omitempty"`
	SortOrder   int                 `bson:"sort_order" json:"sort_order"`
	IsActive    bool                `bson:"is_active" json:"is_active"`
	ProductCount int                `bson:"product_count" json:"product_count"`

	// SEO fields
	MetaTitle       string   `bson:"meta_title,omitempty" json:"meta_title,omitempty"`
	MetaDescription string   `bson:"meta_description,omitempty" json:"meta_description,omitempty"`
	MetaKeywords    []string `bson:"meta_keywords,omitempty" json:"meta_keywords,omitempty"`

	// Category attributes/filters
	Attributes []CategoryAttribute `bson:"attributes,omitempty" json:"attributes,omitempty"`

	CreatedAt  time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt  time.Time `bson:"updated_at" json:"updated_at"`
}

// CategoryAttribute represents filterable attributes for categories
type CategoryAttribute struct {
	Name        string   `bson:"name" json:"name"`
	Type        string   `bson:"type" json:"type"` // text, number, select, multi_select, boolean, range
	Options     []string `bson:"options,omitempty" json:"options,omitempty"`
	IsRequired  bool     `bson:"is_required" json:"is_required"`
	IsFilterable bool    `bson:"is_filterable" json:"is_filterable"`
	SortOrder   int      `bson:"sort_order" json:"sort_order"`
}

// ProductReview represents product reviews and ratings
type ProductReview struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ProductID primitive.ObjectID `bson:"product_id" json:"product_id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	OrderID   primitive.ObjectID `bson:"order_id" json:"order_id"`
	Rating    int                `bson:"rating" json:"rating" validate:"required,min=1,max=5"`
	Title     string             `bson:"title,omitempty" json:"title,omitempty"`
	Comment   string             `bson:"comment,omitempty" json:"comment,omitempty"`
	Images    []string           `bson:"images,omitempty" json:"images,omitempty"`

	// Review metrics
	HelpfulCount    int `bson:"helpful_count" json:"helpful_count"`
	NotHelpfulCount int `bson:"not_helpful_count" json:"not_helpful_count"`

	// Verification
	IsVerifiedPurchase bool `bson:"is_verified_purchase" json:"is_verified_purchase"`

	// Moderation
	IsApproved  bool                `bson:"is_approved" json:"is_approved"`
	ModeratedBy *primitive.ObjectID `bson:"moderated_by,omitempty" json:"moderated_by,omitempty"`
	ModeratedAt *time.Time          `bson:"moderated_at,omitempty" json:"moderated_at,omitempty"`

	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}

// ProductQuestion represents Q&A for products
type ProductQuestion struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ProductID primitive.ObjectID `bson:"product_id" json:"product_id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	Question  string             `bson:"question" json:"question" validate:"required,min=5,max=500"`
	Answer    string             `bson:"answer,omitempty" json:"answer,omitempty"`
	AnsweredBy *primitive.ObjectID `bson:"answered_by,omitempty" json:"answered_by,omitempty"`
	AnsweredAt *time.Time         `bson:"answered_at,omitempty" json:"answered_at,omitempty"`
	IsPublic  bool               `bson:"is_public" json:"is_public"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

// ProductWishlist represents user wishlists
type ProductWishlist struct {
	ID        primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID   `bson:"user_id" json:"user_id"`
	ProductIDs []primitive.ObjectID `bson:"product_ids" json:"product_ids"`
	Name      string               `bson:"name" json:"name"`
	IsPublic  bool                 `bson:"is_public" json:"is_public"`
	CreatedAt time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time            `bson:"updated_at" json:"updated_at"`
}

// ProductView represents product view tracking
type ProductView struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ProductID primitive.ObjectID `bson:"product_id" json:"product_id"`
	UserID    *primitive.ObjectID `bson:"user_id,omitempty" json:"user_id,omitempty"` // nil for anonymous users
	IPAddress string             `bson:"ip_address" json:"ip_address"`
	UserAgent string             `bson:"user_agent" json:"user_agent"`
	Referrer  string             `bson:"referrer,omitempty" json:"referrer,omitempty"`
	SessionID string             `bson:"session_id,omitempty" json:"session_id,omitempty"`
	ViewedAt  time.Time          `bson:"viewed_at" json:"viewed_at"`
}

// ProductFlag represents reported products
type ProductFlag struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ProductID primitive.ObjectID `bson:"product_id" json:"product_id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	Reason    string             `bson:"reason" json:"reason" validate:"required"`
	Details   string             `bson:"details,omitempty" json:"details,omitempty"`
	Status    string             `bson:"status" json:"status"` // pending, reviewed, resolved, dismissed
	ReviewedBy *primitive.ObjectID `bson:"reviewed_by,omitempty" json:"reviewed_by,omitempty"`
	ReviewedAt *time.Time         `bson:"reviewed_at,omitempty" json:"reviewed_at,omitempty"`
	Action    string             `bson:"action,omitempty" json:"action,omitempty"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}

// ProductAnalytics represents product performance analytics
type ProductAnalytics struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ProductID      primitive.ObjectID `bson:"product_id" json:"product_id"`
	Date           time.Time          `bson:"date" json:"date"`
	Views          int                `bson:"views" json:"views"`
	UniqueViews    int                `bson:"unique_views" json:"unique_views"`
	Saves          int                `bson:"saves" json:"saves"`
	Shares         int                `bson:"shares" json:"shares"`
	ContactSeller  int                `bson:"contact_seller" json:"contact_seller"`
	SwapRequests   int                `bson:"swap_requests" json:"swap_requests"`
	PurchaseClicks int                `bson:"purchase_clicks" json:"purchase_clicks"`
	ConversionRate float64            `bson:"conversion_rate" json:"conversion_rate"`
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
}