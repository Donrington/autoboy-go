package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// SupportTicket represents a support ticket
type SupportTicket struct {
	ID         primitive.ObjectID `json:"id" bson:"_id"`
	UserID     uint               `json:"user_id" bson:"user_id"`
	Subject    string             `json:"subject" bson:"subject"`
	Message    string             `json:"message" bson:"message"`
	Priority   string             `json:"priority" bson:"priority"` // low, medium, high, urgent
	Category   string             `json:"category" bson:"category"`
	Status     string             `json:"status" bson:"status"` // open, in_progress, resolved, closed
	IsVIP      bool               `json:"is_vip" bson:"is_vip"`
	AssignedTo *uint              `json:"assigned_to,omitempty" bson:"assigned_to,omitempty"`
	ResolvedAt *time.Time         `json:"resolved_at,omitempty" bson:"resolved_at,omitempty"`
	CreatedAt  time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt  time.Time          `json:"updated_at" bson:"updated_at"`
	
	// Relationships
	User      User                    `json:"user,omitempty" bson:"-"`
	Responses []SupportTicketResponse `json:"responses,omitempty" bson:"-"`
}

// SupportTicketResponse represents responses to support tickets
type SupportTicketResponse struct {
	ID         primitive.ObjectID `json:"id" bson:"_id"`
	TicketID   primitive.ObjectID `json:"ticket_id" bson:"ticket_id"`
	UserID     *uint              `json:"user_id,omitempty" bson:"user_id,omitempty"` // null if from support agent
	AgentID    *uint              `json:"agent_id,omitempty" bson:"agent_id,omitempty"` // null if from user
	Message    string             `json:"message" bson:"message"`
	IsFromUser bool               `json:"is_from_user" bson:"is_from_user"`
	CreatedAt  time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt  time.Time          `json:"updated_at" bson:"updated_at"`
	
	// Relationships
	Ticket SupportTicket `json:"ticket,omitempty" bson:"-"`
	User   *User         `json:"user,omitempty" bson:"-"`
}

// VIPChatSession represents a VIP chat session
type VIPChatSession struct {
	ID        primitive.ObjectID `json:"id" bson:"_id"`
	UserID    uint               `json:"user_id" bson:"user_id"`
	Subject   string             `json:"subject" bson:"subject"`
	Status    string             `json:"status" bson:"status"` // active, ended, transferred
	AgentID   *uint              `json:"agent_id,omitempty" bson:"agent_id,omitempty"`
	StartedAt time.Time          `json:"started_at" bson:"started_at"`
	EndedAt   *time.Time         `json:"ended_at,omitempty" bson:"ended_at,omitempty"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
	
	// Relationships
	User     User             `json:"user,omitempty" bson:"-"`
	Messages []VIPChatMessage `json:"messages,omitempty" bson:"-"`
}

// VIPChatMessage represents messages in a VIP chat session
type VIPChatMessage struct {
	ID         primitive.ObjectID `json:"id" bson:"_id"`
	SessionID  primitive.ObjectID `json:"session_id" bson:"session_id"`
	UserID     *uint              `json:"user_id,omitempty" bson:"user_id,omitempty"` // null if from agent
	AgentID    *uint              `json:"agent_id,omitempty" bson:"agent_id,omitempty"` // null if from user
	Message    string             `json:"message" bson:"message"`
	IsFromUser bool               `json:"is_from_user" bson:"is_from_user"`
	SentAt     time.Time          `json:"sent_at" bson:"sent_at"`
	ReadAt     *time.Time         `json:"read_at,omitempty" bson:"read_at,omitempty"`
	CreatedAt  time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt  time.Time          `json:"updated_at" bson:"updated_at"`
	
	// Relationships
	Session VIPChatSession `json:"session,omitempty" bson:"-"`
	User    *User          `json:"user,omitempty" bson:"-"`
}