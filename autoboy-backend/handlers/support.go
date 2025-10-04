package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"autoboy-backend/config"
	"autoboy-backend/models"
	"autoboy-backend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SupportHandler struct{}

func NewSupportHandler() *SupportHandler {
	return &SupportHandler{}
}

// CreateVIPTicket creates a VIP support ticket
func (h *SupportHandler) CreateVIPTicket(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	var req struct {
		Subject  string `json:"subject" binding:"required"`
		Message  string `json:"message" binding:"required"`
		Priority string `json:"priority" binding:"required"`
		Category string `json:"category"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}
	
	// Validate priority
	validPriorities := map[string]bool{
		"low": true, "medium": true, "high": true, "urgent": true,
	}
	if !validPriorities[req.Priority] {
		utils.BadRequestResponse(c, "Invalid priority level", "Priority must be low, medium, high, or urgent")
		return
	}
	
	ticket := models.SupportTicket{
		ID:        primitive.NewObjectID(),
		UserID:    userID,
		Subject:   req.Subject,
		Message:   req.Message,
		Priority:  req.Priority,
		Category:  req.Category,
		Status:    "open",
		IsVIP:     true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	_, err := config.Coll.Reports.InsertOne(ctx, ticket)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create support ticket", err.Error())
		return
	}
	
	utils.SuccessResponse(c, http.StatusCreated, "VIP support ticket created successfully", ticket)
}

// GetVIPTickets returns user's VIP support tickets
func (h *SupportHandler) GetVIPTickets(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	var tickets []models.SupportTicket
	cursor, err := config.Coll.Reports.Find(ctx, bson.M{"user_id": userID, "is_vip": true})
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to retrieve VIP tickets", err.Error())
		return
	}
	defer cursor.Close(ctx)
	
	if err = cursor.All(ctx, &tickets); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to decode VIP tickets", err.Error())
		return
	}
	
	utils.SuccessResponse(c, http.StatusOK, "VIP tickets retrieved successfully", tickets)
}

// GetVIPTicket returns a specific VIP support ticket
func (h *SupportHandler) GetVIPTicket(c *gin.Context) {
	userID := c.GetUint("user_id")
	ticketIDStr := c.Param("id")
	ticketID, err := primitive.ObjectIDFromHex(ticketIDStr)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid ticket ID", err.Error())
		return
	}
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	var ticket models.SupportTicket
	err = config.Coll.Reports.FindOne(ctx, bson.M{"_id": ticketID, "user_id": userID, "is_vip": true}).Decode(&ticket)
	if err != nil {
		utils.NotFoundResponse(c, "VIP ticket not found")
		return
	}
	
	utils.SuccessResponse(c, http.StatusOK, "VIP ticket retrieved successfully", ticket)
}

// StartVIPChat initiates a VIP chat session
func (h *SupportHandler) StartVIPChat(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	var req struct {
		Subject string `json:"subject" binding:"required"`
		Message string `json:"message" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}
	
	// Create a chat session
	chatSession := models.VIPChatSession{
		ID:        primitive.NewObjectID(),
		UserID:    userID,
		Subject:   req.Subject,
		Status:    "active",
		StartedAt: time.Now(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	_, err := config.Coll.Conversations.InsertOne(ctx, chatSession)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to start VIP chat", err.Error())
		return
	}
	
	// Create initial message
	message := models.VIPChatMessage{
		ID:         primitive.NewObjectID(),
		SessionID:  chatSession.ID,
		UserID:     &userID,
		Message:    req.Message,
		IsFromUser: true,
		SentAt:     time.Now(),
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	
	_, err = config.Coll.Messages.InsertOne(ctx, message)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to send initial message", err.Error())
		return
	}
	
	chatSession.Messages = []models.VIPChatMessage{message}
	
	utils.SuccessResponse(c, http.StatusCreated, "VIP chat session started successfully", chatSession)
}