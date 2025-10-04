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
	"golang.org/x/crypto/bcrypt"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

// Dashboard Stats
func (h *AdminHandler) GetDashboardStats(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get total users
	totalUsers, _ := config.Coll.Users.CountDocuments(ctx, bson.M{})
	
	// Get active listings
	activeListings, _ := config.Coll.Products.CountDocuments(ctx, bson.M{"status": models.ProductStatusActive})
	
	// Get pending reports
	pendingReports, _ := config.Coll.Reports.CountDocuments(ctx, bson.M{"status": "pending"})
	
	// Get today's revenue (mock calculation)
	todayStart := time.Now().Truncate(24 * time.Hour)
	pipeline := []bson.M{
		{"$match": bson.M{"created_at": bson.M{"$gte": todayStart}, "status": "completed"}},
		{"$group": bson.M{"_id": nil, "total": bson.M{"$sum": "$amount"}}},
	}
	cursor, _ := config.Coll.Transactions.Aggregate(ctx, pipeline)
	var revenueResult []bson.M
	cursor.All(ctx, &revenueResult)
	
	todayRevenue := 0.0
	if len(revenueResult) > 0 {
		todayRevenue = revenueResult[0]["total"].(float64)
	}

	// Get total transactions
	totalTransactions, _ := config.Coll.Transactions.CountDocuments(ctx, bson.M{})
	
	// Get active sessions (mock)
	activeSessions := 1523
	
	// System health (mock)
	systemHealth := 98.5

	stats := map[string]interface{}{
		"total_users":        totalUsers,
		"active_listings":    activeListings,
		"pending_reports":    pendingReports,
		"today_revenue":      todayRevenue,
		"total_transactions": totalTransactions,
		"active_sessions":    activeSessions,
		"system_health":      systemHealth,
	}

	utils.SuccessResponse(c, http.StatusOK, "Dashboard stats retrieved successfully", stats)
}

// User Management
func (h *AdminHandler) GetAllUsers(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	status := c.Query("status")
	userType := c.Query("type")

	filter := bson.M{}
	if status != "" && status != "all" {
		filter["status"] = status
	}
	if userType != "" && userType != "all" {
		filter["user_type"] = userType
	}

	page, limit, totalPages, offset := utils.CalculatePagination(page, limit, 0)

	total, _ := config.Coll.Users.CountDocuments(ctx, filter)
	_, _, totalPages, _ = utils.CalculatePagination(page, limit, total)

	findOptions := options.Find().
		SetSkip(int64(offset)).
		SetLimit(int64(limit)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := config.Coll.Users.Find(ctx, filter, findOptions)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch users", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err = cursor.All(ctx, &users); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to decode users", err.Error())
		return
	}

	meta := &utils.Meta{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}

	utils.SuccessResponseWithMeta(c, http.StatusOK, "Users retrieved successfully", users, meta)
}

func (h *AdminHandler) GetUserDetails(c *gin.Context) {
	userID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid user ID", nil)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err = config.Coll.Users.FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		utils.NotFoundResponse(c, "User not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "User details retrieved successfully", user)
}

func (h *AdminHandler) SuspendUser(c *gin.Context) {
	userID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid user ID", nil)
		return
	}

	var req struct {
		Reason       string `json:"reason" binding:"required"`
		DurationDays int    `json:"duration_days"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	suspendedUntil := time.Now().AddDate(0, 0, req.DurationDays)
	update := bson.M{
		"$set": bson.M{
			"status":          models.UserStatusSuspended,
			"suspended_until": suspendedUntil,
			"suspension_reason": req.Reason,
			"updated_at":      time.Now(),
		},
	}

	_, err = config.Coll.Users.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to suspend user", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "User suspended successfully", nil)
}

func (h *AdminHandler) ActivateUser(c *gin.Context) {
	userID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid user ID", nil)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"status":     models.UserStatusActive,
			"updated_at": time.Now(),
		},
		"$unset": bson.M{
			"suspended_until":   "",
			"suspension_reason": "",
		},
	}

	_, err = config.Coll.Users.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to activate user", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "User activated successfully", nil)
}

// Admin Management
func (h *AdminHandler) GetAllAdmins(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"user_type": models.UserTypeAdmin}
	cursor, err := config.Coll.Users.Find(ctx, filter)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch admins", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var admins []models.User
	if err = cursor.All(ctx, &admins); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to decode admins", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Admins retrieved successfully", admins)
}

func (h *AdminHandler) CreateAdmin(c *gin.Context) {
	var req struct {
		Username    string   `json:"username" binding:"required"`
		Email       string   `json:"email" binding:"required,email"`
		Password    string   `json:"password" binding:"required,min=8"`
		FirstName   string   `json:"first_name" binding:"required"`
		LastName    string   `json:"last_name" binding:"required"`
		Role        string   `json:"role" binding:"required"`
		Permissions []string `json:"permissions"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if email already exists
	count, _ := config.Coll.Users.CountDocuments(ctx, bson.M{"email": req.Email})
	if count > 0 {
		utils.BadRequestResponse(c, "Email already exists", nil)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to hash password", err.Error())
		return
	}

	admin := models.User{
		ID:              primitive.NewObjectID(),
		Username:        req.Username,
		Email:           req.Email,
		Password:        string(hashedPassword),
		UserType:        models.UserTypeAdmin,
		Status:          models.UserStatusActive,
		IsEmailVerified: true,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
		Profile: models.Profile{
			FirstName: req.FirstName,
			LastName:  req.LastName,
			Preferences: models.UserPreferences{
				Language: "en",
				Currency: "NGN",
				Timezone: "Africa/Lagos",
			},
		},
	}

	_, err = config.Coll.Users.InsertOne(ctx, admin)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create admin", err.Error())
		return
	}

	utils.CreatedResponse(c, "Admin created successfully", admin)
}

