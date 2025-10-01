package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// Database holds the MongoDB client and database instance
type Database struct {
	Client   *mongo.Client
	Database *mongo.Database
}

// MongoDB collections
type Collections struct {
	// User related collections
	Users               *mongo.Collection
	UserSessions        *mongo.Collection
	UserActivities      *mongo.Collection
	FollowRelationships *mongo.Collection
	UserWallets         *mongo.Collection
	PremiumMemberships  *mongo.Collection

	// Product related collections
	Products         *mongo.Collection
	Categories       *mongo.Collection
	ProductReviews   *mongo.Collection
	ProductQuestions *mongo.Collection
	ProductWishlists *mongo.Collection
	ProductViews     *mongo.Collection
	ProductFlags     *mongo.Collection
	ProductAnalytics *mongo.Collection

	// Order related collections
	Orders         *mongo.Collection
	SwapDeals      *mongo.Collection
	OrderDisputes  *mongo.Collection
	OrderTracking  *mongo.Collection
	OrderReturns   *mongo.Collection

	// Payment related collections
	Payments         *mongo.Collection
	Escrows          *mongo.Collection
	WalletTransactions *mongo.Collection
	PaymentWebhooks  *mongo.Collection
	Refunds          *mongo.Collection
	BankAccounts     *mongo.Collection
	Withdrawals      *mongo.Collection

	// Chat related collections
	Conversations    *mongo.Collection
	Messages         *mongo.Collection
	ChatNotifications *mongo.Collection
	ChatReports      *mongo.Collection
	ChatMutes        *mongo.Collection
	ChatBlocks       *mongo.Collection
	OnlineStatuses   *mongo.Collection
	MessageTemplates *mongo.Collection
	ChatSettings     *mongo.Collection

	// System collections
	AdminLogs        *mongo.Collection
	SystemSettings   *mongo.Collection
	APIKeys          *mongo.Collection
	Notifications    *mongo.Collection
	NotificationTemplates *mongo.Collection

	// Badge & Gamification collections
	Badges            *mongo.Collection
	UserBadges        *mongo.Collection
	RewardPoints      *mongo.Collection
	PointsTransactions *mongo.Collection

	// Alert & Deal collections
	PriceAlerts       *mongo.Collection
	SavedSearches     *mongo.Collection
	Wishlists         *mongo.Collection
	ExclusiveDeals    *mongo.Collection

	// Dispute & Report collections
	Disputes          *mongo.Collection
	DisputeMessages   *mongo.Collection
	DisputeEvidence   *mongo.Collection
	DisputeResolutions *mongo.Collection
	Reports           *mongo.Collection
	ModerationActions *mongo.Collection
	ContentFlags      *mongo.Collection
	UserStrikes       *mongo.Collection
	AppealRequests    *mongo.Collection
}

var DB *Database
var Coll *Collections

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	URI            string
	DatabaseName   string
	MaxPoolSize    uint64
	MinPoolSize    uint64
	ConnectTimeout time.Duration
	MaxConnIdleTime time.Duration
}

// GetDatabaseConfig returns database configuration from environment variables
func GetDatabaseConfig() *DatabaseConfig {
	return &DatabaseConfig{
		URI:             getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		DatabaseName:    getEnv("MONGODB_DATABASE", "autoboy"),
		MaxPoolSize:     100,
		MinPoolSize:     5,
		ConnectTimeout:  10 * time.Second,
		MaxConnIdleTime: 30 * time.Second,
	}
}

// ConnectDatabase establishes connection to MongoDB
func ConnectDatabase() (*Database, error) {
	config := GetDatabaseConfig()

	// Set client options
	clientOptions := options.Client().ApplyURI(config.URI).
		SetMaxPoolSize(config.MaxPoolSize).
		SetMinPoolSize(config.MinPoolSize).
		SetMaxConnIdleTime(config.MaxConnIdleTime)

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), config.ConnectTimeout)
	defer cancel()

	// Connect to MongoDB
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	// Ping the database to verify connection
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		return nil, fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	// Get database instance
	database := client.Database(config.DatabaseName)

	log.Printf("Successfully connected to MongoDB database: %s", config.DatabaseName)

	return &Database{
		Client:   client,
		Database: database,
	}, nil
}

