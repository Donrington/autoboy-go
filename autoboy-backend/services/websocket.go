package services

import (
	"log"
	"net/http"
	"sync"
	"time"

	"autoboy-backend/middleware"
	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type WSMessage struct {
	Type      string      `json:"type"`
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
	UserID    string      `json:"user_id,omitempty"`
}

type Client struct {
	ID     string
	UserID string
	Conn   *websocket.Conn
	Send   chan WSMessage
	Rooms  map[string]bool
}

type Hub struct {
	clients    map[string]*Client
	rooms      map[string]map[string]*Client
	register   chan *Client
	unregister chan *Client
	broadcast  chan WSMessage
	mutex      sync.RWMutex
}

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			origin := r.Header.Get("Origin")
			allowedOrigins := []string{
				"http://localhost:3000",
				"http://localhost:5173",
				"https://autoboy.vercel.app",
			}
			for _, allowed := range allowedOrigins {
				if origin == allowed {
					return true
				}
			}
			return false
		},
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	
	WSHub = &Hub{
		clients:    make(map[string]*Client),
		rooms:      make(map[string]map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan WSMessage),
	}
)

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client.ID] = client
			h.mutex.Unlock()
			
			// Send connection confirmation
			client.Send <- WSMessage{
				Type:      "connection_established",
				Data:      map[string]string{"status": "connected"},
				Timestamp: time.Now(),
			}

		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				close(client.Send)
				
				// Remove from all rooms
				for room := range client.Rooms {
					h.leaveRoom(client, room)
				}
			}
			h.mutex.Unlock()

		case message := <-h.broadcast:
			h.mutex.RLock()
			for _, client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client.ID)
				}
			}
			h.mutex.RUnlock()
		}
	}
}

func (h *Hub) JoinRoom(clientID, roomID string) {
	h.mutex.Lock()
	defer h.mutex.Unlock()
	
	client, exists := h.clients[clientID]
	if !exists {
		return
	}
	
	if h.rooms[roomID] == nil {
		h.rooms[roomID] = make(map[string]*Client)
	}
	
	h.rooms[roomID][clientID] = client
	client.Rooms[roomID] = true
}

func (h *Hub) leaveRoom(client *Client, roomID string) {
	if h.rooms[roomID] != nil {
		delete(h.rooms[roomID], client.ID)
		if len(h.rooms[roomID]) == 0 {
			delete(h.rooms, roomID)
		}
	}
	delete(client.Rooms, roomID)
}

func (h *Hub) BroadcastToRoom(roomID string, message WSMessage) {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	if room, exists := h.rooms[roomID]; exists {
		for _, client := range room {
			select {
			case client.Send <- message:
			default:
				close(client.Send)
				delete(h.clients, client.ID)
			}
		}
	}
}

func (h *Hub) Broadcast(message WSMessage) {
	h.broadcast <- message
}

func (h *Hub) GetClients() map[string]*Client {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	return h.clients
}

func (h *Hub) SendToUser(userID string, message WSMessage) {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	for _, client := range h.clients {
		if client.UserID == userID {
			select {
			case client.Send <- message:
			default:
				close(client.Send)
				delete(h.clients, client.ID)
			}
		}
	}
}

func HandleWebSocket(c *gin.Context) {
	// Authenticate user
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token required"})
		return
	}

	claims, err := validateWSToken(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	clientID := utils.GenerateRandomString(16)
	client := &Client{
		ID:     clientID,
		UserID: claims.UserID,
		Conn:   conn,
		Send:   make(chan WSMessage, 256),
		Rooms:  make(map[string]bool),
	}

	WSHub.register <- client

	// Set connection limits
	conn.SetReadLimit(512)
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	go client.writePump()
	go client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		WSHub.unregister <- c
		c.Conn.Close()
	}()

	for {
		var message WSMessage
		err := c.Conn.ReadJSON(&message)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		// Rate limiting
		if !rateLimitMessage(c.UserID) {
			continue
		}

		// Process message based on type
		c.handleMessage(message)
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.Conn.WriteJSON(message); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *Client) handleMessage(message WSMessage) {
	message.UserID = c.UserID
	message.Timestamp = time.Now()

	switch message.Type {
	case "join_conversation":
		if data, ok := message.Data.(map[string]interface{}); ok {
			if conversationID, exists := data["conversation_id"].(string); exists {
				WSHub.JoinRoom(c.ID, "conversation_"+conversationID)
			}
		}

	case "chat_message":
		c.handleChatMessage(message)

	case "typing_start", "typing_stop":
		c.handleTypingIndicator(message)

	case "order_update":
		c.handleOrderUpdate(message)

	case "price_alert":
		c.handlePriceAlert(message)

	case "dispute_update":
		c.handleDisputeUpdate(message)
	}
}

func (c *Client) handleChatMessage(message WSMessage) {
	data, ok := message.Data.(map[string]interface{})
	if !ok {
		return
	}

	conversationID, exists := data["conversation_id"].(string)
	if !exists {
		return
	}

	// Validate user is participant in conversation
	if !c.validateConversationAccess(conversationID) {
		return
	}

	// Broadcast to conversation room
	WSHub.BroadcastToRoom("conversation_"+conversationID, message)
}

func (c *Client) handleTypingIndicator(message WSMessage) {
	data, ok := message.Data.(map[string]interface{})
	if !ok {
		return
	}

	conversationID, exists := data["conversation_id"].(string)
	if !exists {
		return
	}

	if !c.validateConversationAccess(conversationID) {
		return
	}

	WSHub.BroadcastToRoom("conversation_"+conversationID, message)
}

func (c *Client) validateConversationAccess(conversationID string) bool {
	// TODO: Implement database check for conversation access
	return true
}

func rateLimitMessage(userID string) bool {
	// Simple rate limiting - 10 messages per second
	// TODO: Implement proper rate limiting with Redis
	return true
}

// Real-time notification functions
func SendChatMessage(conversationID string, message models.Message) {
	WSHub.BroadcastToRoom("conversation_"+conversationID, WSMessage{
		Type:      "new_message",
		Data:      message,
		Timestamp: time.Now(),
	})
}

func SendOrderUpdate(userID string, order models.Order) {
	WSHub.SendToUser(userID, WSMessage{
		Type:      "order_status_update",
		Data:      order,
		Timestamp: time.Now(),
	})
}

func SendPriceAlert(userID string, alert interface{}) {
	WSHub.SendToUser(userID, WSMessage{
		Type:      "price_alert_triggered",
		Data:      alert,
		Timestamp: time.Now(),
	})
}

func SendDisputeUpdate(userID string, dispute models.Dispute) {
	WSHub.SendToUser(userID, WSMessage{
		Type:      "dispute_update",
		Data:      dispute,
		Timestamp: time.Now(),
	})
}

func SendNotification(userID string, notification interface{}) {
	WSHub.SendToUser(userID, WSMessage{
		Type:      "notification",
		Data:      notification,
		Timestamp: time.Now(),
	})
}

// validateWSToken validates WebSocket authentication token
func validateWSToken(tokenString string) (*middleware.JWTClaims, error) {
	// Use the same validation logic as the auth middleware
	return middleware.ValidateJWTToken(tokenString)
}

func (c *Client) handleOrderUpdate(message WSMessage) {
	// Only allow order updates from authorized users (sellers/admins)
	// TODO: Implement proper authorization check
}

func (c *Client) handlePriceAlert(message WSMessage) {
	// Handle price alert subscriptions
}

func (c *Client) handleDisputeUpdate(message WSMessage) {
	// Handle dispute status updates
}