// Product Management
func (h *AdminHandler) GetAllProducts(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	status := c.Query("status")

	filter := bson.M{}
	if status != "" && status != "all" {
		filter["status"] = status
	}

	page, limit, totalPages, offset := utils.CalculatePagination(page, limit, 0)

	total, _ := config.Coll.Products.CountDocuments(ctx, filter)
	_, _, totalPages, _ = utils.CalculatePagination(page, limit, total)

	findOptions := options.Find().
		SetSkip(int64(offset)).
		SetLimit(int64(limit)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := config.Coll.Products.Find(ctx, filter, findOptions)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch products", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err = cursor.All(ctx, &products); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to decode products", err.Error())
		return
	}

	meta := &utils.Meta{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}

	utils.SuccessResponseWithMeta(c, http.StatusOK, "Products retrieved successfully", products, meta)
}

func (h *AdminHandler) ApproveProduct(c *gin.Context) {
	productID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(productID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid product ID", nil)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"status":     models.ProductStatusActive,
			"updated_at": time.Now(),
		},
	}

	_, err = config.Coll.Products.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to approve product", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Product approved successfully", nil)
}

func (h *AdminHandler) RejectProduct(c *gin.Context) {
	productID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(productID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid product ID", nil)
		return
	}

	var req struct {
		Reason string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"status":          models.ProductStatusRejected,
			"rejection_reason": req.Reason,
			"updated_at":      time.Now(),
		},
	}

	_, err = config.Coll.Products.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to reject product", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Product rejected successfully", nil)
}

// System Management
func (h *AdminHandler) GetSystemHealth(c *gin.Context) {
	// Mock system health data
	health := map[string]interface{}{
		"cpu":                45,
		"memory":             62,
		"storage":            67,
		"bandwidth":          54,
		"api_latency":        120,
		"uptime":             99.8,
		"active_connections": 1523,
		"queued_jobs":        45,
		"status":             "healthy",
		"timestamp":          time.Now(),
	}

	utils.SuccessResponse(c, http.StatusOK, "System health retrieved successfully", health)
}

func (h *AdminHandler) GetSystemLogs(c *gin.Context) {
	level := c.DefaultQuery("level", "all")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	// Mock system logs
	logs := []map[string]interface{}{
		{"id": 1, "level": "info", "message": "Database backup completed successfully", "timestamp": time.Now().Add(-1 * time.Hour)},
		{"id": 2, "level": "warning", "message": "High memory usage detected (85%)", "timestamp": time.Now().Add(-2 * time.Hour)},
		{"id": 3, "level": "error", "message": "Payment gateway timeout - retrying", "timestamp": time.Now().Add(-4 * time.Hour)},
		{"id": 4, "level": "info", "message": "Scheduled maintenance completed", "timestamp": time.Now().Add(-6 * time.Hour)},
	}

	// Filter by level if specified
	if level != "all" {
		var filteredLogs []map[string]interface{}
		for _, log := range logs {
			if log["level"] == level {
				filteredLogs = append(filteredLogs, log)
			}
		}
		logs = filteredLogs
	}

	// Apply limit
	if len(logs) > limit {
		logs = logs[:limit]
	}

	utils.SuccessResponse(c, http.StatusOK, "System logs retrieved successfully", logs)
}

// Settings Management
func (h *AdminHandler) GetSystemSettings(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.Coll.SystemSettings.Find(ctx, bson.M{})
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch settings", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var settings []bson.M
	if err = cursor.All(ctx, &settings); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to decode settings", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "System settings retrieved successfully", settings)
}