// InitializeCollections initializes all MongoDB collections
func (db *Database) InitializeCollections() *Collections {
	return &Collections{
		// User related collections
		Users:               db.Database.Collection("users"),
		UserSessions:        db.Database.Collection("user_sessions"),
		UserActivities:      db.Database.Collection("user_activities"),
		FollowRelationships: db.Database.Collection("follow_relationships"),
		UserWallets:         db.Database.Collection("user_wallets"),
		PremiumMemberships:  db.Database.Collection("premium_memberships"),

		// Product related collections
		Products:         db.Database.Collection("products"),
		Categories:       db.Database.Collection("categories"),
		ProductReviews:   db.Database.Collection("product_reviews"),
		ProductQuestions: db.Database.Collection("product_questions"),
		ProductWishlists: db.Database.Collection("product_wishlists"),
		ProductViews:     db.Database.Collection("product_views"),
		ProductFlags:     db.Database.Collection("product_flags"),
		ProductAnalytics: db.Database.Collection("product_analytics"),

		// Order related collections
		Orders:        db.Database.Collection("orders"),
		SwapDeals:     db.Database.Collection("swap_deals"),
		OrderDisputes: db.Database.Collection("order_disputes"),
		OrderTracking: db.Database.Collection("order_tracking"),
		OrderReturns:  db.Database.Collection("order_returns"),

		// Payment related collections
		Payments:           db.Database.Collection("payments"),
		Escrows:            db.Database.Collection("escrows"),
		WalletTransactions: db.Database.Collection("wallet_transactions"),
		PaymentWebhooks:    db.Database.Collection("payment_webhooks"),
		Refunds:            db.Database.Collection("refunds"),
		BankAccounts:       db.Database.Collection("bank_accounts"),
		Withdrawals:        db.Database.Collection("withdrawals"),

		// Chat related collections
		Conversations:     db.Database.Collection("conversations"),
		Messages:          db.Database.Collection("messages"),
		ChatNotifications: db.Database.Collection("chat_notifications"),
		ChatReports:       db.Database.Collection("chat_reports"),
		ChatMutes:         db.Database.Collection("chat_mutes"),
		ChatBlocks:        db.Database.Collection("chat_blocks"),
		OnlineStatuses:    db.Database.Collection("online_statuses"),
		MessageTemplates:  db.Database.Collection("message_templates"),
		ChatSettings:      db.Database.Collection("chat_settings"),

		// System collections
		AdminLogs:             db.Database.Collection("admin_logs"),
		SystemSettings:        db.Database.Collection("system_settings"),
		APIKeys:               db.Database.Collection("api_keys"),
		Notifications:         db.Database.Collection("notifications"),
		NotificationTemplates: db.Database.Collection("notification_templates"),

		// Badge & Gamification collections
		Badges:             db.Database.Collection("badges"),
		UserBadges:         db.Database.Collection("user_badges"),
		RewardPoints:       db.Database.Collection("reward_points"),
		PointsTransactions: db.Database.Collection("points_transactions"),

		// Alert & Deal collections
		PriceAlerts:    db.Database.Collection("price_alerts"),
		SavedSearches:  db.Database.Collection("saved_searches"),
		Wishlists:      db.Database.Collection("wishlists"),
		ExclusiveDeals: db.Database.Collection("exclusive_deals"),

		// Dispute & Report collections
		Disputes:           db.Database.Collection("disputes"),
		DisputeMessages:    db.Database.Collection("dispute_messages"),
		DisputeEvidence:    db.Database.Collection("dispute_evidence"),
		DisputeResolutions: db.Database.Collection("dispute_resolutions"),
		Reports:            db.Database.Collection("reports"),
		ModerationActions:  db.Database.Collection("moderation_actions"),
		ContentFlags:       db.Database.Collection("content_flags"),
		UserStrikes:        db.Database.Collection("user_strikes"),
		AppealRequests:     db.Database.Collection("appeal_requests"),
	}
}

// CreateIndexes creates all necessary database indexes for performance
func (db *Database) CreateIndexes(ctx context.Context, coll *Collections) error {
	log.Println("Creating database indexes...")

	// User indexes
	if err := db.createUserIndexes(ctx, coll); err != nil {
		return fmt.Errorf("failed to create user indexes: %w", err)
	}

	// Product indexes
	if err := db.createProductIndexes(ctx, coll); err != nil {
		return fmt.Errorf("failed to create product indexes: %w", err)
	}

	// Order indexes
	if err := db.createOrderIndexes(ctx, coll); err != nil {
		return fmt.Errorf("failed to create order indexes: %w", err)
	}

	// Payment indexes
	if err := db.createPaymentIndexes(ctx, coll); err != nil {
		return fmt.Errorf("failed to create payment indexes: %w", err)
	}

	// Chat indexes
	if err := db.createChatIndexes(ctx, coll); err != nil {
		return fmt.Errorf("failed to create chat indexes: %w", err)
	}

	// Notification & Badge indexes
	if err := db.createNotificationBadgeIndexes(ctx, coll); err != nil {
		return fmt.Errorf("failed to create notification/badge indexes: %w", err)
	}

	// Alert & Deal indexes
	if err := db.createAlertDealIndexes(ctx, coll); err != nil {
		return fmt.Errorf("failed to create alert/deal indexes: %w", err)
	}

	// Dispute & Report indexes
	if err := db.createDisputeReportIndexes(ctx, coll); err != nil {
		return fmt.Errorf("failed to create dispute/report indexes: %w", err)
	}

	log.Println("Successfully created all database indexes")
	return nil
}

