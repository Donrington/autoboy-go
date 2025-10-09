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
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID        primitive.ObjectID `bson:"user_id" json:"user_id"`
	ProductID     primitive.ObjectID `bson:"product_id" json:"product_id"`
	Quantity      int                `bson:"quantity" json:"quantity"`
	Price         float64            `bson:"price" json:"price"`
	SavedForLater bool               `bson:"saved_for_later" json:"saved_for_later"`
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt     time.Time          `bson:"updated_at" json:"updated_at"`
	Product       *models.Product    `bson:"product,omitempty" json:"product,omitempty"`
}

type PromoCode struct {
	Code        string    `bson:"code" json:"code"`
	Type        string    `bson:"type" json:"type"` // percentage, fixed, shipping
	Discount    float64   `bson:"discount" json:"discount"`
	Description string    `bson:"description" json:"description"`
	MinAmount   float64   `bson:"min_amount" json:"min_amount"`
	MaxDiscount float64   `bson:"max_discount" json:"max_discount"`
	ExpiresAt   time.Time `bson:"expires_at" json:"expires_at"`
	IsActive    bool      `bson:"is_active" json:"is_active"`
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

	// Calculate tax (7.5% VAT)
	taxRate := 0.075
	taxAmount := subtotal * taxRate

	// Calculate shipping (flat rate for now)
	shippingCost := 0.0
	if subtotal > 0 && subtotal < 50000 {
		shippingCost = 2500.0
	}

	total := subtotal + taxAmount + shippingCost

	response := map[string]interface{}{
		"items":        cartItems,
		"subtotal":     subtotal,
		"tax_amount":   taxAmount,
		"shipping_cost": shippingCost,
		"total":        total,
		"count":        len(cartItems),
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

	// Stock validation
	if product.Quantity < req.Quantity {
		utils.BadRequestResponse(c, "Insufficient stock", gin.H{
			"available_stock": product.Quantity,
			"requested": req.Quantity,
		})
		return
	}

	// Check if seller is active
	var seller models.User
	err = config.Coll.Users.FindOne(ctx, bson.M{
		"_id": product.SellerID,
		"status": "active",
	}).Decode(&seller)
	if err != nil {
		utils.BadRequestResponse(c, "Product seller is not available", nil)
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

// SaveForLater moves item from cart to saved items
func (h *CartHandler) SaveForLater(c *gin.Context) {
	itemID := c.Param("id")
	itemObjID, _ := primitive.ObjectIDFromHex(itemID)
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Move to saved_items collection
	var cartItem CartItem
	err := config.Coll.CartItems.FindOne(ctx, bson.M{
		"_id": itemObjID,
		"user_id": userObjID,
	}).Decode(&cartItem)

	if err != nil {
		utils.NotFoundResponse(c, "Cart item not found")
		return
	}

	// Insert into saved items
	savedItem := bson.M{
		"_id": primitive.NewObjectID(),
		"user_id": cartItem.UserID,
		"product_id": cartItem.ProductID,
		"quantity": cartItem.Quantity,
		"price": cartItem.Price,
		"saved_at": time.Now(),
	}

	_, err = utils.DB.Collection("saved_items").InsertOne(ctx, savedItem)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to save item", err.Error())
		return
	}

	// Remove from cart
	_, err = config.Coll.CartItems.DeleteOne(ctx, bson.M{"_id": itemObjID})
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to remove from cart", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Item saved for later", nil)
}

// GetSavedItems gets user's saved for later items
func (h *CartHandler) GetSavedItems(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := []bson.M{
		{"$match": bson.M{"user_id": userObjID}},
		{"$lookup": bson.M{
			"from": "products",
			"localField": "product_id",
			"foreignField": "_id",
			"as": "product",
		}},
		{"$unwind": "$product"},
	}

	cursor, err := utils.DB.Collection("saved_items").Aggregate(ctx, pipeline)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch saved items", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var savedItems []bson.M
	cursor.All(ctx, &savedItems)

	utils.SuccessResponse(c, http.StatusOK, "Saved items retrieved", savedItems)
}

// MoveToCart moves item from saved to cart
func (h *CartHandler) MoveToCart(c *gin.Context) {
	itemID := c.Param("id")
	itemObjID, _ := primitive.ObjectIDFromHex(itemID)
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get saved item
	var savedItem bson.M
	err := utils.DB.Collection("saved_items").FindOne(ctx, bson.M{
		"_id": itemObjID,
		"user_id": userObjID,
	}).Decode(&savedItem)

	if err != nil {
		utils.NotFoundResponse(c, "Saved item not found")
		return
	}

	// Add to cart
	cartItem := CartItem{
		ID: primitive.NewObjectID(),
		UserID: userObjID,
		ProductID: savedItem["product_id"].(primitive.ObjectID),
		Quantity: int(savedItem["quantity"].(int32)),
		Price: savedItem["price"].(float64),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = config.Coll.CartItems.InsertOne(ctx, cartItem)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to move to cart", err.Error())
		return
	}

	// Remove from saved items
	_, err = utils.DB.Collection("saved_items").DeleteOne(ctx, bson.M{"_id": itemObjID})
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to remove from saved items", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Item moved to cart", nil)
}

