package handlers

import (
	"net/http"

	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AnalyticsHandler struct{}

func NewAnalyticsHandler() *AnalyticsHandler {
	return &AnalyticsHandler{}
}

// GetDashboardAnalytics gets general dashboard analytics
func (h *AnalyticsHandler) GetDashboardAnalytics(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	// Get user's order count
	orderCount, _ := utils.DB.Collection("orders").CountDocuments(c, bson.M{"buyer_id": userObjID})
	
	// Get user's total spent (mock calculation)
	totalSpent := float64(orderCount) * 150000 // Average order value

	utils.SuccessResponse(c, http.StatusOK, "Dashboard analytics retrieved", gin.H{
		"sales":  0,
		"orders": orderCount,
		"revenue": totalSpent,
		"user_stats": gin.H{
			"total_orders": orderCount,
			"total_spent": totalSpent,
		},
	})
}

// GetSalesAnalytics gets sales analytics
func (h *AnalyticsHandler) GetSalesAnalytics(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "Sales analytics retrieved", gin.H{
		"monthly_sales": []gin.H{
			{"month": "Jan", "sales": 1200000},
			{"month": "Feb", "sales": 1500000},
			{"month": "Mar", "sales": 1800000},
		},
		"top_categories": []gin.H{
			{"category": "Phones", "sales": 2500000},
			{"category": "Laptops", "sales": 1800000},
		},
	})
}

// GetProductAnalytics gets product analytics
func (h *AnalyticsHandler) GetProductAnalytics(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "Product analytics retrieved", gin.H{
		"top_products": []gin.H{
			{"name": "iPhone 15", "views": 1500, "sales": 45},
			{"name": "MacBook Pro", "views": 1200, "sales": 32},
		},
		"category_performance": []gin.H{
			{"category": "Electronics", "conversion_rate": 12.5},
			{"category": "Accessories", "conversion_rate": 8.3},
		},
	})
}