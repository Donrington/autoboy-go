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

type WishlistHandler struct{}

func NewWishlistHandler() *WishlistHandler {
	return &WishlistHandler{}
}

func (h *WishlistHandler) GetWishlist(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := []bson.M{
		{"$match": bson.M{"user_id": userObjID}},
		{"$lookup": bson.M{
			"from":         "products",
			"localField":   "product_ids",
			"foreignField": "_id",
			"as":           "products",
		}},
		{"$unwind": "$products"},
		{"$match": bson.M{"products.status": models.ProductStatusActive}},
		{"$lookup": bson.M{
			"from":         "users",
			"localField":   "products.seller_id",
			"foreignField": "_id",
			"as":           "seller",
		}},
		{"$unwind": "$seller"},
		{"$project": bson.M{
			"product": "$products",
			"seller":  bson.M{
				"id":   "$seller._id",
				"name": bson.M{"$concat": []string{"$seller.profile.first_name", " ", "$seller.profile.last_name"}},
			},
			"added_at": "$created_at",
		}},
	}

	cursor, err := config.Coll.Wishlists.Aggregate(ctx, pipeline)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch wishlist", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var wishlistItems []bson.M
	cursor.All(ctx, &wishlistItems)

	utils.SuccessResponse(c, http.StatusOK, "Wishlist retrieved successfully", wishlistItems)
}

func (h *WishlistHandler) AddToWishlist(c *gin.Context) {
	var req struct {
		ProductID string `json:"product_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))
	productObjID, _ := primitive.ObjectIDFromHex(req.ProductID)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if product exists
	var product models.Product
	err := config.Coll.Products.FindOne(ctx, bson.M{
		"_id":    productObjID,
		"status": models.ProductStatusActive,
	}).Decode(&product)

	if err != nil {
		utils.NotFoundResponse(c, "Product not found")
		return
	}

	// Find or create wishlist
	var wishlist models.ProductWishlist
	err = config.Coll.Wishlists.FindOne(ctx, bson.M{"user_id": userObjID}).Decode(&wishlist)

	if err != nil {
		// Create new wishlist
		wishlist = models.ProductWishlist{
			ID:         primitive.NewObjectID(),
			UserID:     userObjID,
			ProductIDs: []primitive.ObjectID{productObjID},
			Name:       "My Wishlist",
			IsPublic:   false,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}
		config.Coll.Wishlists.InsertOne(ctx, wishlist)
	} else {
		// Check if product already in wishlist
		for _, pid := range wishlist.ProductIDs {
			if pid == productObjID {
				utils.BadRequestResponse(c, "Product already in wishlist", nil)
				return
			}
		}

		// Add product to existing wishlist
		config.Coll.Wishlists.UpdateOne(ctx,
			bson.M{"_id": wishlist.ID},
			bson.M{
				"$push": bson.M{"product_ids": productObjID},
				"$set":  bson.M{"updated_at": time.Now()},
			},
		)
	}

	utils.SuccessResponse(c, http.StatusOK, "Product added to wishlist", nil)
}

func (h *WishlistHandler) RemoveFromWishlist(c *gin.Context) {
	productID := c.Param("id")
	productObjID, _ := primitive.ObjectIDFromHex(productID)
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := config.Coll.Wishlists.UpdateOne(ctx,
		bson.M{"user_id": userObjID},
		bson.M{
			"$pull": bson.M{"product_ids": productObjID},
			"$set":  bson.M{"updated_at": time.Now()},
		},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to remove from wishlist", err.Error())
		return
	}

	if result.MatchedCount == 0 {
		utils.NotFoundResponse(c, "Wishlist not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Product removed from wishlist", nil)
}