// createUserIndexes creates indexes for user-related collections
func (db *Database) createUserIndexes(ctx context.Context, coll *Collections) error {
	// Users collection indexes
	userIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "email", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "username", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "phone", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "user_type", Value: 1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{{Key: "profile.verification_status", Value: 1}}},
		{Keys: bson.D{{Key: "profile.premium_status", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
		{Keys: bson.D{{Key: "profile.rating", Value: -1}}},
	}

	_, err := coll.Users.Indexes().CreateMany(ctx, userIndexes)
	if err != nil {
		return err
	}

	// User sessions indexes
	sessionIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "user_id", Value: 1}}},
		{Keys: bson.D{{Key: "session_token", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "expires_at", Value: 1}}, Options: options.Index().SetExpireAfterSeconds(0)},
		{Keys: bson.D{{Key: "is_active", Value: 1}}},
	}

	_, err = coll.UserSessions.Indexes().CreateMany(ctx, sessionIndexes)
	if err != nil {
		return err
	}

	// User activities indexes
	activityIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "user_id", Value: 1}, {Key: "timestamp", Value: -1}}},
		{Keys: bson.D{{Key: "action", Value: 1}}},
		{Keys: bson.D{{Key: "timestamp", Value: -1}}},
	}

	_, err = coll.UserActivities.Indexes().CreateMany(ctx, activityIndexes)
	return err
}

