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

type CartHandler struct{}

func NewCartHandler() *CartHandler {
	return &CartHandler{}
}

type CartItem struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	ProductID primitive.ObjectID `bson:"product_id" json:"product_id"`
	Quantity  int                `bson:"quantity" json:"quantity"`
	Price     float64            `bson:"price" json:"price"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
	Product   *models.Product    `bson:"product,omitempty" json:"product,omitempty"`
}

func (h *CartHandler) GetCart(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := []bson.M{
		{"$match": bson.M{"user_id": userObjID}},
		{"$lookup": bson.M{
			"from":         "products",
			"localField":   "product_id",
			"foreignField": "_id",
			"as":           "product",
		}},
		{"$unwind": "$product"},
		{"$match": bson.M{"product.status": models.ProductStatusActive}},
	}

	cursor, err := config.Coll.CartItems.Aggregate(ctx, pipeline)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch cart", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var cartItems []CartItem
	if err = cursor.All(ctx, &cartItems); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to decode cart items", err.Error())
		return
	}

	var subtotal float64
	for _, item := range cartItems {
		subtotal += item.Price * float64(item.Quantity)
	}

	response := map[string]interface{}{
		"items":    cartItems,
		"subtotal": subtotal,
		"total":    subtotal,
		"count":    len(cartItems),
	}

	utils.SuccessResponse(c, http.StatusOK, "Cart retrieved successfully", response)
}

func (h *CartHandler) AddToCart(c *gin.Context) {
	var req struct {
		ProductID string `json:"product_id" binding:"required"`
		Quantity  int    `json:"quantity" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))
	productObjID, err := primitive.ObjectIDFromHex(req.ProductID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid product ID", nil)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var product models.Product
	err = config.Coll.Products.FindOne(ctx, bson.M{
		"_id":    productObjID,
		"status": models.ProductStatusActive,
	}).Decode(&product)

	if err != nil {
		utils.NotFoundResponse(c, "Product not found or inactive")
		return
	}

	var existingItem CartItem
	err = config.Coll.CartItems.FindOne(ctx, bson.M{
		"user_id":    userObjID,
		"product_id": productObjID,
	}).Decode(&existingItem)

	if err == nil {
		_, err = config.Coll.CartItems.UpdateOne(ctx,
			bson.M{"_id": existingItem.ID},
			bson.M{
				"$set": bson.M{
					"quantity":   existingItem.Quantity + req.Quantity,
					"updated_at": time.Now(),
				},
			},
		)
	} else {
		cartItem := CartItem{
			ID:        primitive.NewObjectID(),
			UserID:    userObjID,
			ProductID: productObjID,
			Quantity:  req.Quantity,
			Price:     product.Price,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		_, err = config.Coll.CartItems.InsertOne(ctx, cartItem)
	}

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to add item to cart", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Item added to cart successfully", nil)
}

func (h *CartHandler) UpdateCartItem(c *gin.Context) {
	var req struct {
		ItemID   string `json:"item_id" binding:"required"`
		Quantity int    `json:"quantity" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))
	itemObjID, err := primitive.ObjectIDFromHex(req.ItemID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid item ID", nil)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := config.Coll.CartItems.UpdateOne(ctx,
		bson.M{
			"_id":     itemObjID,
			"user_id": userObjID,
		},
		bson.M{
			"$set": bson.M{
				"quantity":   req.Quantity,
				"updated_at": time.Now(),
			},
		},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to update cart item", err.Error())
		return
	}

	if result.MatchedCount == 0 {
		utils.NotFoundResponse(c, "Cart item not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Cart item updated successfully", nil)
}

func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	itemID := c.Param("id")
	itemObjID, err := primitive.ObjectIDFromHex(itemID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid item ID", nil)
		return
	}

	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := config.Coll.CartItems.DeleteOne(ctx, bson.M{
		"_id":     itemObjID,
		"user_id": userObjID,
	})

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to remove cart item", err.Error())
		return
	}

	if result.DeletedCount == 0 {
		utils.NotFoundResponse(c, "Cart item not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Item removed from cart successfully", nil)
}

func (h *CartHandler) ClearCart(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := config.Coll.CartItems.DeleteMany(ctx, bson.M{"user_id": userObjID})
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to clear cart", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Cart cleared successfully", nil)
}