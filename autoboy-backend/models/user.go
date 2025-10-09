package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// UserType represents the type of user
type UserType string

const (
	UserTypeBuyer  UserType = "buyer"
	UserTypeSeller UserType = "seller"
	UserTypeAdmin  UserType = "admin"
)

// UserStatus represents the status of a user account
type UserStatus string

const (
	UserStatusActive    UserStatus = "active"
	UserStatusInactive  UserStatus = "inactive"
	UserStatusSuspended UserStatus = "suspended"
	UserStatusPending   UserStatus = "pending"
)

// VerificationStatus represents user verification level
type VerificationStatus string

const (
	VerificationStatusUnverified VerificationStatus = "unverified"
	VerificationStatusPending    VerificationStatus = "pending"
	VerificationStatusVerified   VerificationStatus = "verified"
	VerificationStatusRejected   VerificationStatus = "rejected"
)

// PremiumStatus represents premium membership status
type PremiumStatus string

const (
	PremiumStatusNone    PremiumStatus = "none"
	PremiumStatusBasic   PremiumStatus = "basic"
	PremiumStatusPremium PremiumStatus = "premium"
	PremiumStatusVIP     PremiumStatus = "vip"
)

// User represents the main user model
type User struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username        string             `bson:"username" json:"username" validate:"required,min=3,max=30"`
	Email           string             `bson:"email" json:"email" validate:"required,email"`
	Password        string             `bson:"password" json:"-" validate:"required,min=8"`
	Phone           string             `bson:"phone" json:"phone" validate:"required"`
	UserType        UserType           `bson:"user_type" json:"user_type" validate:"required"`
	Status          UserStatus         `bson:"status" json:"status"`
	LastLogin       *time.Time         `bson:"last_login,omitempty" json:"last_login,omitempty"`
	IsEmailVerified bool               `bson:"is_email_verified" json:"is_email_verified"`
	IsPhoneVerified bool               `bson:"is_phone_verified" json:"is_phone_verified"`
	TwoFactorEnabled bool              `bson:"two_factor_enabled" json:"two_factor_enabled"`
	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`

	// Embedded profile information
	Profile Profile `bson:"profile" json:"profile"`

	// Reward points and gamification
	RewardPoints int `bson:"reward_points" json:"reward_points"`
	BadgeLevel   int `bson:"badge_level" json:"badge_level"`
	TotalPoints  int `bson:"total_points" json:"total_points"`
	
	// Social features
	FollowersCount  int `bson:"followers_count" json:"followers_count"`
	FollowingCount  int `bson:"following_count" json:"following_count"`
	
	// Premium subscription
	SubscriptionID     *primitive.ObjectID `bson:"subscription_id,omitempty" json:"subscription_id,omitempty"`
	SubscriptionStatus string              `bson:"subscription_status,omitempty" json:"subscription_status,omitempty"`
	SubscriptionExpiry *time.Time          `bson:"subscription_expiry,omitempty" json:"subscription_expiry,omitempty"`

	// Security settings
	LoginAttempts   int       `bson:"login_attempts" json:"login_attempts"`
	LockedUntil     *time.Time `bson:"locked_until,omitempty" json:"locked_until,omitempty"`
	PasswordResetToken string `bson:"password_reset_token,omitempty" json:"-"`
	PasswordResetExpiry *time.Time `bson:"password_reset_expiry,omitempty" json:"-"`
}

// Profile represents user profile information
type Profile struct {
	FirstName        string             `bson:"first_name" json:"first_name" validate:"required"`
	LastName         string             `bson:"last_name" json:"last_name" validate:"required"`
	Avatar           string             `bson:"avatar,omitempty" json:"avatar,omitempty"`
	Bio              string             `bson:"bio,omitempty" json:"bio,omitempty"`
	DateOfBirth      *time.Time         `bson:"date_of_birth,omitempty" json:"date_of_birth,omitempty"`
	Gender           string             `bson:"gender,omitempty" json:"gender,omitempty"`
	VerificationStatus VerificationStatus `bson:"verification_status" json:"verification_status"`
	PremiumStatus    PremiumStatus      `bson:"premium_status" json:"premium_status"`
	BadgeLevel       int                `bson:"badge_level" json:"badge_level"`
	Rating           float64            `bson:"rating" json:"rating"`
	TotalRatings     int                `bson:"total_ratings" json:"total_ratings"`

	// Address information
	Addresses        []Address          `bson:"addresses,omitempty" json:"addresses,omitempty"`
	DefaultAddressID *primitive.ObjectID `bson:"default_address_id,omitempty" json:"default_address_id,omitempty"`

	// Business information (for sellers)
	BusinessName     string             `bson:"business_name,omitempty" json:"business_name,omitempty"`
	BusinessAddress  string             `bson:"business_address,omitempty" json:"business_address,omitempty"`
	BusinessPhone    string             `bson:"business_phone,omitempty" json:"business_phone,omitempty"`
	TaxID            string             `bson:"tax_id,omitempty" json:"tax_id,omitempty"`
	
	// Seller-specific fields
	ShopName         string             `bson:"shop_name,omitempty" json:"shop_name,omitempty"`
	ShopDescription  string             `bson:"shop_description,omitempty" json:"shop_description,omitempty"`
	ShopLocation     string             `bson:"shop_location,omitempty" json:"shop_location,omitempty"`
	AccountType      string             `bson:"account_type,omitempty" json:"account_type,omitempty"` // business or individual
	SellerScore      float64            `bson:"seller_score" json:"seller_score"`
	TotalSales       int                `bson:"total_sales" json:"total_sales"`
	TotalEarnings    float64            `bson:"total_earnings" json:"total_earnings"`

	// Verification documents
	Documents        []VerificationDocument `bson:"documents,omitempty" json:"documents,omitempty"`

	// Social links
	SocialLinks      map[string]string  `bson:"social_links,omitempty" json:"social_links,omitempty"`

	// Preferences and settings
	Preferences      UserPreferences    `bson:"preferences" json:"preferences"`
	
	// Activity tracking
	LastActivityAt   *time.Time         `bson:"last_activity_at,omitempty" json:"last_activity_at,omitempty"`
	IsOnline         bool               `bson:"is_online" json:"is_online"`
	
	// Analytics opt-in
	AnalyticsEnabled bool               `bson:"analytics_enabled" json:"analytics_enabled"`
}

// Address represents a user address
type Address struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Type         string             `bson:"type" json:"type"` // home, work, other
	Street       string             `bson:"street" json:"street" validate:"required"`
	City         string             `bson:"city" json:"city" validate:"required"`
	State        string             `bson:"state" json:"state" validate:"required"`
	Country      string             `bson:"country" json:"country" validate:"required"`
	PostalCode   string             `bson:"postal_code" json:"postal_code"`
	Landmark     string             `bson:"landmark,omitempty" json:"landmark,omitempty"`
	IsDefault    bool               `bson:"is_default" json:"is_default"`
	CreatedAt    time.Time          `bson:"created_at" json:"created_at"`
}

// VerificationDocument represents user verification documents
type VerificationDocument struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Type         string             `bson:"type" json:"type"` // nin, bvn, passport, drivers_license
	DocumentNumber string           `bson:"document_number" json:"document_number"`
	DocumentURL  string             `bson:"document_url" json:"document_url"`
	Status       VerificationStatus `bson:"status" json:"status"`
	UploadedAt   time.Time          `bson:"uploaded_at" json:"uploaded_at"`
	VerifiedAt   *time.Time         `bson:"verified_at,omitempty" json:"verified_at,omitempty"`
	RejectionReason string          `bson:"rejection_reason,omitempty" json:"rejection_reason,omitempty"`
}

// UserPreferences represents user preferences and settings
type UserPreferences struct {
	Language         string `bson:"language" json:"language"`
	Currency         string `bson:"currency" json:"currency"`
	Timezone         string `bson:"timezone" json:"timezone"`
	EmailNotifications bool `bson:"email_notifications" json:"email_notifications"`
	SMSNotifications bool   `bson:"sms_notifications" json:"sms_notifications"`
	PushNotifications bool  `bson:"push_notifications" json:"push_notifications"`
	MarketingEmails  bool   `bson:"marketing_emails" json:"marketing_emails"`
	Theme            string `bson:"theme" json:"theme"` // light, dark, auto
}

// PremiumMembership represents premium membership details
type PremiumMembership struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID          primitive.ObjectID `bson:"user_id" json:"user_id"`
	MembershipType  PremiumStatus      `bson:"membership_type" json:"membership_type"`
	StartDate       time.Time          `bson:"start_date" json:"start_date"`
	EndDate         time.Time          `bson:"end_date" json:"end_date"`
	PaymentStatus   string             `bson:"payment_status" json:"payment_status"`
	PaymentAmount   float64            `bson:"payment_amount" json:"payment_amount"`
	PaymentCurrency string             `bson:"payment_currency" json:"payment_currency"`
	Benefits        []string           `bson:"benefits" json:"benefits"`
	AutoRenew       bool               `bson:"auto_renew" json:"auto_renew"`
	RenewalStatus   string             `bson:"renewal_status" json:"renewal_status"`
	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}

// UserSession represents user session data
type UserSession struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID       primitive.ObjectID `bson:"user_id" json:"user_id"`
	SessionToken string             `bson:"session_token" json:"session_token"`
	DeviceInfo   DeviceInfo         `bson:"device_info" json:"device_info"`
	IPAddress    string             `bson:"ip_address" json:"ip_address"`
	Location     string             `bson:"location,omitempty" json:"location,omitempty"`
	IsActive     bool               `bson:"is_active" json:"is_active"`
	ExpiresAt    time.Time          `bson:"expires_at" json:"expires_at"`
	CreatedAt    time.Time          `bson:"created_at" json:"created_at"`
	LastActivity time.Time          `bson:"last_activity" json:"last_activity"`
}

// DeviceInfo represents device information for sessions
type DeviceInfo struct {
	UserAgent   string `bson:"user_agent" json:"user_agent"`
	DeviceType  string `bson:"device_type" json:"device_type"` // mobile, desktop, tablet
	OS          string `bson:"os" json:"os"`
	Browser     string `bson:"browser" json:"browser"`
	AppVersion  string `bson:"app_version,omitempty" json:"app_version,omitempty"`
}

// UserActivity represents user activity logs
type UserActivity struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	Action      string             `bson:"action" json:"action"`
	Resource    string             `bson:"resource" json:"resource"`
	ResourceID  string             `bson:"resource_id,omitempty" json:"resource_id,omitempty"`
	Details     map[string]interface{} `bson:"details,omitempty" json:"details,omitempty"`
	IPAddress   string             `bson:"ip_address" json:"ip_address"`
	UserAgent   string             `bson:"user_agent" json:"user_agent"`
	Timestamp   time.Time          `bson:"timestamp" json:"timestamp"`
}

// FollowRelationship represents user following relationships
type FollowRelationship struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FollowerID  primitive.ObjectID `bson:"follower_id" json:"follower_id"`
	FollowingID primitive.ObjectID `bson:"following_id" json:"following_id"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
}

// UserWallet represents user wallet for transactions
type UserWallet struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID          primitive.ObjectID `bson:"user_id" json:"user_id"`
	Balance         float64            `bson:"balance" json:"balance"`
	Currency        string             `bson:"currency" json:"currency"`
	EscrowBalance   float64            `bson:"escrow_balance" json:"escrow_balance"`
	PendingBalance  float64            `bson:"pending_balance" json:"pending_balance"`
	TotalEarnings   float64            `bson:"total_earnings" json:"total_earnings"`
	TotalSpent      float64            `bson:"total_spent" json:"total_spent"`
	IsActive        bool               `bson:"is_active" json:"is_active"`
	LastTransaction *time.Time         `bson:"last_transaction,omitempty" json:"last_transaction,omitempty"`
	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}