// ValidateCart validates cart items for stock and availability
func (h *CartHandler) ValidateCart(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := []bson.M{
		{"$match": bson.M{"user_id": userObjID}},
		{"$lookup": bson.M{
			"from": "products",
			"localField": "product_id",
			"foreignField": "_id",
			"as": "product",
		}},
		{"$unwind": "$product"},
	}

	cursor, err := config.Coll.CartItems.Aggregate(ctx, pipeline)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to validate cart", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var cartItems []CartItem
	cursor.All(ctx, &cartItems)

	var validItems []CartItem
	var invalidItems []map[string]interface{}

	for _, item := range cartItems {
		if item.Product.Status != models.ProductStatusActive {
			invalidItems = append(invalidItems, map[string]interface{}{
				"item_id": item.ID,
				"product_id": item.ProductID,
				"reason": "Product is no longer available",
			})
		} else if item.Product.Quantity < item.Quantity {
			invalidItems = append(invalidItems, map[string]interface{}{
				"item_id": item.ID,
				"product_id": item.ProductID,
				"reason": "Insufficient stock",
				"available_stock": item.Product.Quantity,
				"requested": item.Quantity,
			})
		} else {
			validItems = append(validItems, item)
		}
	}

	response := map[string]interface{}{
		"valid_items": validItems,
		"invalid_items": invalidItems,
		"is_valid": len(invalidItems) == 0,
	}

	utils.SuccessResponse(c, http.StatusOK, "Cart validation completed", response)
}

// GetAbandonedCarts gets abandoned cart analytics
func (h *CartHandler) GetAbandonedCarts(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find carts abandoned for more than 24 hours
	abandonedThreshold := time.Now().Add(-24 * time.Hour)

	pipeline := []bson.M{
		{"$match": bson.M{
			"user_id": userObjID,
			"updated_at": bson.M{"$lt": abandonedThreshold},
		}},
		{"$lookup": bson.M{
			"from": "products",
			"localField": "product_id",
			"foreignField": "_id",
			"as": "product",
		}},
		{"$unwind": "$product"},
		{"$group": bson.M{
			"_id": "$user_id",
			"items": bson.M{"$push": "$$ROOT"},
			"total_value": bson.M{"$sum": bson.M{"$multiply": []interface{}{"$price", "$quantity"}}},
			"item_count": bson.M{"$sum": 1},
			"last_updated": bson.M{"$max": "$updated_at"},
		}},
	}

	cursor, err := config.Coll.CartItems.Aggregate(ctx, pipeline)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch abandoned carts", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var abandonedCarts []bson.M
	cursor.All(ctx, &abandonedCarts)

	response := map[string]interface{}{
		"abandoned_carts": abandonedCarts,
		"count": len(abandonedCarts),
	}

	utils.SuccessResponse(c, http.StatusOK, "Abandoned carts retrieved", response)
}

