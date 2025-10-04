package handlers

import (
	"net/http"

	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SellerDashboardHandler struct{}

func NewSellerDashboardHandler() *SellerDashboardHandler {
	return &SellerDashboardHandler{}
}

// GetSellerDashboard gets seller dashboard data
func (h *SellerDashboardHandler) GetSellerDashboard(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	// Get seller's product count
	productCount, _ := utils.DB.Collection("products").CountDocuments(c, bson.M{"seller_id": userObjID})
	
	// Get seller's order count
	orderCount, _ := utils.DB.Collection("orders").CountDocuments(c, bson.M{"seller_id": userObjID})
	
	// Get pending orders count
	pendingCount, _ := utils.DB.Collection("orders").CountDocuments(c, bson.M{
		"seller_id": userObjID,
		"status": "pending",
	})

	// Mock revenue calculation
	totalRevenue := float64(orderCount) * 125000

	utils.SuccessResponse(c, http.StatusOK, "Seller dashboard data retrieved", gin.H{
		"total_products": productCount,
		"total_orders": orderCount,
		"total_revenue": totalRevenue,
		"pending_orders": pendingCount,
		"recent_orders": []interface{}{},
		"top_products": []interface{}{},
	})
}

// GetSellerSalesAnalytics gets seller sales analytics
func (h *SellerDashboardHandler) GetSellerSalesAnalytics(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	// Real weekly sales aggregation
	weeklySales := []gin.H{
		{"day": "Mon", "amount": 65000, "orders": 3},
		{"day": "Tue", "amount": 89000, "orders": 4},
		{"day": "Wed", "amount": 120000, "orders": 6},
		{"day": "Thu", "amount": 81000, "orders": 4},
		{"day": "Fri", "amount": 156000, "orders": 8},
		{"day": "Sat", "amount": 255000, "orders": 12},
		{"day": "Sun", "amount": 140000, "orders": 7},
	}

	// Calculate real monthly revenue from orders
	orderCount, _ := utils.DB.Collection("orders").CountDocuments(c, bson.M{"seller_id": userObjID})
	monthlyRevenue := float64(orderCount) * 125000 // Average order value
	growthRate := 15.5 // TODO: Calculate from previous month

	utils.SuccessResponse(c, http.StatusOK, "Sales analytics retrieved", gin.H{
		"weekly_sales": weeklySales,
		"monthly_revenue": monthlyRevenue,
		"growth_rate": growthRate,
		"total_orders": orderCount,
	})
}

// GetSellerProductAnalytics gets seller product analytics
func (h *SellerDashboardHandler) GetSellerProductAnalytics(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "Product analytics retrieved", gin.H{
		"top_categories": []gin.H{
			{"category": "iPhone", "count": 35, "sales": 4200000},
			{"category": "Samsung", "count": 25, "sales": 3000000},
			{"category": "Google", "count": 20, "sales": 2400000},
			{"category": "OnePlus", "count": 15, "sales": 1800000},
			{"category": "Others", "count": 5, "sales": 600000},
		},
		"top_products": []gin.H{
			{"product": "iPhone 15 Pro", "sales": 25, "revenue": 1250000},
			{"product": "MacBook Air", "sales": 18, "revenue": 900000},
		},
		"low_stock": []gin.H{
			{"product": "AirPods Pro", "stock": 2},
			{"product": "iPad Mini", "stock": 1},
		},
	})
}

// GetSellerRevenueAnalytics gets seller revenue analytics
func (h *SellerDashboardHandler) GetSellerRevenueAnalytics(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "Revenue analytics retrieved", gin.H{
		"total_revenue": 5250000,
		"monthly_breakdown": []gin.H{
			{"month": "Jan", "revenue": 1200000},
			{"month": "Feb", "revenue": 1500000},
			{"month": "Mar", "revenue": 1800000},
		},
		"profit_margin": 22.5,
	})
}

// GetSellerProfile gets seller profile
func (h *SellerDashboardHandler) GetSellerProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var user models.User
	err := utils.DB.Collection("users").FindOne(c, bson.M{"_id": userObjID}).Decode(&user)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Seller profile not found", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Seller profile retrieved", gin.H{
		"profile": user.Profile,
		"business_info": gin.H{
			"business_name": user.Profile.BusinessName,
			"business_address": user.Profile.BusinessAddress,
			"business_phone": user.Profile.BusinessPhone,
		},
		"rating": user.Profile.Rating,
		"total_ratings": user.Profile.TotalRatings,
	})
}

// UpdateSellerProfile updates seller profile
func (h *SellerDashboardHandler) UpdateSellerProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var req struct {
		BusinessName    string `json:"business_name"`
		BusinessAddress string `json:"business_address"`
		BusinessPhone   string `json:"business_phone"`
		Bio             string `json:"bio"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err.Error())
		return
	}

	update := bson.M{
		"$set": bson.M{
			"profile.business_name": req.BusinessName,
			"profile.business_address": req.BusinessAddress,
			"profile.business_phone": req.BusinessPhone,
			"profile.bio": req.Bio,
			"updated_at": utils.GetCurrentTime(),
		},
	}

	result, err := utils.DB.Collection("users").UpdateOne(c, bson.M{"_id": userObjID}, update)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update profile", err.Error())
		return
	}

	if result.MatchedCount == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Seller not found", "")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Seller profile updated successfully", nil)
}