import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WSMessage {
  type: string;
  data: any;
  timestamp: string;
  user_id?: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 5000;
  private heartbeatInterval = 30000;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private isConnecting = false;

  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const wsUrl = __DEV__ 
        ? `ws://localhost:8080/api/v1/ws/connect?token=${encodeURIComponent(token)}`
        : `wss://api.autoboy.ng/api/v1/ws/connect?token=${encodeURIComponent(token)}`;

      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private handleOpen(): void {
    console.log('WebSocket connected');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.emit('connection', { status: 'connected' });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WSMessage = JSON.parse(event.data);
      
      if (!message.type || typeof message.type !== 'string') {
        console.warn('Invalid message format received');
        return;
      }

      this.emit(message.type, message.data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code);
    this.stopHeartbeat();
    this.emit('disconnection', { code: event.code });
    
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.emit('error', error);
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('max_reconnect_attempts', {});
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('ping', {});
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  send(type: string, data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message: WSMessage = {
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }

  joinConversation(conversationId: string): void {
    this.send('join_conversation', { conversation_id: conversationId });
  }

  sendMessage(message: any): void {
    this.send('message', message);
  }

  leaveConversation(conversationId: string): void {
    this.send('leave_conversation', { conversation_id: conversationId });
  }

  sendTyping(conversationId: string, isTyping: boolean): void {
    this.send('typing', {
      conversation_id: conversationId,
      is_typing: isTyping
    });
  }

  sendChatMessage(conversationId: string, content: string, type: string = 'text'): void {
    this.send('chat_message', {
      conversation_id: conversationId,
      content,
      type,
    });
  }

  startTyping(conversationId: string): void {
    this.send('typing_start', { conversation_id: conversationId });
  }

  stopTyping(conversationId: string): void {
    this.send('typing_stop', { conversation_id: conversationId });
  }

  subscribeToOrderUpdates(orderId: string): void {
    this.send('subscribe_order', { order_id: orderId });
  }

  subscribeToPriceAlerts(): void {
    this.send('subscribe_price_alerts', {});
  }

  subscribeToDisputeUpdates(): void {
    this.send('subscribe_disputes', {});
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    if (!this.listeners.has(event)) return;

    if (callback) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event callback for ${event}:`, error);
        }
      });
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();
export default websocketService;"}, {"oldStr": "\tclaims, err := validateWSToken(token)\n\tif err != nil {\n\t\tc.JSON(http.StatusUnauthorized, gin.H{\"error\": \"Invalid token\"})\n\t\treturn\n\t}\n\n\tconn, err := upgrader.Upgrade(c.Writer, c.Request, nil)\n\tif err != nil {\n\t\tlog.Printf(\"WebSocket upgrade error: %v\", err)\n\t\treturn\n\t}\n\n\tclientID := utils.GenerateRandomString(16)\n\tclient := &Client{\n\t\tID:     clientID,\n\t\tUserID: claims.UserID,\n\t\tConn:   conn,\n\t\tSend:   make(chan WSMessage, 256),\n\t\tRooms:  make(map[string]bool),\n\t}\n\n\tWSHub.register <- client\n\n\t// Set connection limits\n\tconn.SetReadLimit(512)\n\tconn.SetReadDeadline(time.Now().Add(60 * time.Second))\n\tconn.SetPongHandler(func(string) error {\n\t\tconn.SetReadDeadline(time.Now().Add(60 * time.Second))\n\t\treturn nil\n\t})\n\n\tgo client.writePump()\n\tgo client.readPump()", "newStr": "\tclaims, err := validateWSToken(token)\n\tif err != nil {\n\t\tc.JSON(http.StatusUnauthorized, gin.H{\"error\": \"Invalid token\"})\n\t\treturn\n\t}\n\n\tconn, err := upgrader.Upgrade(c.Writer, c.Request, nil)\n\tif err != nil {\n\t\tlog.Printf(\"WebSocket upgrade error: %v\", err)\n\t\treturn\n\t}\n\n\tclientID := utils.GenerateRandomString(16)\n\tclient := &Client{\n\t\tID:     clientID,\n\t\tUserID: claims.UserID,\n\t\tConn:   conn,\n\t\tSend:   make(chan WSMessage, 256),\n\t\tRooms:  make(map[string]bool),\n\t}\n\n\tWSHub.register <- client\n\n\tconn.SetReadLimit(512)\n\tconn.SetReadDeadline(time.Now().Add(60 * time.Second))\n\tconn.SetPongHandler(func(string) error {\n\t\tconn.SetReadDeadline(time.Now().Add(60 * time.Second))\n\t\treturn nil\n\t})\n\n\tgo client.writePump()\n\tgo client.readPump()\n\n// validateWSToken validates WebSocket authentication token\nfunc validateWSToken(tokenString string) (*middleware.JWTClaims, error) {\n\treturn middleware.ValidateJWTToken(tokenString)\n}"}, {"oldStr": "func SendChatMessage(conversationID string, message models.Message) {\n\tWSHub.BroadcastToRoom(\"conversation_\"+conversationID, WSMessage{\n\t\tType:      \"new_message\",\n\t\tData:      message,\n\t\tTimestamp: time.Now(),\n\t})\n}\n\nfunc SendOrderUpdate(userID string, order models.Order) {\n\tWSHub.SendToUser(userID, WSMessage{\n\t\tType:      \"order_status_update\",\n\t\tData:      order,\n\t\tTimestamp: time.Now(),\n\t})\n}\n\nfunc SendPriceAlert(userID string, alert interface{}) {\n\tWSHub.SendToUser(userID, WSMessage{\n\t\tType:      \"price_alert_triggered\",\n\t\tData:      alert,\n\t\tTimestamp: time.Now(),\n\t})\n}\n\nfunc SendDisputeUpdate(userID string, dispute models.Dispute) {\n\tWSHub.SendToUser(userID, WSMessage{\n\t\tType:      \"dispute_update\",\n\t\tData:      dispute,\n\t\tTimestamp: time.Now(),\n\t})\n}\n\nfunc SendNotification(userID string, notification interface{}) {\n\tWSHub.SendToUser(userID, WSMessage{\n\t\tType:      \"notification\",\n\t\tData:      notification,\n\t\tTimestamp: time.Now(),\n\t})\n}\n\n// validateWSToken validates WebSocket authentication token\nfunc validateWSToken(tokenString string) (*middleware.JWTClaims, error) {\n\t// Use the same validation logic as the auth middleware\n\treturn middleware.ValidateJWTToken(tokenString)\n}", "newStr": "// Real-time notification functions\nfunc SendChatMessage(conversationID string, message models.Message) {\n\tWSHub.BroadcastToRoom(\"conversation_\"+conversationID, WSMessage{\n\t\tType:      \"new_message\",\n\t\tData:      message,\n\t\tTimestamp: time.Now(),\n\t})\n}\n\nfunc SendOrderUpdate(userID string, order models.Order) {\n\tWSHub.SendToUser(userID, WSMessage{\n\t\tType:      \"order_status_update\",\n\t\tData:      order,\n\t\tTimestamp: time.Now(),\n\t})\n}\n\nfunc SendPriceAlert(userID string, alert interface{}) {\n\tWSHub.SendToUser(userID, WSMessage{\n\t\tType:      \"price_alert_triggered\",\n\t\tData:      alert,\n\t\tTimestamp: time.Now(),\n\t})\n}\n\nfunc SendDisputeUpdate(userID string, dispute models.Dispute) {\n\tWSHub.SendToUser(userID, WSMessage{\n\t\tType:      \"dispute_update\",\n\t\tData:      dispute,\n\t\tTimestamp: time.Now(),\n\t})\n}\n\nfunc SendNotification(userID string, notification interface{}) {\n\tWSHub.SendToUser(userID, WSMessage{\n\t\tType:      \"notification\",\n\t\tData:      notification,\n\t\tTimestamp: time.Now(),\n\t})\n}\n\n// validateWSToken validates WebSocket authentication token\nfunc validateWSToken(tokenString string) (*middleware.JWTClaims, error) {\n\treturn middleware.ValidateJWTToken(tokenString)\n}"}]