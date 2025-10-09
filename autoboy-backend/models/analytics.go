package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// UserAnalytics represents user analytics data
type UserAnalytics struct {
	ID     primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID primitive.ObjectID `bson:"user_id" json:"user_id"`
	Date   time.Time          `bson:"date" json:"date"`
	
	// Buyer Analytics
	PurchaseCount    int     `bson:"purchase_count" json:"purchase_count"`
	TotalSpent       float64 `bson:"total_spent" json:"total_spent"`
	TotalSaved       float64 `bson:"total_saved" json:"total_saved"`
	AverageOrderValue float64 `bson:"average_order_value" json:"average_order_value"`
	
	// Category breakdown
	CategorySpending map[string]float64 `bson:"category_spending,omitempty" json:"category_spending,omitempty"`
	
	// Seller Analytics
	SalesCount       int     `bson:"sales_count" json:"sales_count"`
	TotalEarnings    float64 `bson:"total_earnings" json:"total_earnings"`
	ProductViews     int     `bson:"product_views" json:"product_views"`
	ConversionRate   float64 `bson:"conversion_rate" json:"conversion_rate"`
	
	// Engagement metrics
	LoginCount       int `bson:"login_count" json:"login_count"`
	SessionDuration  int `bson:"session_duration" json:"session_duration"` // in minutes
	PageViews        int `bson:"page_views" json:"page_views"`
	
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
}

// SellerAnalytics represents detailed seller analytics
type SellerAnalytics struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	SellerID primitive.ObjectID `bson:"seller_id" json:"seller_id"`
	Period   string             `bson:"period" json:"period"` // daily, weekly, monthly, yearly
	Date     time.Time          `bson:"date" json:"date"`
	
	// Sales metrics
	TotalSales       int     `bson:"total_sales" json:"total_sales"`
	TotalRevenue     float64 `bson:"total_revenue" json:"total_revenue"`
	AverageOrderValue float64 `bson:"average_order_value" json:"average_order_value"`
	
	// Product metrics
	ProductsSold     int `bson:"products_sold" json:"products_sold"`
	UniqueCustomers  int `bson:"unique_customers" json:"unique_customers"`
	RepeatCustomers  int `bson:"repeat_customers" json:"repeat_customers"`
	
	// Performance metrics
	TotalViews       int     `bson:"total_views" json:"total_views"`
	UniqueViews      int     `bson:"unique_views" json:"unique_views"`
	ConversionRate   float64 `bson:"conversion_rate" json:"conversion_rate"`
	
	// Category breakdown
	CategorySales    map[string]int     `bson:"category_sales,omitempty" json:"category_sales,omitempty"`
	CategoryRevenue  map[string]float64 `bson:"category_revenue,omitempty" json:"category_revenue,omitempty"`
	
	// Top products
	TopProducts      []TopProductMetric `bson:"top_products,omitempty" json:"top_products,omitempty"`
	
	// Customer metrics
	NewCustomers     int `bson:"new_customers" json:"new_customers"`
	CustomerRetention float64 `bson:"customer_retention" json:"customer_retention"`
	
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
}

// TopProductMetric represents top performing product metrics
type TopProductMetric struct {
	ProductID    primitive.ObjectID `bson:"product_id" json:"product_id"`
	ProductTitle string             `bson:"product_title" json:"product_title"`
	SalesCount   int                `bson:"sales_count" json:"sales_count"`
	Revenue      float64            `bson:"revenue" json:"revenue"`
	Views        int                `bson:"views" json:"views"`
}

// BuyerAnalytics represents detailed buyer analytics
type BuyerAnalytics struct {
	ID      primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	BuyerID primitive.ObjectID `bson:"buyer_id" json:"buyer_id"`
	Period  string             `bson:"period" json:"period"` // daily, weekly, monthly, yearly
	Date    time.Time          `bson:"date" json:"date"`
	
	// Purchase metrics
	TotalOrders      int     `bson:"total_orders" json:"total_orders"`
	TotalSpent       float64 `bson:"total_spent" json:"total_spent"`
	TotalSaved       float64 `bson:"total_saved" json:"total_saved"`
	AverageOrderValue float64 `bson:"average_order_value" json:"average_order_value"`
	
	// Category breakdown
	CategorySpending map[string]float64 `bson:"category_spending,omitempty" json:"category_spending,omitempty"`
	CategoryOrders   map[string]int     `bson:"category_orders,omitempty" json:"category_orders,omitempty"`
	
	// Savings breakdown
	PromoSavings     float64 `bson:"promo_savings" json:"promo_savings"`
	DealSavings      float64 `bson:"deal_savings" json:"deal_savings"`
	
	// Engagement metrics
	WishlistItems    int `bson:"wishlist_items" json:"wishlist_items"`
	SavedSearches    int `bson:"saved_searches" json:"saved_searches"`
	ProductViews     int `bson:"product_views" json:"product_views"`
	
	// Favorite sellers
	FavoriteSellers  []FavoriteSellerMetric `bson:"favorite_sellers,omitempty" json:"favorite_sellers,omitempty"`
	
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
}

// FavoriteSellerMetric represents buyer's favorite seller metrics
type FavoriteSellerMetric struct {
	SellerID     primitive.ObjectID `bson:"seller_id" json:"seller_id"`
	SellerName   string             `bson:"seller_name" json:"seller_name"`
	OrderCount   int                `bson:"order_count" json:"order_count"`
	TotalSpent   float64            `bson:"total_spent" json:"total_spent"`
	LastOrderAt  time.Time          `bson:"last_order_at" json:"last_order_at"`
}

// PlatformAnalytics represents overall platform analytics
type PlatformAnalytics struct {
	ID   primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Date time.Time          `bson:"date" json:"date"`
	
	// User metrics
	TotalUsers       int `bson:"total_users" json:"total_users"`
	ActiveUsers      int `bson:"active_users" json:"active_users"`
	NewUsers         int `bson:"new_users" json:"new_users"`
	PremiumUsers     int `bson:"premium_users" json:"premium_users"`
	
	// Product metrics
	TotalProducts    int `bson:"total_products" json:"total_products"`
	ActiveProducts   int `bson:"active_products" json:"active_products"`
	NewProducts      int `bson:"new_products" json:"new_products"`
	
	// Transaction metrics
	TotalOrders      int     `bson:"total_orders" json:"total_orders"`
	TotalRevenue     float64 `bson:"total_revenue" json:"total_revenue"`
	AverageOrderValue float64 `bson:"average_order_value" json:"average_order_value"`
	
	// Engagement metrics
	TotalViews       int `bson:"total_views" json:"total_views"`
	UniqueViews      int `bson:"unique_views" json:"unique_views"`
	SearchQueries    int `bson:"search_queries" json:"search_queries"`
	
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
}