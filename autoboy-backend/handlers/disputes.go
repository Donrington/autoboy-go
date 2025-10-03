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