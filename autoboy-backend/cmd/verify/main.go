package main

import (
	"context"
	"log"
	"time"

	"autoboy-backend/config"

	"go.mongodb.org/mongo-driver/bson"
)

func main() {
	log.Println("🔍 Verifying AutoBoy API setup...")

	// Test database connection
	if err := config.InitializeDatabase(); err != nil {
		log.Fatalf("❌ Database connection failed: %v", err)
	}
	log.Println("✅ Database connection successful")

	// Test collections
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check categories
	categoryCount, err := config.Coll.Categories.CountDocuments(ctx, bson.M{})
	if err != nil {
		log.Printf("⚠️  Categories collection error: %v", err)
	} else {
		log.Printf("✅ Categories collection: %d documents", categoryCount)
	}

	// Check users
	userCount, err := config.Coll.Users.CountDocuments(ctx, bson.M{})
	if err != nil {
		log.Printf("⚠️  Users collection error: %v", err)
	} else {
		log.Printf("✅ Users collection: %d documents", userCount)
	}

	// Check products
	productCount, err := config.Coll.Products.CountDocuments(ctx, bson.M{})
	if err != nil {
		log.Printf("⚠️  Products collection error: %v", err)
	} else {
		log.Printf("✅ Products collection: %d documents", productCount)
	}

	log.Println("🎉 Setup verification completed!")
}