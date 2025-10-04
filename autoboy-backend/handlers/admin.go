package handlers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"autoboy-backend/config"
	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

// GetAdminDashboard gets admin dashboard analytics
func (h *AdminHandler) GetAdminDashboard(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Get total users
	totalUsers, _ := config.Coll.Users.CountDocuments(ctx, bson.M{})
	
	// Get total products
	totalProducts, _ := config.Coll.Products.CountDocuments(ctx, bson.M{"status": models.ProductStatusActive})
	
	// Get total orders
	totalOrders, _ := config.Coll.Orders.CountDocuments(ctx, bson.M{})
	
	// Get pending orders
	pendingOrders, _ := config.Coll.Orders.CountDocuments(ctx, bson.M{"status": models.OrderStatusPending})

	// Get total revenue (sum of completed orders)
	pipeline := []bson.M{
		{"$match": bson.M{"status": models.OrderStatusDelivered}},
		{"$group": bson.M{
			"_id": nil,
			"total_revenue": bson.M{"$sum": "$total_amount"},
		}},
	}
	
	cursor, _ := config.Coll.Orders.Aggregate(ctx, pipeline)
	var revenueResult []bson.M
	cursor.All(ctx, &revenueResult)
	
	totalRevenue := 0.0
	if len(revenueResult) > 0 {
		totalRevenue = revenueResult[0]["total_revenue"].(float64)
	}

	// Get recent orders
	recentOrdersCursor, _ := config.Coll.Orders.Find(ctx, bson.M{}, 
		options.Find().SetSort(bson.D{{"created_at", -1}}).SetLimit(10))
	var recentOrders []models.Order
	recentOrdersCursor.All(ctx, &recentOrders)

	// Get user growth (last 30 days)
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	newUsers, _ := config.Coll.Users.CountDocuments(ctx, bson.M{
		"created_at": bson.M{"$gte": thirtyDaysAgo},
	})

	// Get top selling products
	topProductsPipeline := []bson.M{
		{"$match": bson.M{"status": bson.M{"$ne": models.OrderStatusCancelled}}},
		{"$unwind": "$items"},
		{"$group": bson.M{
			"_id": "$items.product_id",
			"total_sold": bson.M{"$sum": "$items.quantity"},
			"revenue": bson.M{"$sum": "$items.total_price"},
			"product_title": bson.M{"$first": "$items.product_title"},
		}},
		{"$sort": bson.M{"total_sold": -1}},
		{"$limit": 5},
	}
	
	topProductsCursor, _ := config.Coll.Orders.Aggregate(ctx, topProductsPipeline)
	var topProducts []bson.M
	topProductsCursor.All(ctx, &topProducts)

	dashboard := gin.H{
		"overview": gin.H{
			"total_users":    totalUsers,
			"total_products": totalProducts,
			"total_orders":   totalOrders,
			"pending_orders": pendingOrders,
			"total_revenue":  totalRevenue,
			"new_users_30d":  newUsers,
		},
		"recent_orders": recentOrders,
		"top_products":  topProducts,
	}

	utils.SuccessResponse(c, http.StatusOK, "Admin dashboard retrieved", dashboard)
}

