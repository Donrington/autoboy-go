package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// BadgeType represents the category of badge
type BadgeType string

const (
	BadgeTypeBuyer       BadgeType = "buyer"
	BadgeTypeSeller      BadgeType = "seller"
	BadgeTypeAchievement BadgeType = "achievement"
	BadgeTypeSpecial     BadgeType = "special"
	BadgeTypePremium     BadgeType = "premium"
)

// BadgeLevel represents the badge tier
type BadgeLevel string

const (
	BadgeLevelBronze   BadgeLevel = "bronze"
	BadgeLevelSilver   BadgeLevel = "silver"
	BadgeLevelGold     BadgeLevel = "gold"
	BadgeLevelPlatinum BadgeLevel = "platinum"
	BadgeLevelDiamond  BadgeLevel = "diamond"
)

// Badge represents a badge definition
type Badge struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name            string             `bson:"name" json:"name" validate:"required"`
	Description     string             `bson:"description" json:"description"`
	Type            BadgeType          `bson:"type" json:"type"`
	Level           BadgeLevel         `bson:"level" json:"level"`
	IconURL         string             `bson:"icon_url" json:"icon_url"`
	Color           string             `bson:"color" json:"color"`

	// Requirements
	RequirementType string             `bson:"requirement_type" json:"requirement_type"` // orders, sales, spending, reviews, etc.
	RequiredValue   int                `bson:"required_value" json:"required_value"`

	// Perks/Benefits
	Perks           []string           `bson:"perks,omitempty" json:"perks,omitempty"`
	DiscountPercent float64            `bson:"discount_percent" json:"discount_percent"`

	// Visibility
	IsActive        bool               `bson:"is_active" json:"is_active"`
	IsVisible       bool               `bson:"is_visible" json:"is_visible"` // Show in badge catalog

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}

// UserBadge represents a badge earned by a user
type UserBadge struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	BadgeID     primitive.ObjectID `bson:"badge_id" json:"badge_id"`
	EarnedAt    time.Time          `bson:"earned_at" json:"earned_at"`
	IsDisplayed bool               `bson:"is_displayed" json:"is_displayed"` // Show on profile
	Progress    int                `bson:"progress" json:"progress"` // Current progress towards next level
}

// Achievement represents a user achievement
type Achievement struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name            string             `bson:"name" json:"name" validate:"required"`
	Description     string             `bson:"description" json:"description"`
	IconURL         string             `bson:"icon_url" json:"icon_url"`
	Category        string             `bson:"category" json:"category"` // buyer, seller, social, etc.

	// Requirements
	Criteria        map[string]interface{} `bson:"criteria" json:"criteria"`

	// Rewards
	RewardPoints    int                `bson:"reward_points" json:"reward_points"`
	RewardBadgeID   *primitive.ObjectID `bson:"reward_badge_id,omitempty" json:"reward_badge_id,omitempty"`

	// Stats
	TotalEarned     int                `bson:"total_earned" json:"total_earned"`
	Rarity          string             `bson:"rarity" json:"rarity"` // common, rare, epic, legendary

	IsActive        bool               `bson:"is_active" json:"is_active"`
	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}

// UserAchievement represents an achievement earned by a user
type UserAchievement struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID        primitive.ObjectID `bson:"user_id" json:"user_id"`
	AchievementID primitive.ObjectID `bson:"achievement_id" json:"achievement_id"`
	Progress      float64            `bson:"progress" json:"progress"` // 0-100%
	IsCompleted   bool               `bson:"is_completed" json:"is_completed"`
	CompletedAt   *time.Time         `bson:"completed_at,omitempty" json:"completed_at,omitempty"`
	ClaimedAt     *time.Time         `bson:"claimed_at,omitempty" json:"claimed_at,omitempty"`
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt     time.Time          `bson:"updated_at" json:"updated_at"`
}

// RewardPoints represents the user's reward points system
type RewardPoints struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID            primitive.ObjectID `bson:"user_id" json:"user_id"`
	TotalPoints       int                `bson:"total_points" json:"total_points"`
	AvailablePoints   int                `bson:"available_points" json:"available_points"`
	RedeemedPoints    int                `bson:"redeemed_points" json:"redeemed_points"`
	ExpiredPoints     int                `bson:"expired_points" json:"expired_points"`
	LifetimePoints    int                `bson:"lifetime_points" json:"lifetime_points"`
	CurrentTier       string             `bson:"current_tier" json:"current_tier"` // bronze, silver, gold, platinum
	PointsToNextTier  int                `bson:"points_to_next_tier" json:"points_to_next_tier"`
	TierExpiresAt     *time.Time         `bson:"tier_expires_at,omitempty" json:"tier_expires_at,omitempty"`
	LastEarned        *time.Time         `bson:"last_earned,omitempty" json:"last_earned,omitempty"`
	CreatedAt         time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt         time.Time          `bson:"updated_at" json:"updated_at"`
}

// PointsTransaction represents a points earning or redemption transaction
type PointsTransaction struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID         primitive.ObjectID `bson:"user_id" json:"user_id"`
	Type           string             `bson:"type" json:"type"` // earn, redeem, expire, bonus
	Points         int                `bson:"points" json:"points"`
	Description    string             `bson:"description" json:"description"`
	ReferenceType  string             `bson:"reference_type,omitempty" json:"reference_type,omitempty"` // order, review, referral, etc.
	ReferenceID    *primitive.ObjectID `bson:"reference_id,omitempty" json:"reference_id,omitempty"`
	ExpiresAt      *time.Time         `bson:"expires_at,omitempty" json:"expires_at,omitempty"`
	BalanceAfter   int                `bson:"balance_after" json:"balance_after"`
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
}

// RewardTransaction represents a reward transaction
type RewardTransaction struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	Type        string             `bson:"type" json:"type"` // earn, redeem
	Points      int                `bson:"points" json:"points"`
	Description string             `bson:"description" json:"description"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
}

// LevelProgress represents user level progression
type LevelProgress struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID          primitive.ObjectID `bson:"user_id" json:"user_id"`
	UserType        UserType           `bson:"user_type" json:"user_type"` // buyer or seller
	CurrentLevel    int                `bson:"current_level" json:"current_level"`
	CurrentXP       int                `bson:"current_xp" json:"current_xp"`
	XPToNextLevel   int                `bson:"xp_to_next_level" json:"xp_to_next_level"`
	LevelName       string             `bson:"level_name" json:"level_name"` // Novice, Expert, Master, etc.
	TotalXPEarned   int                `bson:"total_xp_earned" json:"total_xp_earned"`
	LastLevelUpAt   *time.Time         `bson:"last_level_up_at,omitempty" json:"last_level_up_at,omitempty"`
	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}
