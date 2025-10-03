package main

import (
	"context"
	"log"
	"time"

	"autoboy-backend/config"
	"autoboy-backend/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Initialize database connection
	err := config.InitializeDatabase()
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	ctx := context.Background()

	log.Println("Starting database initialization...")

	// Create default categories
	if err := createDefaultCategories(ctx); err != nil {
		log.Printf("Warning: Failed to create categories: %v", err)
	}

	// Create admin user
	if err := createAdminUser(ctx); err != nil {
		log.Printf("Warning: Failed to create admin user: %v", err)
	}

	// Create system settings
	if err := createSystemSettings(ctx); err != nil {
		log.Printf("Warning: Failed to create system settings: %v", err)
	}

	// Create default badges
	if err := createDefaultBadges(ctx); err != nil {
		log.Printf("Warning: Failed to create default badges: %v", err)
	}

	// Create notification templates
	if err := createNotificationTemplates(ctx); err != nil {
		log.Printf("Warning: Failed to create notification templates: %v", err)
	}

	log.Println("Database initialization completed successfully!")
}

// createDefaultCategories creates default product categories
func createDefaultCategories(ctx context.Context) error {
	log.Println("Creating default categories...")

	categories := []models.Category{
		{
			ID:          primitive.NewObjectID(),
			Name:        "Smartphones",
			Slug:        "smartphones",
			Description: "Mobile phones and smartphones",
			IsActive:    true,
			SortOrder:   1,
			Attributes: []models.CategoryAttribute{
				{Name: "Brand", Type: "select", Options: []string{"Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Huawei", "Oppo", "Vivo"}, IsRequired: true, IsFilterable: true, SortOrder: 1},
				{Name: "Storage", Type: "select", Options: []string{"32GB", "64GB", "128GB", "256GB", "512GB", "1TB"}, IsRequired: true, IsFilterable: true, SortOrder: 2},
				{Name: "RAM", Type: "select", Options: []string{"2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"}, IsRequired: false, IsFilterable: true, SortOrder: 3},
				{Name: "Screen Size", Type: "range", IsRequired: false, IsFilterable: true, SortOrder: 4},
				{Name: "Operating System", Type: "select", Options: []string{"iOS", "Android"}, IsRequired: true, IsFilterable: true, SortOrder: 5},
			},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:          primitive.NewObjectID(),
			Name:        "Tablets",
			Slug:        "tablets",
			Description: "Tablets and iPad devices",
			IsActive:    true,
			SortOrder:   2,
			Attributes: []models.CategoryAttribute{
				{Name: "Brand", Type: "select", Options: []string{"Apple", "Samsung", "Microsoft", "Lenovo", "Huawei"}, IsRequired: true, IsFilterable: true, SortOrder: 1},
				{Name: "Storage", Type: "select", Options: []string{"32GB", "64GB", "128GB", "256GB", "512GB", "1TB"}, IsRequired: true, IsFilterable: true, SortOrder: 2},
				{Name: "Screen Size", Type: "select", Options: []string{"7-8 inches", "9-10 inches", "11-12 inches", "13+ inches"}, IsRequired: false, IsFilterable: true, SortOrder: 3},
			},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:          primitive.NewObjectID(),
			Name:        "Laptops",
			Slug:        "laptops",
			Description: "Laptops and notebooks",
			IsActive:    true,
			SortOrder:   3,
			Attributes: []models.CategoryAttribute{
				{Name: "Brand", Type: "select", Options: []string{"Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI", "Microsoft"}, IsRequired: true, IsFilterable: true, SortOrder: 1},
				{Name: "Processor", Type: "select", Options: []string{"Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M1", "Apple M2"}, IsRequired: true, IsFilterable: true, SortOrder: 2},
				{Name: "RAM", Type: "select", Options: []string{"4GB", "8GB", "16GB", "32GB", "64GB"}, IsRequired: true, IsFilterable: true, SortOrder: 3},
				{Name: "Storage Type", Type: "select", Options: []string{"HDD", "SSD", "Hybrid"}, IsRequired: true, IsFilterable: true, SortOrder: 4},
				{Name: "Screen Size", Type: "select", Options: []string{"11-12 inches", "13-14 inches", "15-16 inches", "17+ inches"}, IsRequired: false, IsFilterable: true, SortOrder: 5},
			},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:          primitive.NewObjectID(),
			Name:        "Smartwatches",
			Slug:        "smartwatches",
			Description: "Smart watches and fitness trackers",
			IsActive:    true,
			SortOrder:   4,
			Attributes: []models.CategoryAttribute{
				{Name: "Brand", Type: "select", Options: []string{"Apple", "Samsung", "Fitbit", "Garmin", "Fossil", "Huawei", "Amazfit"}, IsRequired: true, IsFilterable: true, SortOrder: 1},
				{Name: "Compatibility", Type: "select", Options: []string{"iOS", "Android", "Both"}, IsRequired: true, IsFilterable: true, SortOrder: 2},
				{Name: "Features", Type: "multi_select", Options: []string{"GPS", "Heart Rate Monitor", "Water Resistant", "Sleep Tracking", "Fitness Tracking", "NFC"}, IsRequired: false, IsFilterable: true, SortOrder: 3},
			},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:          primitive.NewObjectID(),
			Name:        "Accessories",
			Slug:        "accessories",
			Description: "Phone cases, chargers, headphones and other accessories",
			IsActive:    true,
			SortOrder:   5,
			Attributes: []models.CategoryAttribute{
				{Name: "Type", Type: "select", Options: []string{"Cases & Covers", "Chargers", "Headphones", "Screen Protectors", "Power Banks", "Cables", "Stands", "Car Accessories"}, IsRequired: true, IsFilterable: true, SortOrder: 1},
				{Name: "Compatibility", Type: "text", IsRequired: false, IsFilterable: true, SortOrder: 2},
			},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	// Insert categories
	for _, category := range categories {
		_, err := config.Coll.Categories.InsertOne(ctx, category)
		if err != nil {
			log.Printf("Failed to insert category %s: %v", category.Name, err)
			continue
		}
		log.Printf("Created category: %s", category.Name)
	}

	return nil
}

// createAdminUser creates the default admin user
func createAdminUser(ctx context.Context) error {
	log.Println("Creating admin user...")

	// Check if admin user already exists
	count, err := config.Coll.Users.CountDocuments(ctx, map[string]interface{}{
		"user_type": models.UserTypeAdmin,
	})
	if err != nil {
		return err
	}

	if count > 0 {
		log.Println("Admin user already exists, skipping creation")
		return nil
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	adminUser := models.User{
		ID:              primitive.NewObjectID(),
		Username:        "admin",
		Email:           "admin@autoboy.com",
		Password:        string(hashedPassword),
		Phone:           "+234800000000",
		UserType:        models.UserTypeAdmin,
		Status:          models.UserStatusActive,
		IsEmailVerified: true,
		IsPhoneVerified: true,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
		Profile: models.Profile{
			FirstName:          "System",
			LastName:           "Administrator",
			VerificationStatus: models.VerificationStatusVerified,
			PremiumStatus:      models.PremiumStatusVIP,
			BadgeLevel:         5,
			Preferences: models.UserPreferences{
				Language:           "en",
				Currency:           "NGN",
				Timezone:           "Africa/Lagos",
				EmailNotifications: true,
				SMSNotifications:   true,
				PushNotifications:  true,
				MarketingEmails:    false,
				Theme:              "light",
			},
		},
	}

	_, err = config.Coll.Users.InsertOne(ctx, adminUser)
	if err != nil {
		return err
	}

	// Create admin wallet
	adminWallet := models.UserWallet{
		ID:             primitive.NewObjectID(),
		UserID:         adminUser.ID,
		Balance:        0.0,
		Currency:       "NGN",
		EscrowBalance:  0.0,
		PendingBalance: 0.0,
		TotalEarnings:  0.0,
		TotalSpent:     0.0,
		IsActive:       true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	_, err = config.Coll.UserWallets.InsertOne(ctx, adminWallet)
	if err != nil {
		log.Printf("Failed to create admin wallet: %v", err)
	}

	log.Println("Admin user created successfully")
	log.Println("Default credentials: admin@autoboy.com / admin123")

	return nil
}

// createSystemSettings creates default system settings
func createSystemSettings(ctx context.Context) error {
	log.Println("Creating system settings...")

	settings := []map[string]interface{}{
		{
			"_id":         primitive.NewObjectID(),
			"key":         "platform_name",
			"value":       "AutoBoy",
			"description": "Platform name",
			"type":        "string",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"key":         "platform_version",
			"value":       "1.0.0",
			"description": "Platform version",
			"type":        "string",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"key":         "default_currency",
			"value":       "NGN",
			"description": "Default platform currency",
			"type":        "string",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"key":         "commission_rate",
			"value":       0.05, // 5%
			"description": "Platform commission rate",
			"type":        "number",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"key":         "escrow_auto_release_days",
			"value":       7,
			"description": "Days after which escrow is auto-released",
			"type":        "number",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"key":         "max_images_per_product",
			"value":       10,
			"description": "Maximum images allowed per product",
			"type":        "number",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"key":         "max_videos_per_product",
			"value":       3,
			"description": "Maximum videos allowed per product",
			"type":        "number",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"key":         "premium_membership_prices",
			"value": map[string]interface{}{
				"basic":   map[string]interface{}{"monthly": 2000, "yearly": 20000},
				"premium": map[string]interface{}{"monthly": 5000, "yearly": 50000},
				"vip":     map[string]interface{}{"monthly": 10000, "yearly": 100000},
			},
			"description": "Premium membership pricing in NGN",
			"type":        "object",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"key":         "withdrawal_minimum_amount",
			"value":       1000, // NGN 1,000
			"description": "Minimum withdrawal amount in NGN",
			"type":        "number",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"key":         "withdrawal_fee_percentage",
			"value":       0.02, // 2%
			"description": "Withdrawal fee percentage",
			"type":        "number",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"key":         "supported_payment_gateways",
			"value":       []string{"paystack", "flutterwave", "stripe"},
			"description": "Supported payment gateways",
			"type":        "array",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"key":         "supported_cryptocurrencies",
			"value":       []string{"bitcoin", "ethereum", "usdt", "usdc"},
			"description": "Supported cryptocurrencies",
			"type":        "array",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"key":         "max_message_length",
			"value":       1000,
			"description": "Maximum message length in characters",
			"type":        "number",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"key":         "message_retention_days",
			"value":       365,
			"description": "Days to retain chat messages",
			"type":        "number",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"key":         "max_file_size_mb",
			"value":       50,
			"description": "Maximum file size for uploads in MB",
			"type":        "number",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"key":         "allowed_file_types",
			"value":       []string{"jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "avi", "pdf", "doc", "docx"},
			"description": "Allowed file types for uploads",
			"type":        "array",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
	}

	// Insert settings
	for _, setting := range settings {
		// Check if setting already exists
		count, err := config.Coll.SystemSettings.CountDocuments(ctx, map[string]interface{}{
			"key": setting["key"],
		})
		if err != nil {
			log.Printf("Error checking setting %s: %v", setting["key"], err)
			continue
		}

		if count > 0 {
			log.Printf("Setting %s already exists, skipping", setting["key"])
			continue
		}

		_, err = config.Coll.SystemSettings.InsertOne(ctx, setting)
		if err != nil {
			log.Printf("Failed to insert setting %s: %v", setting["key"], err)
			continue
		}
		log.Printf("Created setting: %s", setting["key"])
	}

	return nil
}

// createDefaultBadges creates default badge system
func createDefaultBadges(ctx context.Context) error {
	log.Println("Creating default badges...")

	badges := []models.Badge{
		// Buyer badges
		{
			ID:              primitive.NewObjectID(),
			Name:            "Early Adopter",
			Description:     "One of the first users on AutoBoy",
			Type:            models.BadgeTypeBuyer,
			Level:           models.BadgeLevelBronze,
			IconURL:         "/badges/trophy.svg",
			Color:           "#CD7F32",
			RequirementType: "signup_date",
			RequiredValue:   30, // First 30 days
			IsActive:        true,
			IsVisible:       true,
			Perks:           []string{"Exclusive early adopter badge", "Priority support"},
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "Big Spender",
			Description:     "Spent over ₦500,000 on the platform",
			Type:            models.BadgeTypeBuyer,
			Level:           models.BadgeLevelGold,
			IconURL:         "/badges/crown.svg",
			Color:           "#FFD700",
			RequirementType: "total_spent",
			RequiredValue:   500000,
			IsActive:        true,
			IsVisible:       true,
			Perks:           []string{"5% discount on all purchases", "VIP customer support"},
			DiscountPercent: 5.0,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "Verified Buyer",
			Description:     "Completed identity verification",
			Type:            models.BadgeTypeBuyer,
			Level:           models.BadgeLevelBronze,
			IconURL:         "/badges/shield.svg",
			Color:           "#4169E1",
			RequirementType: "verification",
			RequiredValue:   1,
			IsActive:        true,
			IsVisible:       true,
			Perks:           []string{"Increased trust", "Access to premium listings"},
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},

		// Seller badges
		{
			ID:              primitive.NewObjectID(),
			Name:            "Top Seller",
			Description:     "Completed over 100 successful sales",
			Type:            models.BadgeTypeSeller,
			Level:           models.BadgeLevelGold,
			IconURL:         "/badges/star.svg",
			Color:           "#FFD700",
			RequirementType: "total_sales",
			RequiredValue:   100,
			IsActive:        true,
			IsVisible:       true,
			Perks:           []string{"Featured seller badge", "Priority listing placement", "3% reduced commission"},
			DiscountPercent: 3.0,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "Fast Shipper",
			Description:     "Average shipping time under 24 hours",
			Type:            models.BadgeTypeSeller,
			Level:           models.BadgeLevelBronze,
			IconURL:         "/badges/rocket.svg",
			Color:           "#FF6347",
			RequirementType: "avg_ship_time",
			RequiredValue:   24,
			IsActive:        true,
			IsVisible:       true,
			Perks:           []string{"Fast shipper badge", "Increased buyer confidence"},
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "Trusted Seller",
			Description:     "Maintained 4.8+ rating with 50+ reviews",
			Type:            models.BadgeTypeSeller,
			Level:           models.BadgeLevelPlatinum,
			IconURL:         "/badges/certificate.svg",
			Color:           "#E5E4E2",
			RequirementType: "rating_reviews",
			RequiredValue:   50,
			IsActive:        true,
			IsVisible:       true,
			Perks:           []string{"Trusted seller badge", "Featured in trusted sellers section", "5% reduced commission"},
			DiscountPercent: 5.0,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
	}

	// Insert badges
	for _, badge := range badges {
		_, err := config.Coll.Badges.InsertOne(ctx, badge)
		if err != nil {
			log.Printf("Failed to insert badge %s: %v", badge.Name, err)
			continue
		}
		log.Printf("Created badge: %s", badge.Name)
	}

	return nil
}

// createNotificationTemplates creates default notification templates
func createNotificationTemplates(ctx context.Context) error {
	log.Println("Creating notification templates...")

	templates := []models.NotificationTemplate{
		{
			ID:              primitive.NewObjectID(),
			Name:            "Order Placed",
			Type:            models.NotificationTypeOrder,
			TitleTemplate:   "Order Confirmation - Order #{{.order_id}}",
			MessageTemplate: "Your order #{{.order_id}} for {{.product_name}} has been placed successfully. Total: ₦{{.total_amount}}",
			Variables:       []string{"order_id", "product_name", "total_amount"},
			IsActive:        true,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "Order Shipped",
			Type:            models.NotificationTypeShipping,
			TitleTemplate:   "Your order has been shipped",
			MessageTemplate: "Good news! Your order #{{.order_id}} is on its way. Tracking: {{.tracking_number}}",
			Variables:       []string{"order_id", "tracking_number"},
			IsActive:        true,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "Price Drop Alert",
			Type:            models.NotificationTypePriceDrop,
			TitleTemplate:   "Price Drop Alert - {{.product_name}}",
			MessageTemplate: "Great news! {{.product_name}} has dropped to ₦{{.new_price}} (was ₦{{.old_price}})",
			Variables:       []string{"product_name", "new_price", "old_price"},
			IsActive:        true,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "Back in Stock",
			Type:            models.NotificationTypeAlert,
			TitleTemplate:   "{{.product_name}} is back in stock!",
			MessageTemplate: "Good news! {{.product_name}} is back in stock. Get it before it's gone!",
			Variables:       []string{"product_name", "product_url"},
			IsActive:        true,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "New Message",
			Type:            models.NotificationTypeMessage,
			TitleTemplate:   "New message from {{.sender_name}}",
			MessageTemplate: "You have a new message from {{.sender_name}}: {{.message_preview}}",
			Variables:       []string{"sender_name", "message_preview"},
			IsActive:        true,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "Badge Earned",
			Type:            models.NotificationTypeAchievement,
			TitleTemplate:   "Congratulations! You earned a new badge",
			MessageTemplate: "You've unlocked the {{.badge_name}} badge! {{.badge_description}}",
			Variables:       []string{"badge_name", "badge_description"},
			IsActive:        true,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "Exclusive Deal",
			Type:            models.NotificationTypeExclusive,
			TitleTemplate:   "Exclusive VIP Deal - {{.deal_title}}",
			MessageTemplate: "{{.deal_title}}: Save {{.discount_percent}}% on {{.product_category}}. Expires {{.expiry_date}}",
			Variables:       []string{"deal_title", "discount_percent", "product_category", "expiry_date"},
			IsActive:        true,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "Payment Received",
			Type:            models.NotificationTypePayment,
			TitleTemplate:   "Payment received - ₦{{.amount}}",
			MessageTemplate: "You've received ₦{{.amount}} for order #{{.order_id}}",
			Variables:       []string{"amount", "order_id"},
			IsActive:        true,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
	}

	// Insert templates
	for _, template := range templates {
		_, err := config.Coll.NotificationTemplates.InsertOne(ctx, template)
		if err != nil {
			log.Printf("Failed to insert notification template %s: %v", template.Name, err)
			continue
		}
		log.Printf("Created notification template: %s", template.Name)
	}

	return nil
}