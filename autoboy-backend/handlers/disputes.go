package handlers

import (
	"net/http"

	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type DisputeHandler struct{}

func NewDisputeHandler() *DisputeHandler {
	return &DisputeHandler{}
}

// GetDisputes gets user's disputes
func (h *DisputeHandler) GetDisputes(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	filter := bson.M{
		"$or": []bson.M{
			{"buyer_id": userObjID},
			{"seller_id": userObjID},
		},
	}

	var disputes []models.Dispute
	cursor, err := utils.DB.Collection("disputes").Find(c, filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch disputes", err.Error())
		return
	}
	defer cursor.Close(c)

	if err = cursor.All(c, &disputes); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode disputes", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Disputes retrieved successfully", gin.H{
		"disputes": disputes,
	})
}

// CreateDispute creates a new dispute
func (h *DisputeHandler) CreateDispute(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var req struct {
		OrderID     string `json:"order_id" binding:"required"`
		Reason      string `json:"reason" binding:"required"`
		Description string `json:"description" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err.Error())
		return
	}

	orderObjID, _ := primitive.ObjectIDFromHex(req.OrderID)

	dispute := models.Dispute{
		ID:          primitive.NewObjectID(),
		OrderID:     orderObjID,
		BuyerID:     userObjID,
		Reason:      models.DisputeReason(req.Reason),
		Description: req.Description,
		Status:      models.DisputeStatusOpen,
		CreatedAt:   utils.GetCurrentTime(),
	}

	_, err := utils.DB.Collection("disputes").InsertOne(c, dispute)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create dispute", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Dispute created successfully", gin.H{
		"dispute_id": dispute.ID,
	})
}

// GetDispute gets a specific dispute
func (h *DisputeHandler) GetDispute(c *gin.Context) {
	disputeID := c.Param("id")
	disputeObjID, err := primitive.ObjectIDFromHex(disputeID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid dispute ID", err.Error())
		return
	}

	var dispute models.Dispute
	err = utils.DB.Collection("disputes").FindOne(c, bson.M{"_id": disputeObjID}).Decode(&dispute)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Dispute not found", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Dispute retrieved successfully", gin.H{
		"dispute": dispute,
	})
}

// GetAllDisputes handles admin dispute retrieval
func (h *DisputeHandler) GetAllDisputes(c *gin.Context) {
	status := c.Query("status")
	priority := c.Query("priority")

	filter := bson.M{}
	if status != "" && status != "all" {
		filter["status"] = status
	}
	if priority != "" && priority != "all" {
		filter["priority"] = priority
	}

	cursor, err := utils.DB.Collection("disputes").Find(c, filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch disputes", err.Error())
		return
	}
	defer cursor.Close(c)

	var disputes []models.Dispute
	if err = cursor.All(c, &disputes); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode disputes", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Disputes retrieved successfully", gin.H{
		"disputes": disputes,
	})
}

// ResolveDispute handles admin dispute resolution
func (h *DisputeHandler) ResolveDispute(c *gin.Context) {
	disputeID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(disputeID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid dispute ID", err.Error())
		return
	}

	var req struct {
		Resolution   string  `json:"resolution" binding:"required"`
		AdminNotes   string  `json:"admin_notes"`
		RefundAmount float64 `json:"refund_amount"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err.Error())
		return
	}

	update := bson.M{
		"$set": bson.M{
			"status":        "resolved",
			"resolution":    req.Resolution,
			"admin_notes":   req.AdminNotes,
			"refund_amount": req.RefundAmount,
			"resolved_at":   utils.GetCurrentTime(),
			"updated_at":    utils.GetCurrentTime(),
		},
	}

	_, err = utils.DB.Collection("disputes").UpdateOne(c, bson.M{"_id": objID}, update)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to resolve dispute", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Dispute resolved successfully", nil)
}