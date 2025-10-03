package handlers

import (
	"net/http"

	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AlertHandler struct{}

func NewAlertHandler() *AlertHandler {
	return &AlertHandler{}
}

// CreatePriceAlert creates a price alert
func (h *AlertHandler) CreatePriceAlert(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var req struct {
		ProductID    string  `json:"product_id" binding:"required"`
		TargetPrice  float64 `json:"target_price" binding:"required"`
		AlertType    string  `json:"alert_type" binding:"required"` // "below", "above"
		NotifyMethod string  `json:"notify_method"`                 // "email", "sms", "push"
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err.Error())
		return
	}

	productObjID, _ := primitive.ObjectIDFromHex(req.ProductID)

	alert := models.PriceAlert{
		ID:          primitive.NewObjectID(),
		UserID:      userObjID,
		ProductID:   productObjID,
		TargetPrice: req.TargetPrice,
		Status:      "active",
		NotifyEmail: req.NotifyMethod == "email",
		NotifySMS:   req.NotifyMethod == "sms",
		NotifyPush:  req.NotifyMethod == "push",
		CreatedAt:   utils.GetCurrentTime(),
		UpdatedAt:   utils.GetCurrentTime(),
	}

	_, err := utils.DB.Collection("price_alerts").InsertOne(c, alert)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create price alert", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Price alert created successfully", gin.H{
		"alert_id": alert.ID,
	})
}

// GetUserAlerts gets user's price alerts
func (h *AlertHandler) GetUserAlerts(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var alerts []models.PriceAlert
	cursor, err := utils.DB.Collection("price_alerts").Find(c, bson.M{"user_id": userObjID})
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch alerts", err.Error())
		return
	}
	defer cursor.Close(c)

	if err = cursor.All(c, &alerts); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode alerts", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Price alerts retrieved successfully", gin.H{
		"alerts": alerts,
	})
}