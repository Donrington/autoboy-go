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

// UpdateNotificationPreferences updates user notification preferences
func (h *NotificationHandler) UpdateNotificationPreferences(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var req struct {
		EmailNotifications bool `json:"email_notifications"`
		PushNotifications  bool `json:"push_notifications"`
		SMSNotifications   bool `json:"sms_notifications"`
		OrderUpdates       bool `json:"order_updates"`
		PriceAlerts        bool `json:"price_alerts"`
		Promotions         bool `json:"promotions"`
		NewMessages        bool `json:"new_messages"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	preferences := models.NotificationPreferences{
		UserID:             userObjID,
		EmailNotifications: req.EmailNotifications,
		PushNotifications:  req.PushNotifications,
		SMSNotifications:   req.SMSNotifications,
		OrderUpdates:       req.OrderUpdates,
		PriceAlerts:        req.PriceAlerts,
		Promotions:         req.Promotions,
		NewMessages:        req.NewMessages,
		UpdatedAt:          utils.GetCurrentTime(),
	}

	filter := bson.M{"user_id": userObjID}
	update := bson.M{"$set": preferences}
	opts := options.Update().SetUpsert(true)

	_, err := utils.DB.Collection("notification_preferences").UpdateOne(c, filter, update, opts)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to update preferences", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Notification preferences updated", preferences)
}

// GetNotificationPreferences gets user notification preferences
func (h *NotificationHandler) GetNotificationPreferences(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var preferences models.NotificationPreferences
	err := utils.DB.Collection("notification_preferences").FindOne(c, bson.M{"user_id": userObjID}).Decode(&preferences)

	if err != nil {
		// Return default preferences if not found
		preferences = models.NotificationPreferences{
			UserID:             userObjID,
			EmailNotifications: true,
			PushNotifications:  true,
			SMSNotifications:   false,
			OrderUpdates:       true,
			PriceAlerts:        true,
			Promotions:         false,
			NewMessages:        true,
		}
	}

	utils.SuccessResponse(c, http.StatusOK, "Notification preferences retrieved", preferences)
}

// SendNotification sends a notification to a user
func (h *NotificationHandler) SendNotification(c *gin.Context) {
	var req struct {
		UserID      string                 `json:"user_id" binding:"required"`
		Type        string                 `json:"type" binding:"required"`
		Title       string                 `json:"title" binding:"required"`
		Message     string                 `json:"message" binding:"required"`
		Data        map[string]interface{} `json:"data"`
		SendEmail   bool                   `json:"send_email"`
		SendPush    bool                   `json:"send_push"`
		SendSMS     bool                   `json:"send_sms"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	targetUserID, err := primitive.ObjectIDFromHex(req.UserID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid user ID", nil)
		return
	}

	// Create in-app notification
	notification := models.Notification{
		ID:        primitive.NewObjectID(),
		UserID:    targetUserID,
		Type:      models.NotificationType(req.Type),
		Title:     req.Title,
		Message:   req.Message,

		IsRead:    false,
		CreatedAt: utils.GetCurrentTime(),
	}

	_, err = utils.DB.Collection("notifications").InsertOne(c, notification)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create notification", err.Error())
		return
	}

	// Get user preferences
	var preferences models.NotificationPreferences
	utils.DB.Collection("notification_preferences").FindOne(c, bson.M{"user_id": targetUserID}).Decode(&preferences)

	// Send external notifications based on preferences and request
	if req.SendEmail && preferences.EmailNotifications {
		// TODO: Send email notification
		go func() {
			// Email sending logic here
		}()
	}

	if req.SendPush && preferences.PushNotifications {
		// TODO: Send push notification
		go func() {
			// Push notification logic here
		}()
	}

	if req.SendSMS && preferences.SMSNotifications {
		// TODO: Send SMS notification
		go func() {
			// SMS sending logic here
		}()
	}

	utils.CreatedResponse(c, "Notification sent successfully", notification)
}