func (h *AdminHandler) UpdateSystemSettings(c *gin.Context) {
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Update each setting
	for key, value := range req {
		filter := bson.M{"key": key}
		update := bson.M{
			"$set": bson.M{
				"value":      value,
				"updated_at": time.Now(),
			},
		}
		config.Coll.SystemSettings.UpdateOne(ctx, filter, update)
	}

	utils.SuccessResponse(c, http.StatusOK, "System settings updated successfully", nil)
}

// Analytics
func (h *AdminHandler) GetAnalytics(c *gin.Context) {
	period := c.DefaultQuery("period", "month")

	// Mock analytics data
	analytics := map[string]interface{}{
		"new_users": map[string]interface{}{
			"today": 234,
			"week":  1520,
			"month": 6840,
		},
		"revenue": map[string]interface{}{
			"today": 8500000,
			"week":  52000000,
			"month": 215000000,
		},
		"transactions": map[string]interface{}{
			"today": 342,
			"week":  2450,
			"month": 10230,
		},
		"top_categories": []map[string]interface{}{
			{"name": "Mobile Phones", "sales": 4520, "revenue": 125000000},
			{"name": "Laptops", "sales": 1240, "revenue": 85000000},
			{"name": "Accessories", "sales": 6780, "revenue": 45000000},
		},
		"period": period,
	}

	utils.SuccessResponse(c, http.StatusOK, "Analytics data retrieved successfully", analytics)
}

// Export Data
func (h *AdminHandler) ExportData(c *gin.Context) {
	var req struct {
		Type     string `json:"type" binding:"required"`
		Format   string `json:"format" binding:"required"`
		DateFrom string `json:"date_from"`
		DateTo   string `json:"date_to"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	// Mock export response
	exportData := map[string]interface{}{
		"export_id":   primitive.NewObjectID().Hex(),
		"type":        req.Type,
		"format":      req.Format,
		"status":      "processing",
		"created_at":  time.Now(),
		"download_url": "",
	}

	utils.SuccessResponse(c, http.StatusOK, "Export request created successfully", exportData)
}

// Premium Management
func (h *AdminHandler) GetAllSubscriptions(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	status := c.Query("status")

	filter := bson.M{}
	if status != "" && status != "all" {
		filter["status"] = status
	}

	page, limit, totalPages, offset := utils.CalculatePagination(page, limit, 0)

	total, _ := config.Coll.PremiumMemberships.CountDocuments(ctx, filter)
	_, _, totalPages, _ = utils.CalculatePagination(page, limit, total)

	findOptions := options.Find().
		SetSkip(int64(offset)).
		SetLimit(int64(limit)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := config.Coll.PremiumMemberships.Find(ctx, filter, findOptions)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch subscriptions", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var subscriptions []models.Subscription
	if err = cursor.All(ctx, &subscriptions); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to decode subscriptions", err.Error())
		return
	}

	meta := &utils.Meta{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}

	utils.SuccessResponseWithMeta(c, http.StatusOK, "Subscriptions retrieved successfully", subscriptions, meta)
}

func (h *AdminHandler) UpdateSubscriptionStatus(c *gin.Context) {
	subscriptionID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(subscriptionID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid subscription ID", nil)
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
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
			"status":     req.Status,
			"updated_at": time.Now(),
		},
	}

	if req.Status == "cancelled" || req.Status == "suspended" {
		now := time.Now()
		update["$set"].(bson.M)["cancelled_at"] = &now
		if req.Reason != "" {
			update["$set"].(bson.M)["cancellation_reason"] = req.Reason
		}
	}

	_, err = config.Coll.PremiumMemberships.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to update subscription status", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Subscription status updated successfully", nil)
}

func (h *AdminHandler) GetPremiumAnalytics(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get total premium users
	totalPremium, _ := config.Coll.PremiumMemberships.CountDocuments(ctx, bson.M{"status": "active"})
	
	// Get monthly revenue from subscriptions
	monthStart := time.Now().AddDate(0, -1, 0)
	monthlyRevenue, _ := config.Coll.PremiumMemberships.CountDocuments(ctx, bson.M{
		"created_at": bson.M{"$gte": monthStart},
		"status": "active",
	})

	// Mock additional analytics
	analytics := map[string]interface{}{
		"total_premium_users": totalPremium,
		"monthly_revenue": monthlyRevenue * 2500, // Assuming average plan price
		"conversion_rate": 3.2,
		"churn_rate": 1.8,
		"plan_distribution": map[string]interface{}{
			"monthly": 65,
			"yearly": 35,
		},
		"top_features": []map[string]interface{}{
			{"name": "Priority Listings", "usage": 89},
			{"name": "Advanced Analytics", "usage": 76},
			{"name": "VIP Support", "usage": 45},
		},
	}

	utils.SuccessResponse(c, http.StatusOK, "Premium analytics retrieved successfully", analytics)
}