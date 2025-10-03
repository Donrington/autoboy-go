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
)

type OrderHandler struct {
	paymentService *services.PaymentService
	emailService   *services.EmailService
}

func NewOrderHandler(paymentService *services.PaymentService, emailService *services.EmailService) *OrderHandler {
	return &OrderHandler{
		paymentService: paymentService,
		emailService:   emailService,
	}
}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	var req struct {
		Items []struct {
			ProductID string `json:"product_id" binding:"required"`
			Quantity  int    `json:"quantity" binding:"required,min=1"`
		} `json:"items" binding:"required,min=1"`
		ShippingAddress models.Address `json:"shipping_address" binding:"required"`
		PaymentMethod   string         `json:"payment_method" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	buyerID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Calculate order total and validate products
	var orderItems []models.OrderItem
	var subtotal float64
	var sellerID primitive.ObjectID

	for _, item := range req.Items {
		productObjID, err := primitive.ObjectIDFromHex(item.ProductID)
		if err != nil {
			utils.BadRequestResponse(c, "Invalid product ID", nil)
			return
		}

		var product models.Product
		err = config.Coll.Products.FindOne(ctx, bson.M{
			"_id":    productObjID,
			"status": models.ProductStatusActive,
		}).Decode(&product)

		if err != nil {
			utils.BadRequestResponse(c, "Product not found or inactive", nil)
			return
		}

		if product.Quantity < item.Quantity {
			utils.BadRequestResponse(c, "Insufficient product quantity", nil)
			return
		}

		// Set seller ID from first product (assuming single seller per order)
		if len(orderItems) == 0 {
			sellerID = product.SellerID
		} else if sellerID != product.SellerID {
			utils.BadRequestResponse(c, "Cannot order from multiple sellers in one order", nil)
			return
		}

		totalPrice := product.Price * float64(item.Quantity)
		subtotal += totalPrice

		orderItem := models.OrderItem{
			ID:           primitive.NewObjectID(),
			ProductID:    productObjID,
			ProductTitle: product.Title,
			Quantity:     item.Quantity,
			UnitPrice:    product.Price,
			TotalPrice:   totalPrice,
			Currency:     product.Currency,
			Status:       models.OrderStatusPending,
			ProductSnapshot: models.ProductSnapshot{
				Title:       product.Title,
				Description: product.Description,
				Brand:       product.Brand,
				Model:       product.Model,
				Condition:   product.Condition,
				CategoryID:  product.CategoryID,
			},
		}

		if len(product.Images) > 0 {
			orderItem.ProductImage = product.Images[0].URL
		}

		orderItems = append(orderItems, orderItem)
	}

	// Create order
	order := models.Order{
		ID:              primitive.NewObjectID(),
		OrderNumber:     utils.GenerateOrderNumber(),
		BuyerID:         buyerID,
		SellerID:        sellerID,
		Items:           orderItems,
		SubtotalAmount:  subtotal,
		ShippingAmount:  0, // Calculate based on location
		TaxAmount:       0, // Calculate based on location
		DiscountAmount:  0,
		TotalAmount:     subtotal,
		Currency:        "NGN",
		Status:          models.OrderStatusPending,
		PaymentStatus:   models.PaymentStatusPending,
		ShippingAddress: req.ShippingAddress,
		BillingAddress:  req.ShippingAddress,
		PaymentMethod:   req.PaymentMethod,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Insert order
	_, err := config.Coll.Orders.InsertOne(ctx, order)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create order", err.Error())
		return
	}

	// Update product quantities
	for _, item := range req.Items {
		productObjID, _ := primitive.ObjectIDFromHex(item.ProductID)
		config.Coll.Products.UpdateOne(ctx,
			bson.M{"_id": productObjID},
			bson.M{"$inc": bson.M{"quantity": -item.Quantity}},
		)
	}

	// Clear cart items for this user
	config.Coll.CartItems.DeleteMany(ctx, bson.M{"user_id": buyerID})

	// Send order confirmation email
	var buyer models.User
	config.Coll.Users.FindOne(ctx, bson.M{"_id": buyerID}).Decode(&buyer)
	go h.emailService.SendOrderConfirmationEmail(
		buyer.Email,
		buyer.Profile.FirstName,
		order.OrderNumber,
		order.TotalAmount,
	)

	utils.CreatedResponse(c, "Order created successfully", order)
}

func (h *OrderHandler) GetUserOrders(c *gin.Context) {
	userID, _ := c.Get("user_id")
	buyerID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.Coll.Orders.Find(ctx, bson.M{"buyer_id": buyerID})
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch orders", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var orders []models.Order
	if err = cursor.All(ctx, &orders); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to decode orders", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Orders retrieved successfully", orders)
}

func (h *OrderHandler) GetOrder(c *gin.Context) {
	orderID := c.Param("id")
	orderObjID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid order ID", nil)
		return
	}

	userID, _ := c.Get("user_id")
	buyerID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var order models.Order
	err = config.Coll.Orders.FindOne(ctx, bson.M{
		"_id":      orderObjID,
		"buyer_id": buyerID,
	}).Decode(&order)

	if err != nil {
		utils.NotFoundResponse(c, "Order not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Order retrieved successfully", order)
}

func (h *OrderHandler) CancelOrder(c *gin.Context) {
	orderID := c.Param("id")
	orderObjID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid order ID", nil)
		return
	}

	userID, _ := c.Get("user_id")
	buyerID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := config.Coll.Orders.UpdateOne(ctx,
		bson.M{
			"_id":      orderObjID,
			"buyer_id": buyerID,
			"status":   bson.M{"$in": []models.OrderStatus{models.OrderStatusPending, models.OrderStatusConfirmed}},
		},
		bson.M{
			"$set": bson.M{
				"status":       models.OrderStatusCancelled,
				"cancelled_at": time.Now(),
				"cancelled_by": buyerID,
				"updated_at":   time.Now(),
			},
		},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to cancel order", err.Error())
		return
	}

	if result.MatchedCount == 0 {
		utils.BadRequestResponse(c, "Order cannot be cancelled or not found", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Order cancelled successfully", nil)
}

func (h *OrderHandler) RequestReturn(c *gin.Context) {
	var req struct {
		Reason      string `json:"reason" binding:"required"`
		Description string `json:"description" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	orderID := c.Param("id")
	orderObjID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid order ID", nil)
		return
	}

	userID, _ := c.Get("user_id")
	buyerID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Create return request
	returnRequest := models.OrderReturn{
		ID:          primitive.NewObjectID(),
		OrderID:     orderObjID,
		RequestedBy: buyerID,
		Reason:      req.Reason,
		Description: req.Description,
		ReturnType:  "return",
		Status:      models.ReturnStatusRequested,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	_, err = config.Coll.OrderReturns.InsertOne(ctx, returnRequest)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create return request", err.Error())
		return
	}

	utils.CreatedResponse(c, "Return request submitted successfully", returnRequest)
}

