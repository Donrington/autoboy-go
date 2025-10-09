package handlers

import (
	"net/http"

	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type BuyerDashboardHandler struct{}

func NewBuyerDashboardHandler() *BuyerDashboardHandler {
	return &BuyerDashboardHandler{}
}

// GetBuyerDashboard gets buyer dashboard data
func (h *BuyerDashboardHandler) GetBuyerDashboard(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	// Get buyer's order counts
	totalOrders, _ := utils.DB.Collection("orders").CountDocuments(c, bson.M{"buyer_id": userObjID})
	activeOrders, _ := utils.DB.Collection("orders").CountDocuments(c, bson.M{
		"buyer_id": userObjID,
		"status": bson.M{"$in": []string{"pending", "processing", "shipped"}},
	})
	completedOrders, _ := utils.DB.Collection("orders").CountDocuments(c, bson.M{
		"buyer_id": userObjID,
		"status": "delivered",
	})

	// Get wishlist count
	wishlistCount, _ := utils.DB.Collection("wishlists").CountDocuments(c, bson.M{"user_id": userObjID})

	// Calculate total spent (mock for now)
	totalSpent := float64(completedOrders) * 125000

	utils.SuccessResponse(c, http.StatusOK, "Buyer dashboard data retrieved", gin.H{
		"total_orders":     totalOrders,
		"active_orders":    activeOrders,
		"completed_orders": completedOrders,
		"wishlist_count":   wishlistCount,
		"total_spent":      totalSpent,
		"recent_activity":  []interface{}{},
		"recommendations":  []interface{}{},
	})
}

// GetBuyerRecentActivity gets buyer's recent activity
func (h *BuyerDashboardHandler) GetBuyerRecentActivity(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	// Get recent orders (last 10)
	cursor, err := utils.DB.Collection("orders").Find(c, 
		bson.M{"buyer_id": userObjID},
		options.Find().SetLimit(10).SetSort(bson.D{{Key: "created_at", Value: -1}}),
	)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch recent activity", err.Error())
		return
	}
	defer cursor.Close(c)

	var recentOrders []bson.M
	cursor.All(c, &recentOrders)

	utils.SuccessResponse(c, http.StatusOK, "Recent activity retrieved", gin.H{
		"recent_orders": recentOrders,
		"recent_reviews": []interface{}{}, // TODO: Implement when review system is ready
		"recent_wishlist": []interface{}{}, // TODO: Implement
	})
}