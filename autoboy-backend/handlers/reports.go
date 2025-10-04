package handlers

import (
	"net/http"

	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
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

// GetAllReports handles admin report retrieval
func (h *ReportHandler) GetAllReports(c *gin.Context) {
	status := c.Query("status")
	reportType := c.Query("type")

	filter := bson.M{}
	if status != "" && status != "all" {
		filter["status"] = status
	}
	if reportType != "" && reportType != "all" {
		filter["type"] = reportType
	}

	cursor, err := utils.DB.Collection("reports").Find(c, filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch reports", err.Error())
		return
	}
	defer cursor.Close(c)

	var reports []models.Report
	if err = cursor.All(c, &reports); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode reports", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Reports retrieved successfully", gin.H{
		"reports": reports,
	})
}

// ResolveReport handles admin report resolution
func (h *ReportHandler) ResolveReport(c *gin.Context) {
	reportID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(reportID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid report ID", err.Error())
		return
	}

	var req struct {
		Action     string `json:"action" binding:"required"`
		AdminNotes string `json:"admin_notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err.Error())
		return
	}

	update := bson.M{
		"$set": bson.M{
			"status":      "resolved",
			"action":      req.Action,
			"admin_notes": req.AdminNotes,
			"resolved_at": utils.GetCurrentTime(),
			"updated_at":  utils.GetCurrentTime(),
		},
	}

	_, err = utils.DB.Collection("reports").UpdateOne(c, bson.M{"_id": objID}, update)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to resolve report", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Report resolved successfully", nil)
}