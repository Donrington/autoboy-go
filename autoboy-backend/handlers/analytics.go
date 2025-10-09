package handlers

import (
	"context"
	"net/http"
	"time"

	"autoboy-backend/config"
	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AnalyticsHandler struct{}

func NewAnalyticsHandler() *AnalyticsHandler {
	return &AnalyticsHandler{}
}

func (h *AnalyticsHandler) GetSellerAnalytics(c *gin.Context) {
	userID, _ := c.Get("user_id")
	sellerObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Check if user has premium access
	user, _ := c.Get("user")
	currentUser := user.(*models.User)
	if currentUser.Profile.PremiumStatus == "none" {
		utils.ForbiddenResponse(c, "Premium access required for analytics")
		return
	}

	// Get sales analytics
	salesData := h.getSalesAnalytics(ctx, sellerObjID)
	productData := h.getProductAnalytics(ctx, sellerObjID)
	customerData := h.getCustomerAnalytics(ctx, sellerObjID)
	revenueData := h.getRevenueAnalytics(ctx, sellerObjID)

	utils.SuccessResponse(c, http.StatusOK, "Analytics retrieved successfully", gin.H{
		"sales":     salesData,
		"products":  productData,
		"customers": customerData,
		"revenue":   revenueData,
	})
}

func (h *AnalyticsHandler) GetBuyerAnalytics(c *gin.Context) {
	userID, _ := c.Get("user_id")
	buyerObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Check if user has premium access
	user, _ := c.Get("user")
	currentUser := user.(*models.User)
	if currentUser.Profile.PremiumStatus == "none" {
		utils.ForbiddenResponse(c, "Premium access required for analytics")
		return
	}

	// Get purchase analytics
	purchaseData := h.getPurchaseAnalytics(ctx, buyerObjID)
	spendingData := h.getSpendingAnalytics(ctx, buyerObjID)
	savingsData := h.getSavingsAnalytics(ctx, buyerObjID)

	utils.SuccessResponse(c, http.StatusOK, "Analytics retrieved successfully", gin.H{
		"purchases": purchaseData,
		"spending":  spendingData,
		"savings":   savingsData,
	})
}

func (h *AnalyticsHandler) getSalesAnalytics(ctx context.Context, sellerID primitive.ObjectID) gin.H {
	// Sales over time (last 6 months)
	pipeline := []bson.M{
		{"$match": bson.M{
			"seller_id":  sellerID,
			"status":     bson.M{"$in": []string{"delivered", "completed"}},
			"created_at": bson.M{"$gte": time.Now().AddDate(0, -6, 0)},
		}},
		{"$group": bson.M{
			"_id": bson.M{
				"year":  bson.M{"$year": "$created_at"},
				"month": bson.M{"$month": "$created_at"},
			},
			"total_sales":  bson.M{"$sum": "$total_amount"},
			"order_count":  bson.M{"$sum": 1},
			"avg_order":    bson.M{"$avg": "$total_amount"},
		}},
		{"$sort": bson.M{"_id.year": 1, "_id.month": 1}},
	}

	cursor, _ := config.Coll.Orders.Aggregate(ctx, pipeline)
	var salesData []bson.M
	cursor.All(ctx, &salesData)
	cursor.Close(ctx)

	// Total metrics
	totalPipeline := []bson.M{
		{"$match": bson.M{
			"seller_id": sellerID,
			"status":    bson.M{"$in": []string{"delivered", "completed"}},
		}},
		{"$group": bson.M{
			"_id":          nil,
			"total_sales":  bson.M{"$sum": "$total_amount"},
			"total_orders": bson.M{"$sum": 1},
			"avg_order":    bson.M{"$avg": "$total_amount"},
		}},
	}

	totalCursor, _ := config.Coll.Orders.Aggregate(ctx, totalPipeline)
	var totalData []bson.M
	totalCursor.All(ctx, &totalData)
	totalCursor.Close(ctx)

	result := gin.H{
		"monthly_data": salesData,
		"totals":       gin.H{},
	}

	if len(totalData) > 0 {
		result["totals"] = totalData[0]
	}

	return result
}

func (h *AnalyticsHandler) getProductAnalytics(ctx context.Context, sellerID primitive.ObjectID) gin.H {
	// Top performing products
	pipeline := []bson.M{
		{"$match": bson.M{"seller_id": sellerID}},
		{"$lookup": bson.M{
			"from":         "orders",
			"localField":   "_id",
			"foreignField": "items.product_id",
			"as":           "orders",
		}},
		{"$addFields": bson.M{
			"total_sold": bson.M{"$size": "$orders"},
			"revenue": bson.M{"$multiply": []interface{}{
				bson.M{"$size": "$orders"},
				"$price",
			}},
		}},
		{"$sort": bson.M{"total_sold": -1}},
		{"$limit": 10},
		{"$project": bson.M{
			"title":      1,
			"price":      1,
			"total_sold": 1,
			"revenue":    1,
			"view_count": 1,
		}},
	}

	cursor, _ := config.Coll.Products.Aggregate(ctx, pipeline)
	var topProducts []bson.M
	cursor.All(ctx, &topProducts)
	cursor.Close(ctx)

	// Category performance
	categoryPipeline := []bson.M{
		{"$match": bson.M{"seller_id": sellerID}},
		{"$lookup": bson.M{
			"from":         "categories",
			"localField":   "category_id",
			"foreignField": "_id",
			"as":           "category",
		}},
		{"$unwind": "$category"},
		{"$group": bson.M{
			"_id":           "$category.name",
			"product_count": bson.M{"$sum": 1},
			"avg_price":     bson.M{"$avg": "$price"},
			"total_views":   bson.M{"$sum": "$view_count"},
		}},
		{"$sort": bson.M{"product_count": -1}},
	}

	categoryCursor, _ := config.Coll.Products.Aggregate(ctx, categoryPipeline)
	var categoryData []bson.M
	categoryCursor.All(ctx, &categoryData)
	categoryCursor.Close(ctx)

	return gin.H{
		"top_products": topProducts,
		"categories":   categoryData,
	}
}

func (h *AnalyticsHandler) getCustomerAnalytics(ctx context.Context, sellerID primitive.ObjectID) gin.H {
	// Customer insights
	pipeline := []bson.M{
		{"$match": bson.M{"seller_id": sellerID}},
		{"$lookup": bson.M{
			"from":         "users",
			"localField":   "buyer_id",
			"foreignField": "_id",
			"as":           "buyer",
		}},
		{"$unwind": "$buyer"},
		{"$group": bson.M{
			"_id":           "$buyer_id",
			"total_orders":  bson.M{"$sum": 1},
			"total_spent":   bson.M{"$sum": "$total_amount"},
			"avg_order":     bson.M{"$avg": "$total_amount"},
			"customer_name": bson.M{"$first": bson.M{"$concat": []string{"$buyer.profile.first_name", " ", "$buyer.profile.last_name"}}},
		}},
		{"$sort": bson.M{"total_spent": -1}},
		{"$limit": 10},
	}

	cursor, _ := config.Coll.Orders.Aggregate(ctx, pipeline)
	var topCustomers []bson.M
	cursor.All(ctx, &topCustomers)
	cursor.Close(ctx)

	return gin.H{
		"top_customers": topCustomers,
	}
}

func (h *AnalyticsHandler) getRevenueAnalytics(ctx context.Context, sellerID primitive.ObjectID) gin.H {
	// Revenue trends
	pipeline := []bson.M{
		{"$match": bson.M{
			"seller_id":  sellerID,
			"status":     bson.M{"$in": []string{"delivered", "completed"}},
			"created_at": bson.M{"$gte": time.Now().AddDate(0, -12, 0)},
		}},
		{"$group": bson.M{
			"_id": bson.M{
				"year":  bson.M{"$year": "$created_at"},
				"month": bson.M{"$month": "$created_at"},
			},
			"revenue": bson.M{"$sum": "$total_amount"},
			"orders":  bson.M{"$sum": 1},
		}},
		{"$sort": bson.M{"_id.year": 1, "_id.month": 1}},
	}

	cursor, _ := config.Coll.Orders.Aggregate(ctx, pipeline)
	var revenueData []bson.M
	cursor.All(ctx, &revenueData)
	cursor.Close(ctx)

	return gin.H{
		"monthly_revenue": revenueData,
	}
}

func (h *AnalyticsHandler) getPurchaseAnalytics(ctx context.Context, buyerID primitive.ObjectID) gin.H {
	// Purchase history analytics
	pipeline := []bson.M{
		{"$match": bson.M{"buyer_id": buyerID}},
		{"$group": bson.M{
			"_id": bson.M{
				"year":  bson.M{"$year": "$created_at"},
				"month": bson.M{"$month": "$created_at"},
			},
			"total_spent":   bson.M{"$sum": "$total_amount"},
			"order_count":   bson.M{"$sum": 1},
			"avg_order":     bson.M{"$avg": "$total_amount"},
		}},
		{"$sort": bson.M{"_id.year": 1, "_id.month": 1}},
	}

	cursor, _ := config.Coll.Orders.Aggregate(ctx, pipeline)
	var purchaseData []bson.M
	cursor.All(ctx, &purchaseData)
	cursor.Close(ctx)

	return gin.H{
		"monthly_purchases": purchaseData,
	}
}

func (h *AnalyticsHandler) getSpendingAnalytics(ctx context.Context, buyerID primitive.ObjectID) gin.H {
	// Category spending breakdown
	pipeline := []bson.M{
		{"$match": bson.M{"buyer_id": buyerID}},
		{"$unwind": "$items"},
		{"$lookup": bson.M{
			"from":         "products",
			"localField":   "items.product_id",
			"foreignField": "_id",
			"as":           "product",
		}},
		{"$unwind": "$product"},
		{"$lookup": bson.M{
			"from":         "categories",
			"localField":   "product.category_id",
			"foreignField": "_id",
			"as":           "category",
		}},
		{"$unwind": "$category"},
		{"$group": bson.M{
			"_id":           "$category.name",
			"total_spent":   bson.M{"$sum": "$items.total_price"},
			"item_count":    bson.M{"$sum": "$items.quantity"},
			"avg_price":     bson.M{"$avg": "$items.unit_price"},
		}},
		{"$sort": bson.M{"total_spent": -1}},
	}

	cursor, _ := config.Coll.Orders.Aggregate(ctx, pipeline)
	var spendingData []bson.M
	cursor.All(ctx, &spendingData)
	cursor.Close(ctx)

	return gin.H{
		"category_spending": spendingData,
	}
}

func (h *AnalyticsHandler) getSavingsAnalytics(ctx context.Context, buyerID primitive.ObjectID) gin.H {
	// Calculate actual savings from discounts and deals used
	pipeline := []bson.M{
		{"$match": bson.M{
			"buyer_id": buyerID,
			"discount_amount": bson.M{"$gt": 0},
		}},
		{"$group": bson.M{
			"_id": bson.M{
				"year":  bson.M{"$year": "$created_at"},
				"month": bson.M{"$month": "$created_at"},
			},
			"total_saved": bson.M{"$sum": "$discount_amount"},
			"deals_used":  bson.M{"$sum": 1},
		}},
		{"$sort": bson.M{"_id.year": 1, "_id.month": 1}},
	}

	cursor, _ := config.Coll.Orders.Aggregate(ctx, pipeline)
	var savingsData []bson.M
	cursor.All(ctx, &savingsData)
	cursor.Close(ctx)

	// Calculate totals
	totalSaved := 0.0
	totalDeals := 0
	for _, data := range savingsData {
		if saved, ok := data["total_saved"].(float64); ok {
			totalSaved += saved
		}
		if deals, ok := data["deals_used"].(int); ok {
			totalDeals += deals
		}
	}

	avgSavingsRate := 0.0
	if totalDeals > 0 {
		avgSavingsRate = totalSaved / float64(totalDeals)
	}

	return gin.H{
		"total_saved":       totalSaved,
		"deals_used":        totalDeals,
		"avg_savings_rate":  avgSavingsRate,
		"monthly_savings":   savingsData,
	}
}

func (h *AnalyticsHandler) GetDashboardAnalytics(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Basic dashboard analytics
	totalProducts, _ := config.Coll.Products.CountDocuments(ctx, bson.M{"seller_id": userObjID})
	totalOrders, _ := config.Coll.Orders.CountDocuments(ctx, bson.M{"seller_id": userObjID})

	analytics := gin.H{
		"total_products": totalProducts,
		"total_orders":   totalOrders,
	}

	utils.SuccessResponse(c, http.StatusOK, "Dashboard analytics retrieved successfully", analytics)
}

func (h *AnalyticsHandler) GetSalesAnalytics(c *gin.Context) {
	userID, _ := c.Get("user_id")
	sellerObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	salesData := h.getSalesAnalytics(ctx, sellerObjID)
	utils.SuccessResponse(c, http.StatusOK, "Sales analytics retrieved successfully", salesData)
}