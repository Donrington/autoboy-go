package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// DisputeStatus represents the status of a dispute
type DisputeStatus string

const (
	DisputeStatusOpen       DisputeStatus = "open"
	DisputeStatusUnderReview DisputeStatus = "under_review"
	DisputeStatusResolved   DisputeStatus = "resolved"
	DisputeStatusClosed     DisputeStatus = "closed"
	DisputeStatusEscalated  DisputeStatus = "escalated"
)

// DisputeReason represents the reason for a dispute
type DisputeReason string

const (
	DisputeReasonNotReceived    DisputeReason = "not_received"
	DisputeReasonDamaged        DisputeReason = "damaged"
	DisputeReasonNotAsDescribed DisputeReason = "not_as_described"
	DisputeReasonCounterfeit    DisputeReason = "counterfeit"
	DisputeReasonWrongItem      DisputeReason = "wrong_item"
	DisputeReasonRefund         DisputeReason = "refund_issue"
	DisputeReasonOther          DisputeReason = "other"
)

// DisputeParty represents who is involved in the dispute
type DisputeParty string

const (
	DisputePartyBuyer  DisputeParty = "buyer"
	DisputePartySeller DisputeParty = "seller"
	DisputePartyAdmin  DisputeParty = "admin"
)

// Dispute represents an order dispute
type Dispute struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	OrderID         primitive.ObjectID `bson:"order_id" json:"order_id"`
	ProductID       primitive.ObjectID `bson:"product_id" json:"product_id"`
	BuyerID         primitive.ObjectID `bson:"buyer_id" json:"buyer_id"`
	SellerID        primitive.ObjectID `bson:"seller_id" json:"seller_id"`

	// Dispute details
	Reason          DisputeReason      `bson:"reason" json:"reason" validate:"required"`
	Description     string             `bson:"description" json:"description" validate:"required,min=20"`
	Status          DisputeStatus      `bson:"status" json:"status"`

	// Resolution
	Resolution      string             `bson:"resolution,omitempty" json:"resolution,omitempty"`
	ResolvedBy      *primitive.ObjectID `bson:"resolved_by,omitempty" json:"resolved_by,omitempty"` // Admin ID
	ResolvedAt      *time.Time         `bson:"resolved_at,omitempty" json:"resolved_at,omitempty"`

	// Financial
	DisputedAmount  float64            `bson:"disputed_amount" json:"disputed_amount"`
	RefundAmount    float64            `bson:"refund_amount,omitempty" json:"refund_amount,omitempty"`
	RefundedAt      *time.Time         `bson:"refunded_at,omitempty" json:"refunded_at,omitempty"`

	// Evidence
	EvidenceCount   int                `bson:"evidence_count" json:"evidence_count"`
	MessageCount    int                `bson:"message_count" json:"message_count"`

	// Escalation
	IsEscalated     bool               `bson:"is_escalated" json:"is_escalated"`
	EscalatedAt     *time.Time         `bson:"escalated_at,omitempty" json:"escalated_at,omitempty"`
	EscalationReason string            `bson:"escalation_reason,omitempty" json:"escalation_reason,omitempty"`

	// Tracking
	Priority        int                `bson:"priority" json:"priority"` // 1-5, 5 being highest
	AssignedTo      *primitive.ObjectID `bson:"assigned_to,omitempty" json:"assigned_to,omitempty"` // Admin ID
	LastActivity    time.Time          `bson:"last_activity" json:"last_activity"`

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}

// DisputeMessage represents a message in a dispute
type DisputeMessage struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	DisputeID       primitive.ObjectID `bson:"dispute_id" json:"dispute_id"`
	SenderID        primitive.ObjectID `bson:"sender_id" json:"sender_id"`
	SenderType      DisputeParty       `bson:"sender_type" json:"sender_type"` // buyer, seller, admin

	Message         string             `bson:"message" json:"message" validate:"required"`
	IsInternal      bool               `bson:"is_internal" json:"is_internal"` // Admin-only notes

	// Attachments
	Attachments     []string           `bson:"attachments,omitempty" json:"attachments,omitempty"`

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
}

