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
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SellerHandler struct{}

func NewSellerHandler() *SellerHandler {
	return &SellerHandler{}
}

func (h *SellerHandler) GetDashboard(c *gin.Context) {
	userID, _ := c.Get("user_id")
	sellerObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get seller stats
	totalProducts, _ := config.Coll.Products.CountDocuments(ctx, bson.M{
		"seller_id": sellerObjID,
		"status":    bson.M{"$ne": models.ProductStatusDeleted},
	})

	activeProducts, _ := config.Coll.Products.CountDocuments(ctx, bson.M{
		"seller_id": sellerObjID,
		"status":    models.ProductStatusActive,
	})

	pendingOrders, _ := config.Coll.Orders.CountDocuments(ctx, bson.M{
		"seller_id": sellerObjID,
		"status":    models.OrderStatusPending,
	})

	// Calculate total earnings (mock for now)
	totalEarnings := 2500000.0

	// Recent orders
	opts := options.Find().SetLimit(5).SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, _ := config.Coll.Orders.Find(ctx, bson.M{"seller_id": sellerObjID}, opts)
	var recentOrders []models.Order
	cursor.All(ctx, &recentOrders)

	dashboard := map[string]interface{}{
		"stats": map[string]interface{}{
			"total_products":  totalProducts,
			"active_products": activeProducts,
			"pending_orders":  pendingOrders,
			"total_earnings":  totalEarnings,
		},
		"recent_orders": recentOrders,
		"sales_chart": map[string]interface{}{
			"labels": []string{"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"},
			"data":   []float64{65000, 89000, 120000, 81000, 156000, 255000, 140000},
		},
	}

	utils.SuccessResponse(c, http.StatusOK, "Dashboard data retrieved successfully", dashboard)
}

func (h *SellerHandler) GetProfile(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(*models.User)

	// Get seller-specific stats
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	totalProducts, _ := config.Coll.Products.CountDocuments(ctx, bson.M{
		"seller_id": currentUser.ID,
		"status":    bson.M{"$ne": models.ProductStatusDeleted},
	})

	profile := map[string]interface{}{
		"user":           currentUser,
		"total_products": totalProducts,
		"member_since":   currentUser.CreatedAt,
		"verification":   currentUser.Profile.VerificationStatus,
		"rating":         currentUser.Profile.Rating,
		"total_ratings":  currentUser.Profile.TotalRatings,
	}

	utils.SuccessResponse(c, http.StatusOK, "Seller profile retrieved successfully", profile)
}

func (h *SellerHandler) UpdateProfile(c *gin.Context) {
	var req struct {
		BusinessName    string `json:"business_name"`
		BusinessAddress string `json:"business_address"`
		BusinessPhone   string `json:"business_phone"`
		TaxID           string `json:"tax_id"`
		Bio             string `json:"bio"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	objID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"profile.business_name":    req.BusinessName,
			"profile.business_address": req.BusinessAddress,
			"profile.business_phone":   req.BusinessPhone,
			"profile.tax_id":           req.TaxID,
			"profile.bio":              req.Bio,
			"updated_at":               time.Now(),
		},
	}

	_, err := config.Coll.Users.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to update seller profile", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Seller profile updated successfully", nil)
}

func (h *SellerHandler) GetSalesAnalytics(c *gin.Context) {
	userID, _ := c.Get("user_id")
	_ = userID

	// Mock analytics data - in production, calculate from actual orders
	analytics := map[string]interface{}{
		"total_sales":     152,
		"total_revenue":   2500000,
		"average_rating":  4.7,
		"conversion_rate": 3.2,
		"monthly_sales": []map[string]interface{}{
			{"month": "Jan", "sales": 20, "revenue": 400000},
			{"month": "Feb", "sales": 18, "revenue": 350000},
			{"month": "Mar", "sales": 25, "revenue": 500000},
			{"month": "Apr", "sales": 30, "revenue": 600000},
			{"month": "May", "sales": 28, "revenue": 550000},
			{"month": "Jun", "sales": 31, "revenue": 620000},
		},
		"top_products": []map[string]interface{}{
			{"name": "iPhone 15 Pro Max", "sales": 15, "revenue": 1200000},
			{"name": "Samsung Galaxy S24", "sales": 12, "revenue": 950000},
			{"name": "Google Pixel 8", "sales": 8, "revenue": 600000},
		},
	}

	utils.SuccessResponse(c, http.StatusOK, "Sales analytics retrieved successfully", analytics)
}

func (h *SellerHandler) GetProductAnalytics(c *gin.Context) {
	userID, _ := c.Get("user_id")
	_ = userID

	// Mock product analytics - in production, calculate from actual data
	analytics := map[string]interface{}{
		"total_views":     5420,
		"total_likes":     892,
		"total_shares":    156,
		"total_inquiries": 234,
		"performance": []map[string]interface{}{
			{"product": "iPhone 15 Pro Max", "views": 1200, "likes": 180, "inquiries": 45},
			{"product": "Samsung Galaxy S24", "views": 980, "likes": 150, "inquiries": 38},
			{"product": "Google Pixel 8", "views": 750, "likes": 120, "inquiries": 28},
		},
	}

	utils.SuccessResponse(c, http.StatusOK, "Product analytics retrieved successfully", analytics)
}

func (h *SellerHandler) ApplyToBecomeseller(c *gin.Context) {
	var req struct {
		BusinessName    string `json:"business_name" binding:"required"`
		BusinessAddress string `json:"business_address" binding:"required"`
		BusinessPhone   string `json:"business_phone" binding:"required"`
		TaxID           string `json:"tax_id"`
		Experience      string `json:"experience"`
		Motivation      string `json:"motivation"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	objID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Update user to seller type and add business info
	update := bson.M{
		"$set": bson.M{
			"user_type":                models.UserTypeSeller,
			"profile.business_name":    req.BusinessName,
			"profile.business_address": req.BusinessAddress,
			"profile.business_phone":   req.BusinessPhone,
			"profile.tax_id":           req.TaxID,
			"updated_at":               time.Now(),
		},
	}

	_, err := config.Coll.Users.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to update seller application", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Seller application submitted successfully", nil)
}