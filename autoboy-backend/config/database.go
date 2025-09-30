package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

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
		AdminLogs:      db.Database.Collection("admin_logs"),
		SystemSettings: db.Database.Collection("system_settings"),
		APIKeys:        db.Database.Collection("api_keys"),
		Notifications:  db.Database.Collection("notifications"),
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

	log.Println("Successfully created all database indexes")
	return nil
}

// createUserIndexes creates indexes for user-related collections
func (db *Database) createUserIndexes(ctx context.Context, coll *Collections) error {
	// Users collection indexes
	userIndexes := []mongo.IndexModel{
		{Keys: map[string]int{"email": 1}, Options: options.Index().SetUnique(true)},
		{Keys: map[string]int{"username": 1}, Options: options.Index().SetUnique(true)},
		{Keys: map[string]int{"phone": 1}, Options: options.Index().SetUnique(true)},
		{Keys: map[string]int{"user_type": 1}},
		{Keys: map[string]int{"status": 1}},
		{Keys: map[string]int{"profile.verification_status": 1}},
		{Keys: map[string]int{"profile.premium_status": 1}},
		{Keys: map[string]int{"created_at": -1}},
		{Keys: map[string]int{"profile.rating": -1}},
	}

	_, err := coll.Users.Indexes().CreateMany(ctx, userIndexes)
	if err != nil {
		return err
	}

	// User sessions indexes
	sessionIndexes := []mongo.IndexModel{
		{Keys: map[string]int{"user_id": 1}},
		{Keys: map[string]int{"session_token": 1}, Options: options.Index().SetUnique(true)},
		{Keys: map[string]int{"expires_at": 1}, Options: options.Index().SetExpireAfterSeconds(0)},
		{Keys: map[string]int{"is_active": 1}},
	}

	_, err = coll.UserSessions.Indexes().CreateMany(ctx, sessionIndexes)
	if err != nil {
		return err
	}

	// User activities indexes
	activityIndexes := []mongo.IndexModel{
		{Keys: map[string]int{"user_id": 1, "timestamp": -1}},
		{Keys: map[string]int{"action": 1}},
		{Keys: map[string]int{"timestamp": -1}},
	}

	_, err = coll.UserActivities.Indexes().CreateMany(ctx, activityIndexes)
	return err
}

// createProductIndexes creates indexes for product-related collections
func (db *Database) createProductIndexes(ctx context.Context, coll *Collections) error {
	// Products collection indexes
	productIndexes := []mongo.IndexModel{
		{Keys: map[string]int{"seller_id": 1}},
		{Keys: map[string]int{"category_id": 1}},
		{Keys: map[string]int{"status": 1}},
		{Keys: map[string]int{"price": 1}},
		{Keys: map[string]int{"condition": 1}},
		{Keys: map[string]int{"location.city": 1}},
		{Keys: map[string]int{"location.state": 1}},
		{Keys: map[string]int{"location.country": 1}},
		{Keys: map[string]int{"swap_available": 1}},
		{Keys: map[string]int{"is_featured": 1}},
		{Keys: map[string]int{"created_at": -1}},
		{Keys: map[string]int{"view_count": -1}},
		{Keys: map[string]interface{}{"title": "text", "description": "text", "tags": "text"}},
		{Keys: map[string]interface{}{"location.coordinates": "2dsphere"}},
	}

	_, err := coll.Products.Indexes().CreateMany(ctx, productIndexes)
	if err != nil {
		return err
	}

	// Categories collection indexes
	categoryIndexes := []mongo.IndexModel{
		{Keys: map[string]int{"slug": 1}, Options: options.Index().SetUnique(true)},
		{Keys: map[string]int{"parent_id": 1}},
		{Keys: map[string]int{"is_active": 1}},
		{Keys: map[string]int{"sort_order": 1}},
	}

	_, err = coll.Categories.Indexes().CreateMany(ctx, categoryIndexes)
	if err != nil {
		return err
	}

	// Product reviews indexes
	reviewIndexes := []mongo.IndexModel{
		{Keys: map[string]int{"product_id": 1}},
		{Keys: map[string]int{"user_id": 1}},
		{Keys: map[string]int{"order_id": 1}},
		{Keys: map[string]int{"rating": 1}},
		{Keys: map[string]int{"is_approved": 1}},
		{Keys: map[string]int{"created_at": -1}},
	}

	_, err = coll.ProductReviews.Indexes().CreateMany(ctx, reviewIndexes)
	return err
}

