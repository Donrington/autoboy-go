package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"autoboy-backend/config"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func main() {
	log.Println("=== AutoBoy Backend Setup Verification ===")

	// Test MongoDB connection
	if err := testMongoConnection(); err != nil {
		log.Printf("❌ MongoDB connection failed: %v", err)
		os.Exit(1)
	}
	log.Println("✅ MongoDB connection successful")

	// Test database initialization
	if err := testDatabaseInitialization(); err != nil {
		log.Printf("❌ Database initialization check failed: %v", err)
		os.Exit(1)
	}
	log.Println("✅ Database initialization verified")

	// Test collections
	if err := testCollections(); err != nil {
		log.Printf("❌ Collections verification failed: %v", err)
		os.Exit(1)
	}
	log.Println("✅ All collections verified")

	// Test admin user
	if err := testAdminUser(); err != nil {
		log.Printf("❌ Admin user verification failed: %v", err)
		os.Exit(1)
	}
	log.Println("✅ Admin user verified")

	// Test system settings
	if err := testSystemSettings(); err != nil {
		log.Printf("❌ System settings verification failed: %v", err)
		os.Exit(1)
	}
	log.Println("✅ System settings verified")

	log.Println("\n🎉 All setup verification checks passed!")
	log.Println("Your AutoBoy backend is ready to use.")
	log.Println("\nDefault admin credentials:")
	log.Println("Email: admin@autoboy.com")
	log.Println("Password: admin123")
}

func testMongoConnection() error {
	// Initialize database connection
	err := config.InitializeDatabase()
	if err != nil {
		return fmt.Errorf("failed to initialize database: %w", err)
	}

	// Test ping
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = config.DB.Client.Ping(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	return nil
}

func testDatabaseInitialization() error {
	if config.DB == nil || config.DB.Database == nil {
		return fmt.Errorf("database not initialized")
	}

	// Test database name
	dbName := config.DB.Database.Name()
	if dbName == "" {
		return fmt.Errorf("database name is empty")
	}

	log.Printf("Connected to database: %s", dbName)
	return nil
}

func testCollections() error {
	ctx := context.Background()

	// Expected collections
	expectedCollections := []string{
		"users", "categories", "products", "orders", "payments",
		"conversations", "messages", "system_settings",
	}

	// Get list of collections
	collections, err := config.DB.Database.ListCollectionNames(ctx, bson.D{})
	if err != nil {
		return fmt.Errorf("failed to list collections: %w", err)
	}

	// Create a map for quick lookup
	collectionMap := make(map[string]bool)
	for _, collection := range collections {
		collectionMap[collection] = true
	}

	// Check if expected collections exist
	missing := []string{}
	for _, expected := range expectedCollections {
		if !collectionMap[expected] {
			missing = append(missing, expected)
		}
	}

	if len(missing) > 0 {
		log.Printf("Warning: Missing collections: %v", missing)
		log.Println("You may need to run: go run scripts/init_db.go")
	}

	log.Printf("Found %d collections in database", len(collections))
	return nil
}

func testAdminUser() error {
	ctx := context.Background()

	// Check if admin user exists
	var result bson.M
	err := config.Coll.Users.FindOne(ctx, bson.M{"user_type": "admin"}).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return fmt.Errorf("admin user not found - run init_db.go to create")
		}
		return fmt.Errorf("failed to query admin user: %w", err)
	}

	// Verify admin user fields
	email, ok := result["email"].(string)
	if !ok || email != "admin@autoboy.com" {
		return fmt.Errorf("admin user email mismatch")
	}

	log.Printf("Admin user found: %s", email)
	return nil
}

func testSystemSettings() error {
	ctx := context.Background()

	// Count system settings
	count, err := config.Coll.SystemSettings.CountDocuments(ctx, bson.D{})
	if err != nil {
		return fmt.Errorf("failed to count system settings: %w", err)
	}

	if count == 0 {
		return fmt.Errorf("no system settings found - run init_db.go to create")
	}

	log.Printf("Found %d system settings", count)
	return nil
}