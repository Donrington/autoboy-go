package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ReportType represents the type of report
type ReportType string

const (
	ReportTypeProduct      ReportType = "product"
	ReportTypeUser         ReportType = "user"
	ReportTypeReview       ReportType = "review"
	ReportTypeMessage      ReportType = "message"
	ReportTypeListing      ReportType = "listing"
)

// ReportReason represents the reason for a report
type ReportReason string

const (
	ReportReasonScam          ReportReason = "scam"
	ReportReasonFraud         ReportReason = "fraud"
	ReportReasonCounterfeit   ReportReason = "counterfeit"
	ReportReasonInappropriate ReportReason = "inappropriate_content"
	ReportReasonSpam          ReportReason = "spam"
	ReportReasonHarassment    ReportReason = "harassment"
	ReportReasonFakeReview    ReportReason = "fake_review"
	ReportReasonProhibited    ReportReason = "prohibited_item"
	ReportReasonMisleading    ReportReason = "misleading"
	ReportReasonOther         ReportReason = "other"
)

// ReportStatus represents the status of a report
type ReportStatus string

const (
	ReportStatusPending   ReportStatus = "pending"
	ReportStatusReviewing ReportStatus = "reviewing"
	ReportStatusResolved  ReportStatus = "resolved"
	ReportStatusDismissed ReportStatus = "dismissed"
	ReportStatusEscalated ReportStatus = "escalated"
)

// ModerationAction represents actions taken by moderators
type ModerationActionType string

const (
	ModerationActionWarning      ModerationActionType = "warning"
	ModerationActionSuspend      ModerationActionType = "suspend"
	ModerationActionBan          ModerationActionType = "ban"
	ModerationActionRemoveContent ModerationActionType = "remove_content"
	ModerationActionRestrict     ModerationActionType = "restrict"
	ModerationActionDismiss      ModerationActionType = "dismiss"
)

// Report represents a user report
type Report struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`

	// Report details
	Type            ReportType         `bson:"type" json:"type" validate:"required"`
	Reason          ReportReason       `bson:"reason" json:"reason" validate:"required"`
	Description     string             `bson:"description" json:"description" validate:"required,min=10"`
	Status          ReportStatus       `bson:"status" json:"status"`

	// Who reported
	ReporterID      primitive.ObjectID `bson:"reporter_id" json:"reporter_id"`
	ReporterIP      string             `bson:"reporter_ip,omitempty" json:"reporter_ip,omitempty"`

	// What was reported
	ReportedUserID     *primitive.ObjectID `bson:"reported_user_id,omitempty" json:"reported_user_id,omitempty"`
	ReportedProductID  *primitive.ObjectID `bson:"reported_product_id,omitempty" json:"reported_product_id,omitempty"`
	ReportedReviewID   *primitive.ObjectID `bson:"reported_review_id,omitempty" json:"reported_review_id,omitempty"`
	ReportedMessageID  *primitive.ObjectID `bson:"reported_message_id,omitempty" json:"reported_message_id,omitempty"`

	// Evidence
	Screenshots     []string           `bson:"screenshots,omitempty" json:"screenshots,omitempty"`
	EvidenceLinks   []string           `bson:"evidence_links,omitempty" json:"evidence_links,omitempty"`

	// Moderation
	ReviewedBy      *primitive.ObjectID `bson:"reviewed_by,omitempty" json:"reviewed_by,omitempty"` // Admin ID
	ReviewedAt      *time.Time         `bson:"reviewed_at,omitempty" json:"reviewed_at,omitempty"`
	ReviewNotes     string             `bson:"review_notes,omitempty" json:"review_notes,omitempty"`

	// Priority & tracking
	Priority        int                `bson:"priority" json:"priority"` // 1-5, 5 being highest
	IsEscalated     bool               `bson:"is_escalated" json:"is_escalated"`
	EscalatedAt     *time.Time         `bson:"escalated_at,omitempty" json:"escalated_at,omitempty"`

	// Duplicate detection
	SimilarReports  []primitive.ObjectID `bson:"similar_reports,omitempty" json:"similar_reports,omitempty"`
	IsDuplicate     bool               `bson:"is_duplicate" json:"is_duplicate"`
	ParentReportID  *primitive.ObjectID `bson:"parent_report_id,omitempty" json:"parent_report_id,omitempty"`

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}

// ModerationAction represents an action taken by a moderator
type ModerationAction struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ReportID        primitive.ObjectID `bson:"report_id" json:"report_id"`

	// Action details
	ActionType      ModerationActionType `bson:"action_type" json:"action_type" validate:"required"`
	TargetUserID    primitive.ObjectID `bson:"target_user_id" json:"target_user_id"`
	ActionedBy      primitive.ObjectID `bson:"actioned_by" json:"actioned_by"` // Admin ID

	Reason          string             `bson:"reason" json:"reason" validate:"required"`
	Details         string             `bson:"details,omitempty" json:"details,omitempty"`

	// Duration (for temporary actions)
	Duration        int                `bson:"duration,omitempty" json:"duration,omitempty"` // in days
	ExpiresAt       *time.Time         `bson:"expires_at,omitempty" json:"expires_at,omitempty"`

	// Content removal
	ContentRemoved  bool               `bson:"content_removed" json:"content_removed"`
	RemovedItemID   *primitive.ObjectID `bson:"removed_item_id,omitempty" json:"removed_item_id,omitempty"`
	RemovedItemType string             `bson:"removed_item_type,omitempty" json:"removed_item_type,omitempty"`

	// Notification
	UserNotified    bool               `bson:"user_notified" json:"user_notified"`
	NotifiedAt      *time.Time         `bson:"notified_at,omitempty" json:"notified_at,omitempty"`

	// Appeal
	CanAppeal       bool               `bson:"can_appeal" json:"can_appeal"`
	AppealDeadline  *time.Time         `bson:"appeal_deadline,omitempty" json:"appeal_deadline,omitempty"`
	IsAppealed      bool               `bson:"is_appealed" json:"is_appealed"`

	// Severity
	Severity        int                `bson:"severity" json:"severity"` // 1-10
	StrikeCount     int                `bson:"strike_count" json:"strike_count"` // How many strikes this adds

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}

// ContentFlag represents an automated or manual content flag
type ContentFlag struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`

	// Content details
	ContentType     string             `bson:"content_type" json:"content_type"` // product, review, message, profile
	ContentID       primitive.ObjectID `bson:"content_id" json:"content_id"`
	OwnerID         primitive.ObjectID `bson:"owner_id" json:"owner_id"`

	// Flag details
	FlagType        string             `bson:"flag_type" json:"flag_type"` // profanity, spam, scam, inappropriate
	Confidence      float64            `bson:"confidence" json:"confidence"` // 0.0 - 1.0 for automated flags
	IsAutomatic     bool               `bson:"is_automatic" json:"is_automatic"`

	// Detection
	DetectedBy      string             `bson:"detected_by,omitempty" json:"detected_by,omitempty"` // ai, keyword, user
	DetectionRules  []string           `bson:"detection_rules,omitempty" json:"detection_rules,omitempty"`
	MatchedTerms    []string           `bson:"matched_terms,omitempty" json:"matched_terms,omitempty"`

	// Status
	Status          string             `bson:"status" json:"status"` // pending, confirmed, dismissed, actioned
	ReviewedBy      *primitive.ObjectID `bson:"reviewed_by,omitempty" json:"reviewed_by,omitempty"`
	ReviewedAt      *time.Time         `bson:"reviewed_at,omitempty" json:"reviewed_at,omitempty"`

	// Action taken
	ActionTaken     *primitive.ObjectID `bson:"action_taken,omitempty" json:"action_taken,omitempty"` // ModerationAction ID
	IsContentHidden bool               `bson:"is_content_hidden" json:"is_content_hidden"`

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}

