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

type TrackingHandler struct{}

func NewTrackingHandler() *TrackingHandler {
	return &TrackingHandler{}
}

func (h *TrackingHandler) GetOrderTracking(c *gin.Context) {
	orderID := c.Param("id")
	orderObjID, _ := primitive.ObjectIDFromHex(orderID)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get order details
	var order models.Order
	err := config.Coll.Orders.FindOne(ctx, bson.M{"_id": orderObjID}).Decode(&order)
	if err != nil {
		utils.NotFoundResponse(c, "Order not found")
		return
	}

	// Get tracking events
	cursor, err := config.Coll.OrderTracking.Find(ctx,
		bson.M{"order_id": orderObjID, "is_public": true},
		options.Find().SetSort(bson.D{{Key: "timestamp", Value: 1}}),
	)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch tracking events", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var events []models.OrderTracking
	cursor.All(ctx, &events)

	// Create timeline with status progression
	timeline := h.createOrderTimeline(order, events)

	utils.SuccessResponse(c, http.StatusOK, "Order tracking retrieved", gin.H{
		"order":    order,
		"events":   events,
		"timeline": timeline,
	})
}

func (h *TrackingHandler) AddTrackingEvent(c *gin.Context) {
	var req struct {
		OrderID     string `json:"order_id" binding:"required"`
		Status      string `json:"status" binding:"required"`
		Location    string `json:"location"`
		Description string `json:"description" binding:"required"`
		IsPublic    bool   `json:"is_public"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))
	orderObjID, _ := primitive.ObjectIDFromHex(req.OrderID)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Verify user can add tracking (seller or admin)
	var order models.Order
	err := config.Coll.Orders.FindOne(ctx, bson.M{
		"_id":       orderObjID,
		"seller_id": userObjID,
	}).Decode(&order)

	if err != nil {
		utils.ForbiddenResponse(c, "Access denied")
		return
	}

	event := models.OrderTracking{
		ID:          primitive.NewObjectID(),
		OrderID:     orderObjID,
		Status:      models.OrderStatus(req.Status),
		Location:    req.Location,
		Description: req.Description,
		Timestamp:   time.Now(),
		CreatedBy:   &userObjID,
		IsPublic:    req.IsPublic,
	}

	_, err = config.Coll.OrderTracking.InsertOne(ctx, event)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to add tracking event", err.Error())
		return
	}

	utils.CreatedResponse(c, "Tracking event added successfully", event)
}

func (h *TrackingHandler) createOrderTimeline(order models.Order, events []models.OrderTracking) []gin.H {
	timeline := []gin.H{}

	// Standard order progression
	statuses := []struct {
		Status      models.OrderStatus
		Title       string
		Description string
	}{
		{models.OrderStatusPending, "Order Placed", "Your order has been received and is being processed"},
		{models.OrderStatusConfirmed, "Order Confirmed", "Your order has been confirmed by the seller"},
		{models.OrderStatusProcessing, "Processing", "Your order is being prepared for shipment"},
		{models.OrderStatusShipped, "Shipped", "Your order has been shipped"},
		{models.OrderStatusDelivered, "Delivered", "Your order has been delivered successfully"},
	}

	for _, status := range statuses {
		timelineItem := gin.H{
			"status":      status.Status,
			"title":       status.Title,
			"description": status.Description,
			"completed":   false,
			"timestamp":   nil,
		}

		// Check if this status has been reached
		switch status.Status {
		case models.OrderStatusPending:
			timelineItem["completed"] = true
			timelineItem["timestamp"] = order.CreatedAt
		case models.OrderStatusConfirmed:
			if order.ConfirmedAt != nil {
				timelineItem["completed"] = true
				timelineItem["timestamp"] = *order.ConfirmedAt
			}
		case models.OrderStatusProcessing:
			if order.ProcessedAt != nil {
				timelineItem["completed"] = true
				timelineItem["timestamp"] = *order.ProcessedAt
			}
		case models.OrderStatusShipped:
			if order.ShippedAt != nil {
				timelineItem["completed"] = true
				timelineItem["timestamp"] = *order.ShippedAt
				if order.TrackingNumber != "" {
					timelineItem["tracking_number"] = order.TrackingNumber
					timelineItem["carrier"] = order.CarrierName
				}
			}
		case models.OrderStatusDelivered:
			if order.DeliveredAt != nil {
				timelineItem["completed"] = true
				timelineItem["timestamp"] = *order.DeliveredAt
			}
		}

		timeline = append(timeline, timelineItem)
	}

	return timeline
}