// createProductIndexes creates indexes for product-related collections
func (db *Database) createProductIndexes(ctx context.Context, coll *Collections) error {
	// Products collection indexes
	productIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "seller_id", Value: 1}}},
		{Keys: bson.D{{Key: "category_id", Value: 1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{{Key: "price", Value: 1}}},
		{Keys: bson.D{{Key: "condition", Value: 1}}},
		{Keys: bson.D{{Key: "location.city", Value: 1}}},
		{Keys: bson.D{{Key: "location.state", Value: 1}}},
		{Keys: bson.D{{Key: "location.country", Value: 1}}},
		{Keys: bson.D{{Key: "swap_available", Value: 1}}},
		{Keys: bson.D{{Key: "is_featured", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
		{Keys: bson.D{{Key: "view_count", Value: -1}}},
		{Keys: bson.D{{Key: "title", Value: "text"}, {Key: "description", Value: "text"}, {Key: "tags", Value: "text"}}},
		{Keys: bson.D{{Key: "location.coordinates", Value: "2dsphere"}}},
	}

	_, err := coll.Products.Indexes().CreateMany(ctx, productIndexes)
	if err != nil {
		return err
	}

	// Categories collection indexes
	categoryIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "slug", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "parent_id", Value: 1}}},
		{Keys: bson.D{{Key: "is_active", Value: 1}}},
		{Keys: bson.D{{Key: "sort_order", Value: 1}}},
	}

	_, err = coll.Categories.Indexes().CreateMany(ctx, categoryIndexes)
	if err != nil {
		return err
	}

	// Product reviews indexes
	reviewIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "product_id", Value: 1}}},
		{Keys: bson.D{{Key: "user_id", Value: 1}}},
		{Keys: bson.D{{Key: "order_id", Value: 1}}},
		{Keys: bson.D{{Key: "rating", Value: 1}}},
		{Keys: bson.D{{Key: "is_approved", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
	}

	_, err = coll.ProductReviews.Indexes().CreateMany(ctx, reviewIndexes)
	return err
}

// createOrderIndexes creates indexes for order-related collections
func (db *Database) createOrderIndexes(ctx context.Context, coll *Collections) error {
	// Orders collection indexes
	orderIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "order_number", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "buyer_id", Value: 1}}},
		{Keys: bson.D{{Key: "seller_id", Value: 1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{{Key: "payment_status", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
		{Keys: bson.D{{Key: "total_amount", Value: 1}}},
	}

	_, err := coll.Orders.Indexes().CreateMany(ctx, orderIndexes)
	if err != nil {
		return err
	}

	// Swap deals indexes
	swapIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "swap_number", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "initiator_id", Value: 1}}},
		{Keys: bson.D{{Key: "recipient_id", Value: 1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
	}

	_, err = coll.SwapDeals.Indexes().CreateMany(ctx, swapIndexes)
	return err
}

// createPaymentIndexes creates indexes for payment-related collections
func (db *Database) createPaymentIndexes(ctx context.Context, coll *Collections) error {
	// Payments collection indexes
	paymentIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "payment_number", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "user_id", Value: 1}}},
		{Keys: bson.D{{Key: "order_id", Value: 1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{{Key: "payment_gateway", Value: 1}}},
		{Keys: bson.D{{Key: "gateway_payment_id", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
	}

	_, err := coll.Payments.Indexes().CreateMany(ctx, paymentIndexes)
	if err != nil {
		return err
	}

	// Wallet transactions indexes
	walletIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "user_id", Value: 1}, {Key: "created_at", Value: -1}}},
		{Keys: bson.D{{Key: "transaction_number", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "type", Value: 1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
	}

	_, err = coll.WalletTransactions.Indexes().CreateMany(ctx, walletIndexes)
	return err
}

// createChatIndexes creates indexes for chat-related collections
func (db *Database) createChatIndexes(ctx context.Context, coll *Collections) error {
	// Conversations collection indexes
	conversationIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "participants", Value: 1}}},
		{Keys: bson.D{{Key: "type", Value: 1}}},
		{Keys: bson.D{{Key: "last_message_at", Value: -1}}},
		{Keys: bson.D{{Key: "product_id", Value: 1}}},
		{Keys: bson.D{{Key: "order_id", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
	}

	_, err := coll.Conversations.Indexes().CreateMany(ctx, conversationIndexes)
	if err != nil {
		return err
	}

	// Messages collection indexes
	messageIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "conversation_id", Value: 1}, {Key: "created_at", Value: -1}}},
		{Keys: bson.D{{Key: "sender_id", Value: 1}}},
		{Keys: bson.D{{Key: "type", Value: 1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
	}

	_, err = coll.Messages.Indexes().CreateMany(ctx, messageIndexes)
	return err
}

// createNotificationBadgeIndexes creates indexes for notification and badge collections
func (db *Database) createNotificationBadgeIndexes(ctx context.Context, coll *Collections) error {
	// Notifications indexes
	notificationIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "user_id", Value: 1}, {Key: "created_at", Value: -1}}},
		{Keys: bson.D{{Key: "type", Value: 1}}},
		{Keys: bson.D{{Key: "is_read", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
	}

	_, err := coll.Notifications.Indexes().CreateMany(ctx, notificationIndexes)
	if err != nil {
		return err
	}

	// Badges indexes
	badgeIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "type", Value: 1}}},
		{Keys: bson.D{{Key: "category", Value: 1}}},
		{Keys: bson.D{{Key: "level", Value: 1}}},
		{Keys: bson.D{{Key: "is_active", Value: 1}}},
	}

	_, err = coll.Badges.Indexes().CreateMany(ctx, badgeIndexes)
	if err != nil {
		return err
	}

	// User badges indexes
	userBadgeIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "user_id", Value: 1}}},
		{Keys: bson.D{{Key: "badge_id", Value: 1}}},
		{Keys: bson.D{{Key: "earned_at", Value: -1}}},
	}

	_, err = coll.UserBadges.Indexes().CreateMany(ctx, userBadgeIndexes)
	if err != nil {
		return err
	}

	// Reward points indexes
	rewardPointsIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "user_id", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "current_tier", Value: 1}}},
	}

	_, err = coll.RewardPoints.Indexes().CreateMany(ctx, rewardPointsIndexes)
	return err
}