func (h *OrderHandler) GetSellerOrders(c *gin.Context) {
	userID, _ := c.Get("user_id")
	sellerID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.Coll.Orders.Find(ctx, bson.M{"seller_id": sellerID})
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch orders", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var orders []models.Order
	if err = cursor.All(ctx, &orders); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to decode orders", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Seller orders retrieved successfully", orders)
}

func (h *OrderHandler) GetSellerOrder(c *gin.Context) {
	orderID := c.Param("id")
	orderObjID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid order ID", nil)
		return
	}

	userID, _ := c.Get("user_id")
	sellerID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var order models.Order
	err = config.Coll.Orders.FindOne(ctx, bson.M{
		"_id":       orderObjID,
		"seller_id": sellerID,
	}).Decode(&order)

	if err != nil {
		utils.NotFoundResponse(c, "Order not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Seller order retrieved successfully", order)
}

func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	orderID := c.Param("id")
	orderObjID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid order ID", nil)
		return
	}

	userID, _ := c.Get("user_id")
	sellerID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"status":     models.OrderStatus(req.Status),
			"updated_at": time.Now(),
		},
	}

	// Add timestamp for specific statuses
	switch req.Status {
	case string(models.OrderStatusConfirmed):
		update["$set"].(bson.M)["confirmed_at"] = time.Now()
	case string(models.OrderStatusProcessing):
		update["$set"].(bson.M)["processed_at"] = time.Now()
	case string(models.OrderStatusShipped):
		update["$set"].(bson.M)["shipped_at"] = time.Now()
	case string(models.OrderStatusDelivered):
		update["$set"].(bson.M)["delivered_at"] = time.Now()
	}

	result, err := config.Coll.Orders.UpdateOne(ctx,
		bson.M{
			"_id":       orderObjID,
			"seller_id": sellerID,
		},
		update,
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to update order status", err.Error())
		return
	}

	if result.MatchedCount == 0 {
		utils.NotFoundResponse(c, "Order not found")
		return
	}

	// Get order and buyer info for email notification
	var order models.Order
	config.Coll.Orders.FindOne(ctx, bson.M{"_id": orderObjID}).Decode(&order)
	var buyer models.User
	config.Coll.Users.FindOne(ctx, bson.M{"_id": order.BuyerID}).Decode(&buyer)

	// Send order status update email
	go h.emailService.SendOrderStatusEmail(
		buyer.Email,
		buyer.Profile.FirstName,
		order.OrderNumber,
		req.Status,
	)

	utils.SuccessResponse(c, http.StatusOK, "Order status updated successfully", nil)
}

func (h *OrderHandler) ShipOrder(c *gin.Context) {
	var req struct {
		TrackingNumber string `json:"tracking_number" binding:"required"`
		CarrierName    string `json:"carrier_name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	orderID := c.Param("id")
	orderObjID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid order ID", nil)
		return
	}

	userID, _ := c.Get("user_id")
	sellerID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := config.Coll.Orders.UpdateOne(ctx,
		bson.M{
			"_id":       orderObjID,
			"seller_id": sellerID,
		},
		bson.M{
			"$set": bson.M{
				"status":          models.OrderStatusShipped,
				"tracking_number": req.TrackingNumber,
				"carrier_name":    req.CarrierName,
				"shipped_at":      time.Now(),
				"updated_at":      time.Now(),
			},
		},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to ship order", err.Error())
		return
	}

	if result.MatchedCount == 0 {
		utils.NotFoundResponse(c, "Order not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Order shipped successfully", nil)
}

func (h *OrderHandler) TrackOrder(c *gin.Context) {
	orderID := c.Param("id")
	orderObjID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid order ID", nil)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var order models.Order
	err = config.Coll.Orders.FindOne(ctx, bson.M{"_id": orderObjID}).Decode(&order)
	if err != nil {
		utils.NotFoundResponse(c, "Order not found")
		return
	}

	// Get tracking events
	cursor, err := config.Coll.OrderTracking.Find(ctx, bson.M{"order_id": orderObjID})
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch tracking info", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var trackingEvents []models.OrderTracking
	if err = cursor.All(ctx, &trackingEvents); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to decode tracking events", err.Error())
		return
	}

	response := map[string]interface{}{
		"order":          order,
		"tracking_events": trackingEvents,
	}

	utils.SuccessResponse(c, http.StatusOK, "Order tracking retrieved successfully", response)
}