package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// MessageType represents different types of messages
type MessageType string

const (
	MessageTypeText       MessageType = "text"
	MessageTypeImage      MessageType = "image"
	MessageTypeVideo      MessageType = "video"
	MessageTypeAudio      MessageType = "audio"
	MessageTypeFile       MessageType = "file"
	MessageTypeLocation   MessageType = "location"
	MessageTypeProduct    MessageType = "product"
	MessageTypeOrder      MessageType = "order"
	MessageTypeSystem     MessageType = "system"
	MessageTypeEmoji      MessageType = "emoji"
	MessageTypeSticker    MessageType = "sticker"
)

// MessageStatus represents message delivery status
type MessageStatus string

const (
	MessageStatusSent      MessageStatus = "sent"
	MessageStatusDelivered MessageStatus = "delivered"
	MessageStatusRead      MessageStatus = "read"
	MessageStatusFailed    MessageStatus = "failed"
)

// ConversationType represents different types of conversations
type ConversationType string

const (
	ConversationTypeDirect   ConversationType = "direct"
	ConversationTypeGroup    ConversationType = "group"
	ConversationTypeSupport  ConversationType = "support"
	ConversationTypeSystem   ConversationType = "system"
)

// Conversation represents a chat conversation between users
type Conversation struct {
	ID               primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Type             ConversationType     `bson:"type" json:"type"`
	Participants     []primitive.ObjectID `bson:"participants" json:"participants"`
	CreatedBy        primitive.ObjectID   `bson:"created_by" json:"created_by"`

	// Conversation metadata
	Title            string               `bson:"title,omitempty" json:"title,omitempty"`
	Description      string               `bson:"description,omitempty" json:"description,omitempty"`
	Avatar           string               `bson:"avatar,omitempty" json:"avatar,omitempty"`

	// Last message info for quick access
	LastMessage      *Message             `bson:"last_message,omitempty" json:"last_message,omitempty"`
	LastMessageAt    *time.Time           `bson:"last_message_at,omitempty" json:"last_message_at,omitempty"`

	// Conversation settings
	IsArchived       bool                 `bson:"is_archived" json:"is_archived"`
	IsMuted          bool                 `bson:"is_muted" json:"is_muted"`
	IsBlocked        bool                 `bson:"is_blocked" json:"is_blocked"`
	BlockedBy        *primitive.ObjectID  `bson:"blocked_by,omitempty" json:"blocked_by,omitempty"`

	// Product/Order context (if applicable)
	ProductID        *primitive.ObjectID  `bson:"product_id,omitempty" json:"product_id,omitempty"`
	OrderID          *primitive.ObjectID  `bson:"order_id,omitempty" json:"order_id,omitempty"`
	SwapDealID       *primitive.ObjectID  `bson:"swap_deal_id,omitempty" json:"swap_deal_id,omitempty"`

	// Moderation
	IsReported       bool                 `bson:"is_reported" json:"is_reported"`
	ReportCount      int                  `bson:"report_count" json:"report_count"`

	// Participant settings for each user
	ParticipantSettings map[string]ParticipantSettings `bson:"participant_settings,omitempty" json:"participant_settings,omitempty"`

	CreatedAt        time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt        time.Time            `bson:"updated_at" json:"updated_at"`
}

// ParticipantSettings represents per-user conversation settings
type ParticipantSettings struct {
	IsMuted          bool      `bson:"is_muted" json:"is_muted"`
	IsArchived       bool      `bson:"is_archived" json:"is_archived"`
	LastReadAt       *time.Time `bson:"last_read_at,omitempty" json:"last_read_at,omitempty"`
	NotificationLevel string   `bson:"notification_level" json:"notification_level"` // all, mentions, none
	CustomTitle      string    `bson:"custom_title,omitempty" json:"custom_title,omitempty"`
	PinnedAt         *time.Time `bson:"pinned_at,omitempty" json:"pinned_at,omitempty"`
}

