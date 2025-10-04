package main

import (
	"context"
	"log"
	"time"

	"autoboy-backend/config"
	"autoboy-backend/models"
	"autoboy-backend/utils"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func main() {
	if err := config.InitializeDatabase(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	ctx := context.Background()
	log.Println("Starting database initialization...")

	createDefaultCategories(ctx)
	createAdminUser(ctx)
	createSampleProducts(ctx)
	createSystemSettings(ctx)
	createDefaultBadges(ctx)
	createNotificationTemplates(ctx)
	log.Println("Database initialization completed successfully!")
}

func createDefaultCategories(ctx context.Context) {
	categories := []models.Category{
		{ID: primitive.NewObjectID(), Name: "Phones & Tablets", Slug: "phones-tablets", Description: "Mobile phones, tablets, and accessories", IsActive: true, SortOrder: 1, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Laptops & Computers", Slug: "laptops-computers", Description: "Laptops, desktops, and computer accessories", IsActive: true, SortOrder: 2, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Gaming", Slug: "gaming", Description: "Gaming consoles, accessories, and games", IsActive: true, SortOrder: 3, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Audio & Video", Slug: "audio-video", Description: "Headphones, speakers, cameras, and more", IsActive: true, SortOrder: 4, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Wearables", Slug: "wearables", Description: "Smartwatches, fitness trackers, and accessories", IsActive: true, SortOrder: 5, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Home & Office", Slug: "home-office", Description: "Smart home devices, office equipment", IsActive: true, SortOrder: 6, CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}

	var docs []interface{}
	for _, cat := range categories {
		docs = append(docs, cat)
	}

	_, err := config.Coll.Categories.InsertMany(ctx, docs)
	if err != nil {
		log.Printf("Error creating categories: %v", err)
	} else {
		log.Println("6 categories created successfully")
	}
}

func createSampleProducts(ctx context.Context) {
	// Get categories
	cursor, _ := config.Coll.Categories.Find(ctx, primitive.M{})
	var categories []models.Category
	cursor.All(ctx, &categories)

	// Create multiple sellers
	sellers := createSellers(ctx)

	// Create comprehensive products
	products := []models.Product{
		{ID: primitive.NewObjectID(), Title: "iPhone 15 Pro Max 256GB", Price: 1200000, Currency: "NGN", Description: "Brand new iPhone 15 Pro Max with 256GB storage, A17 Pro chip, titanium design", Condition: models.ProductConditionNew, Brand: "Apple", Model: "iPhone 15 Pro Max", Color: "Natural Titanium", CategoryID: categories[0].ID, SellerID: sellers[0], Images: []models.ProductMedia{{ID: primitive.NewObjectID(), URL: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop", Type: "image", Format: "jpg", SortOrder: 1, IsMain: true, UploadedAt: time.Now()}}, Specifications: map[string]interface{}{"storage": "256GB", "ram": "8GB", "screen": "6.7 inches", "camera": "48MP"}, Quantity: 5, Location: models.ProductLocation{City: "Lagos", State: "Lagos", Country: "Nigeria"}, Status: models.ProductStatusActive, Tags: []string{"iphone", "apple", "smartphone"}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Title: "MacBook Pro M3 16GB", Price: 2500000, Currency: "NGN", Description: "Latest MacBook Pro with M3 chip, 16GB RAM, 512GB SSD", Condition: models.ProductConditionNew, Brand: "Apple", Model: "MacBook Pro M3", Color: "Space Gray", CategoryID: categories[1].ID, SellerID: sellers[1], Images: []models.ProductMedia{{ID: primitive.NewObjectID(), URL: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop", Type: "image", Format: "jpg", SortOrder: 1, IsMain: true, UploadedAt: time.Now()}}, Specifications: map[string]interface{}{"processor": "Apple M3", "ram": "16GB", "storage": "512GB SSD"}, Quantity: 3, Location: models.ProductLocation{City: "Abuja", State: "FCT", Country: "Nigeria"}, Status: models.ProductStatusActive, Tags: []string{"macbook", "apple", "laptop"}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Title: "Samsung Galaxy S24 Ultra", Price: 950000, Currency: "NGN", Description: "Samsung Galaxy S24 Ultra with S Pen, 256GB storage", Condition: models.ProductConditionNew, Brand: "Samsung", Model: "Galaxy S24 Ultra", Color: "Titanium Black", CategoryID: categories[0].ID, SellerID: sellers[0], Images: []models.ProductMedia{{ID: primitive.NewObjectID(), URL: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=600&fit=crop", Type: "image", Format: "jpg", SortOrder: 1, IsMain: true, UploadedAt: time.Now()}}, Specifications: map[string]interface{}{"storage": "256GB", "ram": "12GB", "screen": "6.8 inches"}, Quantity: 8, Location: models.ProductLocation{City: "Lagos", State: "Lagos", Country: "Nigeria"}, Status: models.ProductStatusActive, Tags: []string{"samsung", "galaxy", "android"}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Title: "PlayStation 5 Console", Price: 650000, Currency: "NGN", Description: "Sony PlayStation 5 gaming console with DualSense controller", Condition: models.ProductConditionNew, Brand: "Sony", Model: "PlayStation 5", Color: "White", CategoryID: categories[2].ID, SellerID: sellers[2], Images: []models.ProductMedia{{ID: primitive.NewObjectID(), URL: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&h=600&fit=crop", Type: "image", Format: "jpg", SortOrder: 1, IsMain: true, UploadedAt: time.Now()}}, Specifications: map[string]interface{}{"storage": "825GB SSD", "cpu": "AMD Zen 2", "gpu": "AMD RDNA 2"}, Quantity: 2, Location: models.ProductLocation{City: "Port Harcourt", State: "Rivers", Country: "Nigeria"}, Status: models.ProductStatusActive, Tags: []string{"playstation", "gaming", "console"}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Title: "AirPods Pro 2nd Gen", Price: 280000, Currency: "NGN", Description: "Apple AirPods Pro with Active Noise Cancellation", Condition: models.ProductConditionNew, Brand: "Apple", Model: "AirPods Pro", Color: "White", CategoryID: categories[3].ID, SellerID: sellers[1], Images: []models.ProductMedia{{ID: primitive.NewObjectID(), URL: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&h=600&fit=crop", Type: "image", Format: "jpg", SortOrder: 1, IsMain: true, UploadedAt: time.Now()}}, Specifications: map[string]interface{}{"battery": "6 hours", "features": "ANC, Spatial Audio"}, Quantity: 10, Location: models.ProductLocation{City: "Abuja", State: "FCT", Country: "Nigeria"}, Status: models.ProductStatusActive, Tags: []string{"airpods", "apple", "wireless"}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Title: "Apple Watch Series 9", Price: 450000, Currency: "NGN", Description: "Apple Watch Series 9 with GPS, 45mm case", Condition: models.ProductConditionNew, Brand: "Apple", Model: "Watch Series 9", Color: "Midnight", CategoryID: categories[4].ID, SellerID: sellers[2], Images: []models.ProductMedia{{ID: primitive.NewObjectID(), URL: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&h=600&fit=crop", Type: "image", Format: "jpg", SortOrder: 1, IsMain: true, UploadedAt: time.Now()}}, Specifications: map[string]interface{}{"size": "45mm", "battery": "18 hours", "features": "GPS, Health sensors"}, Quantity: 6, Location: models.ProductLocation{City: "Kano", State: "Kano", Country: "Nigeria"}, Status: models.ProductStatusActive, Tags: []string{"apple", "watch", "smartwatch"}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}

	var productDocs []interface{}
	for _, product := range products {
		productDocs = append(productDocs, product)
	}
	config.Coll.Products.InsertMany(ctx, productDocs)
	log.Printf("%d products created successfully", len(products))
}

func createSellers(ctx context.Context) []primitive.ObjectID {
	sellers := []models.User{
		{ID: primitive.NewObjectID(), Username: "techstore_ng", Email: "tech@autoboy.ng", Password: hashPassword("seller123"), Phone: "2348123456789", UserType: models.UserTypeSeller, Status: models.UserStatusActive, IsEmailVerified: true, IsPhoneVerified: true, CreatedAt: time.Now(), UpdatedAt: time.Now(), Profile: models.Profile{FirstName: "Tech", LastName: "Store", BusinessName: "TechStore Nigeria", VerificationStatus: models.VerificationStatusVerified, PremiumStatus: models.PremiumStatusNone, BadgeLevel: 4, Rating: 4.8, TotalRatings: 156, Preferences: models.UserPreferences{Language: "en", Currency: "NGN", Timezone: "Africa/Lagos"}}},
		{ID: primitive.NewObjectID(), Username: "gadget_hub", Email: "hub@autoboy.ng", Password: hashPassword("seller123"), Phone: "2348987654321", UserType: models.UserTypeSeller, Status: models.UserStatusActive, IsEmailVerified: true, IsPhoneVerified: true, CreatedAt: time.Now(), UpdatedAt: time.Now(), Profile: models.Profile{FirstName: "Gadget", LastName: "Hub", BusinessName: "Gadget Hub Abuja", VerificationStatus: models.VerificationStatusVerified, PremiumStatus: models.PremiumStatusPremium, BadgeLevel: 5, Rating: 4.9, TotalRatings: 203, Preferences: models.UserPreferences{Language: "en", Currency: "NGN", Timezone: "Africa/Lagos"}}},
		{ID: primitive.NewObjectID(), Username: "digital_world", Email: "digital@autoboy.ng", Password: hashPassword("seller123"), Phone: "2347012345678", UserType: models.UserTypeSeller, Status: models.UserStatusActive, IsEmailVerified: true, IsPhoneVerified: true, CreatedAt: time.Now(), UpdatedAt: time.Now(), Profile: models.Profile{FirstName: "Digital", LastName: "World", BusinessName: "Digital World PH", VerificationStatus: models.VerificationStatusVerified, PremiumStatus: models.PremiumStatusNone, BadgeLevel: 3, Rating: 4.6, TotalRatings: 89, Preferences: models.UserPreferences{Language: "en", Currency: "NGN", Timezone: "Africa/Lagos"}}},
	}

	var sellerDocs []interface{}
	var sellerIDs []primitive.ObjectID
	for _, seller := range sellers {
		sellerDocs = append(sellerDocs, seller)
		sellerIDs = append(sellerIDs, seller.ID)
	}
	config.Coll.Users.InsertMany(ctx, sellerDocs)
	log.Printf("%d sellers created successfully", len(sellers))
	return sellerIDs
}

func hashPassword(password string) string {
	hashed, _ := utils.HashPassword(password)
	return hashed
}

func createAdminUser(ctx context.Context) {
	hashedPassword, _ := utils.HashPassword("Admin123!")
	admin := models.User{
		ID: primitive.NewObjectID(), Username: "admin", Email: "admin@autoboy.ng", Password: hashedPassword,
		Phone: "2348000000000", UserType: models.UserTypeAdmin, Status: models.UserStatusActive,
		IsEmailVerified: true, IsPhoneVerified: true, CreatedAt: time.Now(), UpdatedAt: time.Now(),
		Profile: models.Profile{
			FirstName: "System", LastName: "Administrator", VerificationStatus: models.VerificationStatusVerified,
			PremiumStatus: models.PremiumStatusVIP, BadgeLevel: 10, Rating: 5.0, TotalRatings: 1,
			Preferences: models.UserPreferences{Language: "en", Currency: "NGN", Timezone: "Africa/Lagos"},
		},
	}
	config.Coll.Users.InsertOne(ctx, admin)
	log.Println("Admin user created successfully")
	log.Println("Admin credentials: admin@autoboy.ng / Admin123!")
}

func createSystemSettings(ctx context.Context) {
	log.Println("Creating system settings...")
	settings := []map[string]interface{}{
		{"_id": primitive.NewObjectID(), "key": "platform_name", "value": "AutoBoy", "description": "Platform name", "type": "string", "created_at": time.Now(), "updated_at": time.Now()},
		{"_id": primitive.NewObjectID(), "key": "commission_rate", "value": 0.05, "description": "Platform commission rate", "type": "number", "created_at": time.Now(), "updated_at": time.Now()},
		{"_id": primitive.NewObjectID(), "key": "default_currency", "value": "NGN", "description": "Default platform currency", "type": "string", "created_at": time.Now(), "updated_at": time.Now()},
		{"_id": primitive.NewObjectID(), "key": "escrow_auto_release_days", "value": 7, "description": "Days after which escrow is auto-released", "type": "number", "created_at": time.Now(), "updated_at": time.Now()},
	}
	var docs []interface{}
	for _, setting := range settings {
		docs = append(docs, setting)
	}
	config.Coll.SystemSettings.InsertMany(ctx, docs)
	log.Printf("%d system settings created", len(settings))
}

func createDefaultBadges(ctx context.Context) {
	log.Println("Creating default badges...")
	badges := []models.Badge{
		{ID: primitive.NewObjectID(), Name: "Verified Buyer", Description: "Completed identity verification", Type: models.BadgeTypeBuyer, Level: models.BadgeLevelBronze, IconURL: "/badges/shield.svg", Color: "#4169E1", RequirementType: "verification", RequiredValue: 1, IsActive: true, IsVisible: true, Perks: []string{"Increased trust", "Access to premium listings"}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Top Seller", Description: "Completed over 100 successful sales", Type: models.BadgeTypeSeller, Level: models.BadgeLevelGold, IconURL: "/badges/star.svg", Color: "#FFD700", RequirementType: "total_sales", RequiredValue: 100, IsActive: true, IsVisible: true, Perks: []string{"Featured seller badge", "Priority listing placement"}, DiscountPercent: 3.0, CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}
	var docs []interface{}
	for _, badge := range badges {
		docs = append(docs, badge)
	}
	config.Coll.Badges.InsertMany(ctx, docs)
	log.Printf("%d badges created", len(badges))
}

func createNotificationTemplates(ctx context.Context) {
	log.Println("Creating notification templates...")
	templates := []models.NotificationTemplate{
		{ID: primitive.NewObjectID(), Name: "Order Placed", Type: models.NotificationTypeOrder, TitleTemplate: "Order Confirmation - Order #{{.order_id}}", MessageTemplate: "Your order #{{.order_id}} for {{.product_name}} has been placed successfully. Total: ₦{{.total_amount}}", Variables: []string{"order_id", "product_name", "total_amount"}, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Order Shipped", Type: models.NotificationTypeShipping, TitleTemplate: "Your order has been shipped", MessageTemplate: "Good news! Your order #{{.order_id}} is on its way. Tracking: {{.tracking_number}}", Variables: []string{"order_id", "tracking_number"}, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "New Message", Type: models.NotificationTypeMessage, TitleTemplate: "New message from {{.sender_name}}", MessageTemplate: "You have a new message from {{.sender_name}}: {{.message_preview}}", Variables: []string{"sender_name", "message_preview"}, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}
	var docs []interface{}
	for _, template := range templates {
		docs = append(docs, template)
	}
	config.Coll.NotificationTemplates.InsertMany(ctx, docs)
	log.Printf("%d notification templates created", len(templates))
}