// createOrderIndexes creates indexes for order-related collections
func (db *Database) createOrderIndexes(ctx context.Context, coll *Collections) error {
	// Orders collection indexes
	orderIndexes := []mongo.IndexModel{
		{Keys: map[string]int{"order_number": 1}, Options: options.Index().SetUnique(true)},
		{Keys: map[string]int{"buyer_id": 1}},
		{Keys: map[string]int{"seller_id": 1}},
		{Keys: map[string]int{"status": 1}},
		{Keys: map[string]int{"payment_status": 1}},
		{Keys: map[string]int{"created_at": -1}},
		{Keys: map[string]int{"total_amount": 1}},
	}

	_, err := coll.Orders.Indexes().CreateMany(ctx, orderIndexes)
	if err != nil {
		return err
	}

	// Swap deals indexes
	swapIndexes := []mongo.IndexModel{
		{Keys: map[string]int{"swap_number": 1}, Options: options.Index().SetUnique(true)},
		{Keys: map[string]int{"initiator_id": 1}},
		{Keys: map[string]int{"recipient_id": 1}},
		{Keys: map[string]int{"status": 1}},
		{Keys: map[string]int{"created_at": -1}},
	}

	_, err = coll.SwapDeals.Indexes().CreateMany(ctx, swapIndexes)
	return err
}

// createPaymentIndexes creates indexes for payment-related collections
func (db *Database) createPaymentIndexes(ctx context.Context, coll *Collections) error {
	// Payments collection indexes
	paymentIndexes := []mongo.IndexModel{
		{Keys: map[string]int{"payment_number": 1}, Options: options.Index().SetUnique(true)},
		{Keys: map[string]int{"user_id": 1}},
		{Keys: map[string]int{"order_id": 1}},
		{Keys: map[string]int{"status": 1}},
		{Keys: map[string]int{"payment_gateway": 1}},
		{Keys: map[string]int{"gateway_payment_id": 1}},
		{Keys: map[string]int{"created_at": -1}},
	}

	_, err := coll.Payments.Indexes().CreateMany(ctx, paymentIndexes)
	if err != nil {
		return err
	}

	// Wallet transactions indexes
	walletIndexes := []mongo.IndexModel{
		{Keys: map[string]int{"user_id": 1, "created_at": -1}},
		{Keys: map[string]int{"transaction_number": 1}, Options: options.Index().SetUnique(true)},
		{Keys: map[string]int{"type": 1}},
		{Keys: map[string]int{"status": 1}},
	}

	_, err = coll.WalletTransactions.Indexes().CreateMany(ctx, walletIndexes)
	return err
}

// createChatIndexes creates indexes for chat-related collections
func (db *Database) createChatIndexes(ctx context.Context, coll *Collections) error {
	// Conversations collection indexes
	conversationIndexes := []mongo.IndexModel{
		{Keys: map[string]int{"participants": 1}},
		{Keys: map[string]int{"type": 1}},
		{Keys: map[string]int{"last_message_at": -1}},
		{Keys: map[string]int{"product_id": 1}},
		{Keys: map[string]int{"order_id": 1}},
		{Keys: map[string]int{"created_at": -1}},
	}

	_, err := coll.Conversations.Indexes().CreateMany(ctx, conversationIndexes)
	if err != nil {
		return err
	}

	// Messages collection indexes
	messageIndexes := []mongo.IndexModel{
		{Keys: map[string]int{"conversation_id": 1, "created_at": -1}},
		{Keys: map[string]int{"sender_id": 1}},
		{Keys: map[string]int{"type": 1}},
		{Keys: map[string]int{"status": 1}},
		{Keys: map[string]int{"created_at": -1}},
	}

	_, err = coll.Messages.Indexes().CreateMany(ctx, messageIndexes)
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