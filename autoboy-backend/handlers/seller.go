package handlers

import (
	"context"
	"net/http"
	"time"

	"autoboy-backend/config"
	"autoboy-backend/models"
	"autoboy-backend/services"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SellerHandler struct{
	emailService *services.EmailService
}

func NewSellerHandler(emailService *services.EmailService) *SellerHandler {
	return &SellerHandler{
		emailService: emailService,
	}
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

	// Calculate total earnings from completed orders
	earningsPipeline := []bson.M{
		{"$match": bson.M{
			"seller_id": sellerObjID,
			"status": bson.M{"$in": []string{"delivered", "completed"}},
		}},
		{"$group": bson.M{
			"_id": nil,
			"total_earnings": bson.M{"$sum": "$total_amount"},
		}},
	}
	earningsCursor, _ := config.Coll.Orders.Aggregate(ctx, earningsPipeline)
	var earningsResult []bson.M
	earningsCursor.All(ctx, &earningsResult)
	earningsCursor.Close(ctx)

	totalEarnings := 0.0
	if len(earningsResult) > 0 {
		if earnings, ok := earningsResult[0]["total_earnings"].(float64); ok {
			totalEarnings = earnings
		}
	}

	// Recent orders
	opts := options.Find().SetLimit(5).SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, _ := config.Coll.Orders.Find(ctx, bson.M{"seller_id": sellerObjID}, opts)
	var recentOrders []models.Order
	cursor.All(ctx, &recentOrders)

	// Get weekly sales data for chart
	weeklySalesPipeline := []bson.M{
		{"$match": bson.M{
			"seller_id": sellerObjID,
			"created_at": bson.M{"$gte": time.Now().AddDate(0, 0, -7)},
		}},
		{"$group": bson.M{
			"_id": bson.M{"$dayOfWeek": "$created_at"},
			"daily_sales": bson.M{"$sum": "$total_amount"},
		}},
		{"$sort": bson.M{"_id": 1}},
	}
	weeklyCursor, _ := config.Coll.Orders.Aggregate(ctx, weeklySalesPipeline)
	var weeklyData []bson.M
	weeklyCursor.All(ctx, &weeklyData)
	weeklyCursor.Close(ctx)

	// Convert to chart format
	labels := []string{"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"}
	data := make([]float64, 7)
	for _, day := range weeklyData {
		if dayOfWeek, ok := day["_id"].(int32); ok {
			if sales, ok := day["daily_sales"].(float64); ok {
				data[dayOfWeek-1] = sales
			}
		}
	}

	dashboard := map[string]interface{}{
		"stats": map[string]interface{}{
			"total_products":  totalProducts,
			"active_products": activeProducts,
			"pending_orders":  pendingOrders,
			"total_earnings":  totalEarnings,
		},
		"recent_orders": recentOrders,
		"sales_chart": map[string]interface{}{
			"labels": labels,
			"data":   data,
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
	sellerObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Calculate total sales and revenue
	totalsPipeline := []bson.M{
		{"$match": bson.M{
			"seller_id": sellerObjID,
			"status": bson.M{"$in": []string{"delivered", "completed"}},
		}},
		{"$group": bson.M{
			"_id": nil,
			"total_sales": bson.M{"$sum": 1},
			"total_revenue": bson.M{"$sum": "$total_amount"},
		}},
	}
	totalsCursor, _ := config.Coll.Orders.Aggregate(ctx, totalsPipeline)
	var totalsResult []bson.M
	totalsCursor.All(ctx, &totalsResult)
	totalsCursor.Close(ctx)

	totalSales := 0
	totalRevenue := 0.0
	if len(totalsResult) > 0 {
		if sales, ok := totalsResult[0]["total_sales"].(int32); ok {
			totalSales = int(sales)
		}
		if revenue, ok := totalsResult[0]["total_revenue"].(float64); ok {
			totalRevenue = revenue
		}
	}

	// Get user rating
	user, _ := c.Get("user")
	currentUser := user.(*models.User)
	averageRating := currentUser.Profile.Rating

	// Monthly sales data
	monthlySalesPipeline := []bson.M{
		{"$match": bson.M{
			"seller_id": sellerObjID,
			"status": bson.M{"$in": []string{"delivered", "completed"}},
			"created_at": bson.M{"$gte": time.Now().AddDate(0, -6, 0)},
		}},
		{"$group": bson.M{
			"_id": bson.M{
				"year": bson.M{"$year": "$created_at"},
				"month": bson.M{"$month": "$created_at"},
			},
			"sales": bson.M{"$sum": 1},
			"revenue": bson.M{"$sum": "$total_amount"},
		}},
		{"$sort": bson.M{"_id.year": 1, "_id.month": 1}},
	}
	monthlyCursor, _ := config.Coll.Orders.Aggregate(ctx, monthlySalesPipeline)
	var monthlyData []bson.M
	monthlyCursor.All(ctx, &monthlyData)
	monthlyCursor.Close(ctx)

	// Top products
	topProductsPipeline := []bson.M{
		{"$match": bson.M{"seller_id": sellerObjID}},
		{"$lookup": bson.M{
			"from": "orders",
			"let": bson.M{"product_id": "$_id"},
			"pipeline": []bson.M{
				{"$match": bson.M{
					"$expr": bson.M{"$in": []interface{}{"$$product_id", "$items.product_id"}},
					"status": bson.M{"$in": []string{"delivered", "completed"}},
				}},
			},
			"as": "orders",
		}},
		{"$addFields": bson.M{
			"sales_count": bson.M{"$size": "$orders"},
			"revenue": bson.M{"$multiply": []interface{}{bson.M{"$size": "$orders"}, "$price"}},
		}},
		{"$match": bson.M{"sales_count": bson.M{"$gt": 0}}},
		{"$sort": bson.M{"sales_count": -1}},
		{"$limit": 3},
		{"$project": bson.M{
			"name": "$title",
			"sales": "$sales_count",
			"revenue": "$revenue",
		}},
	}
	topProductsCursor, _ := config.Coll.Products.Aggregate(ctx, topProductsPipeline)
	var topProducts []bson.M
	topProductsCursor.All(ctx, &topProducts)
	topProductsCursor.Close(ctx)

	analytics := map[string]interface{}{
		"total_sales": totalSales,
		"total_revenue": totalRevenue,
		"average_rating": averageRating,
		"conversion_rate": 0.0, // Would need view tracking to calculate
		"monthly_sales": monthlyData,
		"top_products": topProducts,
	}

	utils.SuccessResponse(c, http.StatusOK, "Sales analytics retrieved successfully", analytics)
}

func (h *SellerHandler) GetProductAnalytics(c *gin.Context) {
	userID, _ := c.Get("user_id")
	sellerObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Get product analytics from database
	productsPipeline := []bson.M{
		{"$match": bson.M{"seller_id": sellerObjID}},
		{"$group": bson.M{
			"_id": nil,
			"total_views": bson.M{"$sum": "$view_count"},
			"total_likes": bson.M{"$sum": "$like_count"},
			"total_shares": bson.M{"$sum": "$share_count"},
		}},
	}
	productsCursor, _ := config.Coll.Products.Aggregate(ctx, productsPipeline)
	var productsResult []bson.M
	productsCursor.All(ctx, &productsResult)
	productsCursor.Close(ctx)

	totalViews := 0
	totalLikes := 0
	totalShares := 0
	if len(productsResult) > 0 {
		if views, ok := productsResult[0]["total_views"].(int32); ok {
			totalViews = int(views)
		}
		if likes, ok := productsResult[0]["total_likes"].(int32); ok {
			totalLikes = int(likes)
		}
		if shares, ok := productsResult[0]["total_shares"].(int32); ok {
			totalShares = int(shares)
		}
	}

	// Get total inquiries (questions)
	totalInquiries, _ := config.Coll.ProductQuestions.CountDocuments(ctx, bson.M{
		"product_id": bson.M{"$in": []primitive.ObjectID{}}, // Would need to get product IDs first
	})

	// Get top performing products
	performancePipeline := []bson.M{
		{"$match": bson.M{"seller_id": sellerObjID}},
		{"$sort": bson.M{"view_count": -1}},
		{"$limit": 3},
		{"$project": bson.M{
			"product": "$title",
			"views": "$view_count",
			"likes": "$like_count",
			"inquiries": 0, // Would need to lookup questions
		}},
	}
	performanceCursor, _ := config.Coll.Products.Aggregate(ctx, performancePipeline)
	var performance []bson.M
	performanceCursor.All(ctx, &performance)
	performanceCursor.Close(ctx)

	analytics := map[string]interface{}{
		"total_views": totalViews,
		"total_likes": totalLikes,
		"total_shares": totalShares,
		"total_inquiries": totalInquiries,
		"performance": performance,
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

	// Get user info for email
	var user models.User
	config.Coll.Users.FindOne(ctx, bson.M{"_id": objID}).Decode(&user)

	// Send seller application confirmation email
	go h.emailService.SendSellerApplicationEmail(user.Email, user.Profile.FirstName)

	utils.SuccessResponse(c, http.StatusOK, "Seller application submitted successfully", nil)
}

func (h *SellerHandler) GetProducts(c *gin.Context) {
	userID, _ := c.Get("user_id")
	sellerObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.Coll.Products.Find(ctx, bson.M{"seller_id": sellerObjID})
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch products", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	cursor.All(ctx, &products)

	utils.SuccessResponse(c, http.StatusOK, "Products retrieved successfully", products)
}