// UserStrike represents strikes against a user
type UserStrike struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID          primitive.ObjectID `bson:"user_id" json:"user_id"`

	// Strike details
	Reason          string             `bson:"reason" json:"reason" validate:"required"`
	Severity        int                `bson:"severity" json:"severity"` // 1-10
	Points          int                `bson:"points" json:"points"` // Strike points (3 points = suspension)

	// Source
	ReportID        *primitive.ObjectID `bson:"report_id,omitempty" json:"report_id,omitempty"`
	ModerationID    *primitive.ObjectID `bson:"moderation_id,omitempty" json:"moderation_id,omitempty"`
	IssuedBy        primitive.ObjectID `bson:"issued_by" json:"issued_by"` // Admin ID

	// Expiry
	IsActive        bool               `bson:"is_active" json:"is_active"`
	ExpiresAt       *time.Time         `bson:"expires_at,omitempty" json:"expires_at,omitempty"`
	RemovedAt       *time.Time         `bson:"removed_at,omitempty" json:"removed_at,omitempty"`
	RemovalReason   string             `bson:"removal_reason,omitempty" json:"removal_reason,omitempty"`

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
}

// ModerationStats represents moderation statistics
type ModerationStats struct {
	TotalReports        int     `json:"total_reports"`
	PendingReports      int     `json:"pending_reports"`
	ResolvedReports     int     `json:"resolved_reports"`
	DismissedReports    int     `json:"dismissed_reports"`
	AverageReviewTime   float64 `json:"avg_review_time"` // in hours

	// By type
	ProductReports      int     `json:"product_reports"`
	UserReports         int     `json:"user_reports"`
	ReviewReports       int     `json:"review_reports"`

	// Actions
	TotalActions        int     `json:"total_actions"`
	Warnings            int     `json:"warnings"`
	Suspensions         int     `json:"suspensions"`
	Bans                int     `json:"bans"`
	ContentRemoved      int     `json:"content_removed"`

	// Automation
	AutoFlagged         int     `json:"auto_flagged"`
	AutoFlagAccuracy    float64 `json:"auto_flag_accuracy"` // percentage
}

// AppealRequest represents a user's appeal against moderation action
type AppealRequest struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID          primitive.ObjectID `bson:"user_id" json:"user_id"`
	ModerationActionID primitive.ObjectID `bson:"moderation_action_id" json:"moderation_action_id"`

	// Appeal details
	Reason          string             `bson:"reason" json:"reason" validate:"required,min=50"`
	Evidence        []string           `bson:"evidence,omitempty" json:"evidence,omitempty"`

	// Status
	Status          string             `bson:"status" json:"status"` // pending, approved, denied
	ReviewedBy      *primitive.ObjectID `bson:"reviewed_by,omitempty" json:"reviewed_by,omitempty"`
	ReviewedAt      *time.Time         `bson:"reviewed_at,omitempty" json:"reviewed_at,omitempty"`
	ReviewNotes     string             `bson:"review_notes,omitempty" json:"review_notes,omitempty"`

	// Result
	IsApproved      bool               `bson:"is_approved" json:"is_approved"`
	ActionReversed  bool               `bson:"action_reversed" json:"action_reversed"`

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}