// ApplyPromoCode applies a promo code to the cart
func (h *CartHandler) ApplyPromoCode(c *gin.Context) {
	var req struct {
		Code string `json:"code" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	// Validate promo code
	promoCode := h.validatePromoCode(req.Code)
	if promoCode == nil {
		utils.BadRequestResponse(c, "Invalid or expired promo code", nil)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get cart total
	pipeline := []bson.M{
		{"$match": bson.M{"user_id": userObjID}},
		{"$lookup": bson.M{
			"from":         "products",
			"localField":   "product_id",
			"foreignField": "_id",
			"as":           "product",
		}},
		{"$unwind": "$product"},
		{"$group": bson.M{
			"_id": nil,
			"subtotal": bson.M{"$sum": bson.M{"$multiply": []interface{}{"$price", "$quantity"}}},
		}},
	}

	cursor, err := config.Coll.CartItems.Aggregate(ctx, pipeline)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to calculate cart total", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var result []bson.M
	cursor.All(ctx, &result)

	if len(result) == 0 {
		utils.BadRequestResponse(c, "Cart is empty", nil)
		return
	}

	subtotal := result[0]["subtotal"].(float64)

	// Check minimum amount
	if subtotal < promoCode.MinAmount {
		utils.BadRequestResponse(c, "Minimum order amount not met", gin.H{
			"required": promoCode.MinAmount,
			"current": subtotal,
		})
		return
	}

	// Calculate discount
	discount := h.calculateDiscount(subtotal, promoCode)

	// Store promo code application (you might want to create a separate collection)
	utils.SuccessResponse(c, http.StatusOK, "Promo code applied successfully", gin.H{
		"code": promoCode.Code,
		"discount": discount,
		"description": promoCode.Description,
	})
}

// Helper function to validate promo code
func (h *CartHandler) validatePromoCode(code string) *PromoCode {
	promoCodes := map[string]*PromoCode{
		"SAVE10": {
			Code:        "SAVE10",
			Type:        "percentage",
			Discount:    0.1,
			Description: "10% off your order",
			MinAmount:   10000,
			MaxDiscount: 50000,
			ExpiresAt:   time.Now().AddDate(0, 1, 0),
			IsActive:    true,
		},
		"WELCOME": {
			Code:        "WELCOME",
			Type:        "fixed",
			Discount:    5000,
			Description: "₦5,000 off your first order",
			MinAmount:   20000,
			MaxDiscount: 5000,
			ExpiresAt:   time.Now().AddDate(0, 1, 0),
			IsActive:    true,
		},
		"FREESHIP": {
			Code:        "FREESHIP",
			Type:        "shipping",
			Discount:    0,
			Description: "Free shipping",
			MinAmount:   0,
			MaxDiscount: 2500,
			ExpiresAt:   time.Now().AddDate(0, 1, 0),
			IsActive:    true,
		},
	}

	promoCode, exists := promoCodes[code]
	if !exists || !promoCode.IsActive || time.Now().After(promoCode.ExpiresAt) {
		return nil
	}

	return promoCode
}

// Helper function to calculate discount
func (h *CartHandler) calculateDiscount(subtotal float64, promoCode *PromoCode) float64 {
	switch promoCode.Type {
	case "percentage":
		discount := subtotal * promoCode.Discount
		if promoCode.MaxDiscount > 0 && discount > promoCode.MaxDiscount {
			return promoCode.MaxDiscount
		}
		return discount
	case "fixed":
		return promoCode.Discount
	case "shipping":
		return promoCode.MaxDiscount // shipping cost
	default:
		return 0
	}
}