package handlers

import (
	"net/http"

	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ChatHandler struct{}

func NewChatHandler() *ChatHandler {
	return &ChatHandler{}
}

// GetConversations gets user's conversations
func (h *ChatHandler) GetConversations(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	filter := bson.M{"participants": userObjID}

	var conversations []models.Conversation
	cursor, err := utils.DB.Collection("conversations").Find(c, filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch conversations", err.Error())
		return
	}
	defer cursor.Close(c)

	if err = cursor.All(c, &conversations); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode conversations", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Conversations retrieved successfully", gin.H{
		"conversations": conversations,
	})
}

// CreateConversation creates a new conversation
func (h *ChatHandler) CreateConversation(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var req struct {
		ParticipantID string `json:"participant_id" binding:"required"`
		ProductID     string `json:"product_id,omitempty"`
		Type          string `json:"type" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err.Error())
		return
	}

	participantObjID, _ := primitive.ObjectIDFromHex(req.ParticipantID)
	participants := []primitive.ObjectID{userObjID, participantObjID}

	conversation := models.Conversation{
		ID:           primitive.NewObjectID(),
		Participants: participants,
		Type:         models.ConversationType(req.Type),
		CreatedAt:    utils.GetCurrentTime(),
		UpdatedAt:    utils.GetCurrentTime(),
	}

	if req.ProductID != "" {
		productObjID, _ := primitive.ObjectIDFromHex(req.ProductID)
		conversation.ProductID = &productObjID
	}

	_, err := utils.DB.Collection("conversations").InsertOne(c, conversation)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create conversation", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Conversation created successfully", gin.H{
		"conversation_id": conversation.ID,
	})
}

// GetMessages gets messages from a conversation
func (h *ChatHandler) GetMessages(c *gin.Context) {
	conversationID := c.Param("id")
	conversationObjID, err := primitive.ObjectIDFromHex(conversationID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid conversation ID", err.Error())
		return
	}

	filter := bson.M{"conversation_id": conversationObjID}

	var messages []models.Message
	cursor, err := utils.DB.Collection("messages").Find(c, filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch messages", err.Error())
		return
	}
	defer cursor.Close(c)

	if err = cursor.All(c, &messages); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode messages", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Messages retrieved successfully", gin.H{
		"messages": messages,
	})
}

// SendMessage sends a new message
func (h *ChatHandler) SendMessage(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var req struct {
		ConversationID string `json:"conversation_id" binding:"required"`
		Content        string `json:"content" binding:"required"`
		Type           string `json:"type"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err.Error())
		return
	}

	conversationObjID, _ := primitive.ObjectIDFromHex(req.ConversationID)

	message := models.Message{
		ID:             primitive.NewObjectID(),
		ConversationID: conversationObjID,
		SenderID:       userObjID,
		Content:        req.Content,
		Type:           models.MessageType(req.Type),
		Status:         "sent",
		CreatedAt:      utils.GetCurrentTime(),
	}

	_, err := utils.DB.Collection("messages").InsertOne(c, message)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to send message", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Message sent successfully", gin.H{
		"message_id": message.ID,
	})
}