// Message represents individual chat messages
type Message struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ConversationID  primitive.ObjectID `bson:"conversation_id" json:"conversation_id"`
	SenderID        primitive.ObjectID `bson:"sender_id" json:"sender_id"`

	// Message content
	Type            MessageType        `bson:"type" json:"type"`
	Content         string             `bson:"content" json:"content"`

	// Media attachments
	Attachments     []MessageAttachment `bson:"attachments,omitempty" json:"attachments,omitempty"`

	// Message metadata
	IsEdited        bool               `bson:"is_edited" json:"is_edited"`
	EditedAt        *time.Time         `bson:"edited_at,omitempty" json:"edited_at,omitempty"`
	IsDeleted       bool               `bson:"is_deleted" json:"is_deleted"`
	DeletedAt       *time.Time         `bson:"deleted_at,omitempty" json:"deleted_at,omitempty"`
	DeletedBy       *primitive.ObjectID `bson:"deleted_by,omitempty" json:"deleted_by,omitempty"`

	// Reply/Thread functionality
	ReplyToID       *primitive.ObjectID `bson:"reply_to_id,omitempty" json:"reply_to_id,omitempty"`
	ThreadID        *primitive.ObjectID `bson:"thread_id,omitempty" json:"thread_id,omitempty"`

	// Message reactions
	Reactions       []MessageReaction   `bson:"reactions,omitempty" json:"reactions,omitempty"`

	// Delivery tracking
	Status          MessageStatus       `bson:"status" json:"status"`
	DeliveredTo     []DeliveryReceipt   `bson:"delivered_to,omitempty" json:"delivered_to,omitempty"`
	ReadBy          []ReadReceipt       `bson:"read_by,omitempty" json:"read_by,omitempty"`

	// Special message types
	SystemAction    *SystemAction       `bson:"system_action,omitempty" json:"system_action,omitempty"`
	ProductShare    *ProductShare       `bson:"product_share,omitempty" json:"product_share,omitempty"`
	OrderUpdate     *OrderUpdate        `bson:"order_update,omitempty" json:"order_update,omitempty"`
	LocationShare   *LocationShare      `bson:"location_share,omitempty" json:"location_share,omitempty"`

	// Moderation
	IsFlagged       bool               `bson:"is_flagged" json:"is_flagged"`
	FlagReason      string             `bson:"flag_reason,omitempty" json:"flag_reason,omitempty"`
	ModeratedBy     *primitive.ObjectID `bson:"moderated_by,omitempty" json:"moderated_by,omitempty"`
	ModeratedAt     *time.Time         `bson:"moderated_at,omitempty" json:"moderated_at,omitempty"`

	// Encryption (for future implementation)
	IsEncrypted     bool               `bson:"is_encrypted" json:"is_encrypted"`
	EncryptionKey   string             `bson:"encryption_key,omitempty" json:"encryption_key,omitempty"`

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}

// MessageAttachment represents file attachments in messages
type MessageAttachment struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Type        string             `bson:"type" json:"type"` // image, video, audio, document
	URL         string             `bson:"url" json:"url"`
	Filename    string             `bson:"filename" json:"filename"`
	Size        int64              `bson:"size" json:"size"`
	MimeType    string             `bson:"mime_type" json:"mime_type"`

	// Media specific fields
	Width       int                `bson:"width,omitempty" json:"width,omitempty"`
	Height      int                `bson:"height,omitempty" json:"height,omitempty"`
	Duration    int                `bson:"duration,omitempty" json:"duration,omitempty"`
	Thumbnail   string             `bson:"thumbnail,omitempty" json:"thumbnail,omitempty"`

	// File metadata
	Caption     string             `bson:"caption,omitempty" json:"caption,omitempty"`
	UploadedAt  time.Time          `bson:"uploaded_at" json:"uploaded_at"`
}

// MessageReaction represents emoji reactions to messages
type MessageReaction struct {
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	Emoji     string             `bson:"emoji" json:"emoji"`
	ReactedAt time.Time          `bson:"reacted_at" json:"reacted_at"`
}

// DeliveryReceipt represents message delivery confirmation
type DeliveryReceipt struct {
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	DeliveredAt time.Time          `bson:"delivered_at" json:"delivered_at"`
}

// ReadReceipt represents message read confirmation
type ReadReceipt struct {
	UserID primitive.ObjectID `bson:"user_id" json:"user_id"`
	ReadAt time.Time          `bson:"read_at" json:"read_at"`
}