// createAlertDealIndexes creates indexes for alert and deal collections
func (db *Database) createAlertDealIndexes(ctx context.Context, coll *Collections) error {
	// Price alerts indexes
	priceAlertIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "user_id", Value: 1}}},
		{Keys: bson.D{{Key: "product_id", Value: 1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{{Key: "is_active", Value: 1}}},
	}

	_, err := coll.PriceAlerts.Indexes().CreateMany(ctx, priceAlertIndexes)
	if err != nil {
		return err
	}

	// Saved searches indexes
	savedSearchIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "user_id", Value: 1}}},
		{Keys: bson.D{{Key: "is_active", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
	}

	_, err = coll.SavedSearches.Indexes().CreateMany(ctx, savedSearchIndexes)
	if err != nil {
		return err
	}

	// Wishlists indexes
	wishlistIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "user_id", Value: 1}}},
		{Keys: bson.D{{Key: "is_private", Value: 1}}},
		{Keys: bson.D{{Key: "share_token", Value: 1}}, Options: options.Index().SetUnique(true).SetSparse(true)},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
	}

	_, err = coll.Wishlists.Indexes().CreateMany(ctx, wishlistIndexes)
	if err != nil {
		return err
	}

	// Exclusive deals indexes
	exclusiveDealIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "deal_type", Value: 1}}},
		{Keys: bson.D{{Key: "required_tier", Value: 1}}},
		{Keys: bson.D{{Key: "is_active", Value: 1}}},
		{Keys: bson.D{{Key: "start_date", Value: 1}}},
		{Keys: bson.D{{Key: "end_date", Value: 1}}},
	}

	_, err = coll.ExclusiveDeals.Indexes().CreateMany(ctx, exclusiveDealIndexes)
	return err
}

// createDisputeReportIndexes creates indexes for dispute and report collections
func (db *Database) createDisputeReportIndexes(ctx context.Context, coll *Collections) error {
	// Disputes indexes
	disputeIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "order_id", Value: 1}}},
		{Keys: bson.D{{Key: "buyer_id", Value: 1}}},
		{Keys: bson.D{{Key: "seller_id", Value: 1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{{Key: "priority", Value: -1}}},
		{Keys: bson.D{{Key: "is_escalated", Value: 1}}},
		{Keys: bson.D{{Key: "assigned_to", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
	}

	_, err := coll.Disputes.Indexes().CreateMany(ctx, disputeIndexes)
	if err != nil {
		return err
	}

	// Dispute messages indexes
	disputeMessageIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "dispute_id", Value: 1}, {Key: "created_at", Value: 1}}},
		{Keys: bson.D{{Key: "sender_id", Value: 1}}},
		{Keys: bson.D{{Key: "is_internal", Value: 1}}},
	}

	_, err = coll.DisputeMessages.Indexes().CreateMany(ctx, disputeMessageIndexes)
	if err != nil {
		return err
	}

	// Reports indexes
	reportIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "reporter_id", Value: 1}}},
		{Keys: bson.D{{Key: "reported_user_id", Value: 1}}},
		{Keys: bson.D{{Key: "type", Value: 1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{{Key: "priority", Value: -1}}},
		{Keys: bson.D{{Key: "is_escalated", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
	}

	_, err = coll.Reports.Indexes().CreateMany(ctx, reportIndexes)
	if err != nil {
		return err
	}

	// Moderation actions indexes
	moderationIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "report_id", Value: 1}}},
		{Keys: bson.D{{Key: "target_user_id", Value: 1}}},
		{Keys: bson.D{{Key: "actioned_by", Value: 1}}},
		{Keys: bson.D{{Key: "action_type", Value: 1}}},
		{Keys: bson.D{{Key: "is_appealed", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
	}

	_, err = coll.ModerationActions.Indexes().CreateMany(ctx, moderationIndexes)
	if err != nil {
		return err
	}

	// Content flags indexes
	contentFlagIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "content_type", Value: 1}}},
		{Keys: bson.D{{Key: "content_id", Value: 1}}},
		{Keys: bson.D{{Key: "owner_id", Value: 1}}},
		{Keys: bson.D{{Key: "flag_type", Value: 1}}},
		{Keys: bson.D{{Key: "is_automatic", Value: 1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
	}

	_, err = coll.ContentFlags.Indexes().CreateMany(ctx, contentFlagIndexes)
	if err != nil {
		return err
	}

	// User strikes indexes
	userStrikeIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "user_id", Value: 1}}},
		{Keys: bson.D{{Key: "is_active", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
	}

	_, err = coll.UserStrikes.Indexes().CreateMany(ctx, userStrikeIndexes)
	return err
}

// CloseDatabase closes the MongoDB connection
func (db *Database) CloseDatabase(ctx context.Context) error {
	return db.Client.Disconnect(ctx)
}

// Helper function to get environment variables with default values
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// InitializeDatabase initializes the complete database setup
func InitializeDatabase() error {
	var err error

	// Connect to database
	DB, err = ConnectDatabase()
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Initialize collections
	Coll = DB.InitializeCollections()

	// Create indexes
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := DB.CreateIndexes(ctx, Coll); err != nil {
		return fmt.Errorf("failed to create indexes: %w", err)
	}

	log.Println("Database initialization completed successfully")
	return nil
}