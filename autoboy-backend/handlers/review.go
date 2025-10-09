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

type ReviewHandler struct{}

func NewReviewHandler() *ReviewHandler {
	return &ReviewHandler{}
}

func (h *ReviewHandler) CreateReview(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var req struct {
		ProductID primitive.ObjectID `json:"product_id" binding:"required"`
		OrderID   primitive.ObjectID `json:"order_id" binding:"required"`
		Rating    int                `json:"rating" binding:"required,min=1,max=5"`
		Title     string             `json:"title"`
		Comment   string             `json:"comment"`
		Images    []string           `json:"images"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	review := models.ProductReview{
		ID:                 primitive.NewObjectID(),
		ProductID:          req.ProductID,
		UserID:             userObjID,
		OrderID:            req.OrderID,
		Rating:             req.Rating,
		Title:              req.Title,
		Comment:            req.Comment,
		Images:             req.Images,
		IsVerifiedPurchase: true,
		IsApproved:         true,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	_, err := config.Coll.ProductReviews.InsertOne(ctx, review)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create review", err.Error())
		return
	}

	utils.CreatedResponse(c, "Review created successfully", review)
}

func (h *ReviewHandler) GetProductReviews(c *gin.Context) {
	productID := c.Param("id")
	productObjID, _ := primitive.ObjectIDFromHex(productID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	skip := (page - 1) * limit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetSkip(int64(skip)).SetLimit(int64(limit)).SetSort(bson.D{{Key: "created_at", Value: -1}})

	filter := bson.M{
		"product_id":  productObjID,
		"is_approved": true,
	}

	var reviews []models.ProductReview
	cursor, err := config.Coll.ProductReviews.Find(ctx, filter, opts)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch reviews", err.Error())
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &reviews); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to decode reviews", err.Error())
		return
	}

	total, _ := config.Coll.ProductReviews.CountDocuments(ctx, filter)

	utils.SuccessResponse(c, http.StatusOK, "Reviews retrieved successfully", gin.H{
		"reviews": reviews,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *ReviewHandler) GetUserReviews(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	skip := (page - 1) * limit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetSkip(int64(skip)).SetLimit(int64(limit)).SetSort(bson.D{{Key: "created_at", Value: -1}})

	var reviews []models.ProductReview
	cursor, err := config.Coll.ProductReviews.Find(ctx, bson.M{"user_id": userObjID}, opts)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch user reviews", err.Error())
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &reviews); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to decode reviews", err.Error())
		return
	}

	total, _ := config.Coll.ProductReviews.CountDocuments(ctx, bson.M{"user_id": userObjID})

	utils.SuccessResponse(c, http.StatusOK, "User reviews retrieved successfully", gin.H{
		"reviews": reviews,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}