// SystemAction represents system-generated messages
type SystemAction struct {
	Action      string                 `bson:"action" json:"action"`
	ActorID     *primitive.ObjectID    `bson:"actor_id,omitempty" json:"actor_id,omitempty"`
	TargetID    *primitive.ObjectID    `bson:"target_id,omitempty" json:"target_id,omitempty"`
	Metadata    map[string]interface{} `bson:"metadata,omitempty" json:"metadata,omitempty"`
}

// ProductShare represents shared products in chat
type ProductShare struct {
	ProductID    primitive.ObjectID `bson:"product_id" json:"product_id"`
	Title        string             `bson:"title" json:"title"`
	Price        float64            `bson:"price" json:"price"`
	Currency     string             `bson:"currency" json:"currency"`
	Image        string             `bson:"image" json:"image"`
	SellerID     primitive.ObjectID `bson:"seller_id" json:"seller_id"`
	SellerName   string             `bson:"seller_name" json:"seller_name"`
}

// OrderUpdate represents order status updates in chat
type OrderUpdate struct {
	OrderID     primitive.ObjectID `bson:"order_id" json:"order_id"`
	Status      OrderStatus        `bson:"status" json:"status"`
	Message     string             `bson:"message" json:"message"`
	TrackingInfo string            `bson:"tracking_info,omitempty" json:"tracking_info,omitempty"`
}

// LocationShare represents shared location in chat
type LocationShare struct {
	Latitude    float64 `bson:"latitude" json:"latitude"`
	Longitude   float64 `bson:"longitude" json:"longitude"`
	Address     string  `bson:"address,omitempty" json:"address,omitempty"`
	PlaceName   string  `bson:"place_name,omitempty" json:"place_name,omitempty"`
}

// ChatNotification represents push notifications for chat
type ChatNotification struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID          primitive.ObjectID `bson:"user_id" json:"user_id"`
	ConversationID  primitive.ObjectID `bson:"conversation_id" json:"conversation_id"`
	MessageID       primitive.ObjectID `bson:"message_id" json:"message_id"`

	// Notification content
	Type            string             `bson:"type" json:"type"`
	Title           string             `bson:"title" json:"title"`
	Body            string             `bson:"body" json:"body"`
	ImageURL        string             `bson:"image_url,omitempty" json:"image_url,omitempty"`

	// Delivery tracking
	IsDelivered     bool               `bson:"is_delivered" json:"is_delivered"`
	DeliveredAt     *time.Time         `bson:"delivered_at,omitempty" json:"delivered_at,omitempty"`
	IsRead          bool               `bson:"is_read" json:"is_read"`
	ReadAt          *time.Time         `bson:"read_at,omitempty" json:"read_at,omitempty"`

	// Device targeting
	DeviceTokens    []string           `bson:"device_tokens,omitempty" json:"device_tokens,omitempty"`
	Platform        string             `bson:"platform,omitempty" json:"platform,omitempty"` // ios, android, web

	// Retry mechanism
	RetryCount      int                `bson:"retry_count" json:"retry_count"`
	MaxRetries      int                `bson:"max_retries" json:"max_retries"`
	NextRetryAt     *time.Time         `bson:"next_retry_at,omitempty" json:"next_retry_at,omitempty"`

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}

// ChatReport represents reported conversations or messages
type ChatReport struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ReporterID      primitive.ObjectID `bson:"reporter_id" json:"reporter_id"`
	ReportedUserID  primitive.ObjectID `bson:"reported_user_id" json:"reported_user_id"`
	ConversationID  primitive.ObjectID `bson:"conversation_id" json:"conversation_id"`
	MessageID       *primitive.ObjectID `bson:"message_id,omitempty" json:"message_id,omitempty"`

	// Report details
	Reason          string             `bson:"reason" json:"reason"`
	Description     string             `bson:"description,omitempty" json:"description,omitempty"`
	Category        string             `bson:"category" json:"category"` // spam, harassment, inappropriate, etc.

	// Evidence
	Screenshots     []string           `bson:"screenshots,omitempty" json:"screenshots,omitempty"`

	// Status and resolution
	Status          ReportStatus       `bson:"status" json:"status"`
	ReviewedBy      *primitive.ObjectID `bson:"reviewed_by,omitempty" json:"reviewed_by,omitempty"`
	ReviewedAt      *time.Time         `bson:"reviewed_at,omitempty" json:"reviewed_at,omitempty"`
	Resolution      string             `bson:"resolution,omitempty" json:"resolution,omitempty"`
	ActionTaken     string             `bson:"action_taken,omitempty" json:"action_taken,omitempty"`

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}