// DisputeEvidence represents evidence uploaded for a dispute
type DisputeEvidence struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	DisputeID       primitive.ObjectID `bson:"dispute_id" json:"dispute_id"`
	UploadedBy      primitive.ObjectID `bson:"uploaded_by" json:"uploaded_by"`
	UploaderType    DisputeParty       `bson:"uploader_type" json:"uploader_type"`

	// Evidence details
	Type            string             `bson:"type" json:"type"` // image, video, document, screenshot
	Title           string             `bson:"title" json:"title"`
	Description     string             `bson:"description,omitempty" json:"description,omitempty"`
	FileURL         string             `bson:"file_url" json:"file_url"`
	FileName        string             `bson:"file_name" json:"file_name"`
	FileSize        int64              `bson:"file_size" json:"file_size"`
	MimeType        string             `bson:"mime_type" json:"mime_type"`

	// Verification
	IsVerified      bool               `bson:"is_verified" json:"is_verified"`
	VerifiedBy      *primitive.ObjectID `bson:"verified_by,omitempty" json:"verified_by,omitempty"`
	VerifiedAt      *time.Time         `bson:"verified_at,omitempty" json:"verified_at,omitempty"`

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
}

// DisputeResolution represents the final resolution of a dispute
type DisputeResolution struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	DisputeID       primitive.ObjectID `bson:"dispute_id" json:"dispute_id"`
	ResolvedBy      primitive.ObjectID `bson:"resolved_by" json:"resolved_by"` // Admin ID

	// Resolution details
	Decision        string             `bson:"decision" json:"decision"` // favor_buyer, favor_seller, partial, rejected
	Summary         string             `bson:"summary" json:"summary" validate:"required"`
	Details         string             `bson:"details" json:"details"`

	// Actions taken
	RefundIssued    bool               `bson:"refund_issued" json:"refund_issued"`
	RefundAmount    float64            `bson:"refund_amount,omitempty" json:"refund_amount,omitempty"`
	SellerPenalty   float64            `bson:"seller_penalty,omitempty" json:"seller_penalty,omitempty"`
	BuyerCompensation float64          `bson:"buyer_compensation,omitempty" json:"buyer_compensation,omitempty"`

	// Product handling
	ProductReturn   bool               `bson:"product_return" json:"product_return"`
	ReturnDeadline  *time.Time         `bson:"return_deadline,omitempty" json:"return_deadline,omitempty"`

	// Follow-up
	FollowUpRequired bool              `bson:"follow_up_required" json:"follow_up_required"`
	FollowUpDate    *time.Time         `bson:"follow_up_date,omitempty" json:"follow_up_date,omitempty"`
	FollowUpNotes   string             `bson:"follow_up_notes,omitempty" json:"follow_up_notes,omitempty"`

	// Satisfaction
	BuyerSatisfied  *bool              `bson:"buyer_satisfied,omitempty" json:"buyer_satisfied,omitempty"`
	SellerSatisfied *bool              `bson:"seller_satisfied,omitempty" json:"seller_satisfied,omitempty"`

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}

// DisputeStats represents dispute statistics for analytics
type DisputeStats struct {
	TotalDisputes     int     `json:"total_disputes"`
	OpenDisputes      int     `json:"open_disputes"`
	ResolvedDisputes  int     `json:"resolved_disputes"`
	AverageResolutionTime float64 `json:"avg_resolution_time"` // in hours
	BuyerFavorRate    float64 `json:"buyer_favor_rate"` // percentage
	SellerFavorRate   float64 `json:"seller_favor_rate"` // percentage
	TotalRefunded     float64 `json:"total_refunded"`
	TotalPenalties    float64 `json:"total_penalties"`
}
