package handlers

import (
	"net/http"
	"strconv"

	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type NotificationHandler struct{}

func NewNotificationHandler() *NotificationHandler {
	return &NotificationHandler{}
}

// GetNotifications gets user notifications with pagination
func (h *NotificationHandler) GetNotifications(c *gin.Context) {
	userID := c.GetString("user_id")
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	skip := (page - 1) * limit

	userObjID, _ := primitive.ObjectIDFromHex(userID)
	
	filter := bson.M{"user_id": userObjID}
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetSkip(int64(skip)).SetLimit(int64(limit))

	var notifications []models.Notification
	cursor, err := utils.DB.Collection("notifications").Find(c, filter, opts)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch notifications", err.Error())
		return
	}
	defer cursor.Close(c)

	if err = cursor.All(c, &notifications); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode notifications", err.Error())
		return
	}

	// Count total notifications
	total, _ := utils.DB.Collection("notifications").CountDocuments(c, filter)

	utils.SuccessResponse(c, http.StatusOK, "Notifications retrieved successfully", gin.H{
		"notifications": notifications,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// MarkNotificationAsRead marks a notification as read
func (h *NotificationHandler) MarkNotificationAsRead(c *gin.Context) {
	userID := c.GetString("user_id")
	notificationID := c.Param("id")

	userObjID, _ := primitive.ObjectIDFromHex(userID)
	notificationObjID, err := primitive.ObjectIDFromHex(notificationID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid notification ID", err.Error())
		return
	}

	filter := bson.M{"_id": notificationObjID, "user_id": userObjID}
	update := bson.M{"$set": bson.M{"is_read": true, "read_at": primitive.NewDateTimeFromTime(utils.GetCurrentTime())}}

	result, err := utils.DB.Collection("notifications").UpdateOne(c, filter, update)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to mark notification as read", err.Error())
		return
	}

	if result.MatchedCount == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Notification not found", "")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Notification marked as read", nil)
}

// DeleteNotification deletes a notification
func (h *NotificationHandler) DeleteNotification(c *gin.Context) {
	userID := c.GetString("user_id")
	notificationID := c.Param("id")

	userObjID, _ := primitive.ObjectIDFromHex(userID)
	notificationObjID, err := primitive.ObjectIDFromHex(notificationID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid notification ID", err.Error())
		return
	}

	filter := bson.M{"_id": notificationObjID, "user_id": userObjID}
	result, err := utils.DB.Collection("notifications").DeleteOne(c, filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete notification", err.Error())
		return
	}

	if result.DeletedCount == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Notification not found", "")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Notification deleted successfully", nil)
}