// GetUsers gets all users with pagination and filters
func (h *AdminHandler) GetUsers(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	userType := c.Query("user_type")
	status := c.Query("status")
	search := c.Query("search")

	filter := bson.M{}
	
	if userType != "" {
		filter["user_type"] = userType
	}
	
	if status != "" {
		filter["status"] = status
	}
	
	if search != "" {
		filter["$or"] = []bson.M{
			{"email": bson.M{"$regex": search, "$options": "i"}},
			{"profile.first_name": bson.M{"$regex": search, "$options": "i"}},
			{"profile.last_name": bson.M{"$regex": search, "$options": "i"}},
		}
	}

	skip := (page - 1) * limit
	opts := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit)).
		SetSort(bson.D{{"created_at", -1}})

	cursor, err := config.Coll.Users.Find(ctx, filter, opts)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch users", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var users []models.User
	cursor.All(ctx, &users)

	total, _ := config.Coll.Users.CountDocuments(ctx, filter)

	utils.SuccessResponse(c, http.StatusOK, "Users retrieved successfully", gin.H{
		"users": users,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// GetAllOrders gets all orders for admin
func (h *AdminHandler) GetAllOrders(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	status := c.Query("status")
	search := c.Query("search")

	filter := bson.M{}
	
	if status != "" {
		filter["status"] = status
	}
	
	if search != "" {
		filter["order_number"] = bson.M{"$regex": search, "$options": "i"}
	}

	skip := (page - 1) * limit
	opts := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit)).
		SetSort(bson.D{{"created_at", -1}})

	cursor, err := config.Coll.Orders.Find(ctx, filter, opts)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch orders", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var orders []models.Order
	cursor.All(ctx, &orders)

	total, _ := config.Coll.Orders.CountDocuments(ctx, filter)

	utils.SuccessResponse(c, http.StatusOK, "Orders retrieved successfully", gin.H{
		"orders": orders,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// UpdateUserStatus updates user status (activate/deactivate/suspend)
func (h *AdminHandler) UpdateUserStatus(c *gin.Context) {
	userID := c.Param("id")
	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid user ID", nil)
		return
	}

	var req struct {
		Status string `json:"status" binding:"required,oneof=active inactive suspended"`
		Reason string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"status": req.Status,
			"updated_at": time.Now(),
		},
	}

	if req.Status == "suspended" && req.Reason != "" {
		update["$set"].(bson.M)["suspension_reason"] = req.Reason
		update["$set"].(bson.M)["suspended_at"] = time.Now()
	}

	result, err := config.Coll.Users.UpdateOne(ctx, bson.M{"_id": userObjID}, update)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to update user status", err.Error())
		return
	}

	if result.MatchedCount == 0 {
		utils.NotFoundResponse(c, "User not found")
		return
	}

	// Log admin action
	adminUserID := c.GetString("user_id")
	adminObjID, _ := primitive.ObjectIDFromHex(adminUserID)
	
	adminLog := bson.M{
		"_id": primitive.NewObjectID(),
		"admin_id": adminObjID,
		"action": "update_user_status",
		"target_user_id": userObjID,
		"details": bson.M{
			"old_status": "", // Would need to fetch old status first
			"new_status": req.Status,
			"reason": req.Reason,
		},
		"created_at": time.Now(),
	}
	
	utils.DB.Collection("admin_logs").InsertOne(ctx, adminLog)

	utils.SuccessResponse(c, http.StatusOK, "User status updated successfully", nil)
}

func (h *AdminHandler) GetUser(c *gin.Context) {
	userID := c.Param("id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := config.Coll.Users.FindOne(ctx, bson.M{"_id": userObjID}).Decode(&user)
	if err != nil {
		utils.NotFoundResponse(c, "User not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "User retrieved successfully", user)
}

func (h *AdminHandler) GetAllProducts(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.Coll.Products.Find(ctx, bson.M{})
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch products", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	cursor.All(ctx, &products)

	utils.SuccessResponse(c, http.StatusOK, "Products retrieved successfully", products)
}

func (h *AdminHandler) ApproveProduct(c *gin.Context) {
	productID := c.Param("id")
	productObjID, _ := primitive.ObjectIDFromHex(productID)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := config.Coll.Products.UpdateOne(ctx, 
		bson.M{"_id": productObjID},
		bson.M{"$set": bson.M{"status": models.ProductStatusActive, "updated_at": time.Now()}},
	)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to approve product", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Product approved successfully", nil)
}

func (h *AdminHandler) RejectProduct(c *gin.Context) {
	productID := c.Param("id")
	productObjID, _ := primitive.ObjectIDFromHex(productID)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := config.Coll.Products.UpdateOne(ctx,
		bson.M{"_id": productObjID},
		bson.M{"$set": bson.M{"status": models.ProductStatusRejected, "updated_at": time.Now()}},
	)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to reject product", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Product rejected successfully", nil)
}

func (h *AdminHandler) GetOrder(c *gin.Context) {
	orderID := c.Param("id")
	orderObjID, _ := primitive.ObjectIDFromHex(orderID)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var order models.Order
	err := config.Coll.Orders.FindOne(ctx, bson.M{"_id": orderObjID}).Decode(&order)
	if err != nil {
		utils.NotFoundResponse(c, "Order not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Order retrieved successfully", order)
}

func (h *AdminHandler) GetSystemAnalytics(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	totalUsers, _ := config.Coll.Users.CountDocuments(ctx, bson.M{})
	totalProducts, _ := config.Coll.Products.CountDocuments(ctx, bson.M{})
	totalOrders, _ := config.Coll.Orders.CountDocuments(ctx, bson.M{})

	analytics := gin.H{
		"total_users":    totalUsers,
		"total_products": totalProducts,
		"total_orders":   totalOrders,
	}

	utils.SuccessResponse(c, http.StatusOK, "System analytics retrieved successfully", analytics)
}