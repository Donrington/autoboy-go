package handlers

import (
	"net/http"

	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SwapHandler struct{}

func NewSwapHandler() *SwapHandler {
	return &SwapHandler{}
}

// CreateSwapDeal creates a new swap deal proposal
func (h *SwapHandler) CreateSwapDeal(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var req struct {
		RecipientID         string  `json:"recipient_id" binding:"required"`
		InitiatorProductID  string  `json:"initiator_product_id" binding:"required"`
		RecipientProductID  string  `json:"recipient_product_id" binding:"required"`
		CashDifference      float64 `json:"cash_difference"`
		Terms               string  `json:"terms"`
		ExchangeMethod      string  `json:"exchange_method"`
		MeetupLocation      string  `json:"meetup_location"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err.Error())
		return
	}

	recipientObjID, _ := primitive.ObjectIDFromHex(req.RecipientID)
	initiatorProductObjID, _ := primitive.ObjectIDFromHex(req.InitiatorProductID)
	recipientProductObjID, _ := primitive.ObjectIDFromHex(req.RecipientProductID)

	swapDeal := models.SwapDeal{
		ID:                  primitive.NewObjectID(),
		SwapNumber:          utils.GenerateOrderNumber(), // Reuse order number generator
		InitiatorID:         userObjID,
		RecipientID:         recipientObjID,
		InitiatorProductID:  initiatorProductObjID,
		RecipientProductID:  recipientProductObjID,
		CashDifference:      req.CashDifference,
		Terms:               req.Terms,
		ExchangeMethod:      req.ExchangeMethod,
		MeetupLocation:      req.MeetupLocation,
		Status:              "pending",
		CreatedAt:           utils.GetCurrentTime(),
		UpdatedAt:           utils.GetCurrentTime(),
	}

	_, err := utils.DB.Collection("swap_deals").InsertOne(c, swapDeal)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create swap deal", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Swap deal created successfully", gin.H{
		"swap_id": swapDeal.ID,
		"swap_number": swapDeal.SwapNumber,
	})
}

// GetUserSwapDeals gets user's swap deals
func (h *SwapHandler) GetUserSwapDeals(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	filter := bson.M{
		"$or": []bson.M{
			{"initiator_id": userObjID},
			{"recipient_id": userObjID},
		},
	}

	var swapDeals []models.SwapDeal
	cursor, err := utils.DB.Collection("swap_deals").Find(c, filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch swap deals", err.Error())
		return
	}
	defer cursor.Close(c)

	if err = cursor.All(c, &swapDeals); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode swap deals", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Swap deals retrieved successfully", gin.H{
		"swap_deals": swapDeals,
	})
}

// AcceptSwapDeal accepts a swap deal
func (h *SwapHandler) AcceptSwapDeal(c *gin.Context) {
	swapID := c.Param("id")
	swapObjID, err := primitive.ObjectIDFromHex(swapID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid swap ID", err.Error())
		return
	}

	update := bson.M{
		"$set": bson.M{
			"status": "accepted",
			"updated_at": utils.GetCurrentTime(),
		},
	}

	result, err := utils.DB.Collection("swap_deals").UpdateOne(c, bson.M{"_id": swapObjID}, update)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to accept swap deal", err.Error())
		return
	}

	if result.MatchedCount == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Swap deal not found", "")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Swap deal accepted successfully", nil)
}

// RejectSwapDeal rejects a swap deal
func (h *SwapHandler) RejectSwapDeal(c *gin.Context) {
	swapID := c.Param("id")
	swapObjID, err := primitive.ObjectIDFromHex(swapID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid swap ID", err.Error())
		return
	}

	update := bson.M{
		"$set": bson.M{
			"status": "rejected",
			"updated_at": utils.GetCurrentTime(),
		},
	}

	result, err := utils.DB.Collection("swap_deals").UpdateOne(c, bson.M{"_id": swapObjID}, update)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to reject swap deal", err.Error())
		return
	}

	if result.MatchedCount == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Swap deal not found", "")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Swap deal rejected successfully", nil)
}

// GetSwapDeal gets a specific swap deal
func (h *SwapHandler) GetSwapDeal(c *gin.Context) {
	swapID := c.Param("id")
	swapObjID, err := primitive.ObjectIDFromHex(swapID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid swap ID", err.Error())
		return
	}

	var swapDeal models.SwapDeal
	err = utils.DB.Collection("swap_deals").FindOne(c, bson.M{"_id": swapObjID}).Decode(&swapDeal)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Swap deal not found", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Swap deal retrieved successfully", gin.H{
		"swap_deal": swapDeal,
	})
}