// ReportStatus represents the status of a chat report
type ReportStatus string

const (
	ReportStatusPending   ReportStatus = "pending"
	ReportStatusReviewing ReportStatus = "reviewing"
	ReportStatusResolved  ReportStatus = "resolved"
	ReportStatusDismissed ReportStatus = "dismissed"
)

// ChatMute represents muted conversations for users
type ChatMute struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID         primitive.ObjectID `bson:"user_id" json:"user_id"`
	ConversationID primitive.ObjectID `bson:"conversation_id" json:"conversation_id"`
	MutedUntil     *time.Time         `bson:"muted_until,omitempty" json:"muted_until,omitempty"` // nil means forever
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
}

// ChatBlock represents blocked users in chat
type ChatBlock struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	BlockerID primitive.ObjectID `bson:"blocker_id" json:"blocker_id"`
	BlockedID primitive.ObjectID `bson:"blocked_id" json:"blocked_id"`
	Reason    string             `bson:"reason,omitempty" json:"reason,omitempty"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}

// OnlineStatus represents user online/offline status
type OnlineStatus struct {
	UserID       primitive.ObjectID `bson:"user_id" json:"user_id"`
	IsOnline     bool               `bson:"is_online" json:"is_online"`
	LastSeenAt   time.Time          `bson:"last_seen_at" json:"last_seen_at"`
	Status       string             `bson:"status,omitempty" json:"status,omitempty"` // online, away, busy, invisible
	StatusMessage string            `bson:"status_message,omitempty" json:"status_message,omitempty"`
	Platform     string             `bson:"platform,omitempty" json:"platform,omitempty"` // web, mobile, desktop
	UpdatedAt    time.Time          `bson:"updated_at" json:"updated_at"`
}

// TypingIndicator represents typing status in conversations
type TypingIndicator struct {
	ConversationID primitive.ObjectID `bson:"conversation_id" json:"conversation_id"`
	UserID         primitive.ObjectID `bson:"user_id" json:"user_id"`
	IsTyping       bool               `bson:"is_typing" json:"is_typing"`
	StartedAt      time.Time          `bson:"started_at" json:"started_at"`
	ExpiresAt      time.Time          `bson:"expires_at" json:"expires_at"`
}

// MessageTemplate represents predefined message templates
type MessageTemplate struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	Name        string             `bson:"name" json:"name"`
	Content     string             `bson:"content" json:"content"`
	Category    string             `bson:"category,omitempty" json:"category,omitempty"`
	Variables   []string           `bson:"variables,omitempty" json:"variables,omitempty"`
	UsageCount  int                `bson:"usage_count" json:"usage_count"`
	IsGlobal    bool               `bson:"is_global" json:"is_global"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}

// ChatSettings represents global chat settings for users
type ChatSettings struct {
	UserID                  primitive.ObjectID `bson:"user_id" json:"user_id"`
	EnableReadReceipts      bool               `bson:"enable_read_receipts" json:"enable_read_receipts"`
	EnableTypingIndicators  bool               `bson:"enable_typing_indicators" json:"enable_typing_indicators"`
	EnableOnlineStatus      bool               `bson:"enable_online_status" json:"enable_online_status"`
	AutoDownloadMedia       bool               `bson:"auto_download_media" json:"auto_download_media"`
	NotificationSound       string             `bson:"notification_sound,omitempty" json:"notification_sound,omitempty"`
	MessageRetentionDays    int                `bson:"message_retention_days" json:"message_retention_days"`
	BlockedKeywords         []string           `bson:"blocked_keywords,omitempty" json:"blocked_keywords,omitempty"`
	AllowMessagesFromUnknown bool              `bson:"allow_messages_from_unknown" json:"allow_messages_from_unknown"`
	CreatedAt               time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt               time.Time          `bson:"updated_at" json:"updated_at"`
}