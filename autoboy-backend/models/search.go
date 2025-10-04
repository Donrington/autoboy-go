package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// SavedSearch represents a user's saved search query
type SavedSearch struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	Name        string             `bson:"name" json:"name" validate:"required,min=1,max=100"`
	Query       string             `bson:"query" json:"query" validate:"required"`
	Filters     SearchFilters      `bson:"filters" json:"filters"`
	ResultCount int                `bson:"result_count" json:"result_count"`
	IsActive    bool               `bson:"is_active" json:"is_active"`
	LastChecked *time.Time         `bson:"last_checked,omitempty" json:"last_checked,omitempty"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}

// SearchFilters represents search filter criteria
type SearchFilters struct {
	Categories   []primitive.ObjectID `bson:"categories,omitempty" json:"categories,omitempty"`
	Brands       []string             `bson:"brands,omitempty" json:"brands,omitempty"`
	Conditions   []ProductCondition   `bson:"conditions,omitempty" json:"conditions,omitempty"`
	PriceMin     *float64             `bson:"price_min,omitempty" json:"price_min,omitempty"`
	PriceMax     *float64             `bson:"price_max,omitempty" json:"price_max,omitempty"`
	Location     LocationFilter       `bson:"location,omitempty" json:"location,omitempty"`
	SwapOnly     bool                 `bson:"swap_only" json:"swap_only"`
	FeaturedOnly bool                 `bson:"featured_only" json:"featured_only"`
	SortBy       string               `bson:"sort_by,omitempty" json:"sort_by,omitempty"`
	SortOrder    string               `bson:"sort_order,omitempty" json:"sort_order,omitempty"`
}

// LocationFilter represents location-based search filters
type LocationFilter struct {
	City      string  `bson:"city,omitempty" json:"city,omitempty"`
	State     string  `bson:"state,omitempty" json:"state,omitempty"`
	Country   string  `bson:"country,omitempty" json:"country,omitempty"`
	Radius    float64 `bson:"radius,omitempty" json:"radius,omitempty"` // in kilometers
	Latitude  float64 `bson:"latitude,omitempty" json:"latitude,omitempty"`
	Longitude float64 `bson:"longitude,omitempty" json:"longitude,omitempty"`
}

// SearchSuggestion represents search suggestions
type SearchSuggestion struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Query     string             `bson:"query" json:"query"`
	Type      string             `bson:"type" json:"type"` // product, category, brand
	Count     int                `bson:"count" json:"count"`
	IsActive  bool               `bson:"is_active" json:"is_active"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

// SearchHistory represents user search history
type SearchHistory struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    *primitive.ObjectID `bson:"user_id,omitempty" json:"user_id,omitempty"` // nil for anonymous
	Query     string             `bson:"query" json:"query"`
	Filters   SearchFilters      `bson:"filters,omitempty" json:"filters,omitempty"`
	Results   int                `bson:"results" json:"results"`
	IPAddress string             `bson:"ip_address" json:"ip_address"`
	UserAgent string             `bson:"user_agent" json:"user_agent"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}