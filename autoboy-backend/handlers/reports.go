package handlers

import (
	"net/http"

	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ReportHandler struct{}

func NewReportHandler() *ReportHandler {
	return &ReportHandler{}
}

// ReportProduct reports a product
func (h *ReportHandler) ReportProduct(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var req struct {
		ProductID string `json:"product_id" binding:"required"`
		Reason    string `json:"reason" binding:"required"`
		Details   string `json:"details"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err.Error())
		return
	}

	productObjID, _ := primitive.ObjectIDFromHex(req.ProductID)

	report := models.Report{
		ID:                primitive.NewObjectID(),
		ReporterID:        userObjID,
		Type:              models.ReportTypeProduct,
		ReportedProductID: &productObjID,
		Reason:            models.ReportReason(req.Reason),
		Description:       req.Details,
		Status:            models.ReportStatusPending,
		CreatedAt:         utils.GetCurrentTime(),
	}

	_, err := utils.DB.Collection("reports").InsertOne(c, report)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create report", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Product reported successfully", nil)
}

// ReportUser reports a user
func (h *ReportHandler) ReportUser(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var req struct {
		ReportedUserID string `json:"reported_user_id" binding:"required"`
		Reason         string `json:"reason" binding:"required"`
		Details        string `json:"details"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err.Error())
		return
	}

	reportedUserObjID, _ := primitive.ObjectIDFromHex(req.ReportedUserID)

	report := models.Report{
		ID:             primitive.NewObjectID(),
		ReporterID:     userObjID,
		ReportedUserID: &reportedUserObjID,
		Type:           models.ReportTypeUser,
		Reason:         models.ReportReason(req.Reason),
		Description:    req.Details,
		Status:         models.ReportStatusPending,
		CreatedAt:      utils.GetCurrentTime(),
	}

	_, err := utils.DB.Collection("reports").InsertOne(c, report)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create report", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "User reported successfully", nil)
}