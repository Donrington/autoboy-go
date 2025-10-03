package handlers

import (
	"net/http"

	"autoboy-backend/services"

	"github.com/gin-gonic/gin"
)

// WebSocketHandler handles WebSocket connections
func WebSocketHandler(c *gin.Context) {
	services.HandleWebSocket(c)
}

// GetOnlineUsers returns list of online users
func GetOnlineUsers(c *gin.Context) {
	// Get online users from WebSocket hub
	onlineCount := len(services.WSHub.GetClients())
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"online_count": onlineCount,
		},
	})
}

// BroadcastNotification sends notification to all users
func BroadcastNotification(c *gin.Context) {
	var req struct {
		Type    string      `json:"type" binding:"required"`
		Message string      `json:"message" binding:"required"`
		Data    interface{} `json:"data"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Only allow admins to broadcast
	userType, exists := c.Get("user_type")
	if !exists || userType != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	message := services.WSMessage{
		Type: req.Type,
		Data: map[string]interface{}{
			"message": req.Message,
			"data":    req.Data,
		},
	}

	services.WSHub.Broadcast(message)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Notification broadcasted",
	})
}