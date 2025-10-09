package middleware

import (
	"context"
	"time"

	"autoboy-backend/config"
	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RequirePremiumUser middleware ensures user has active premium subscription
func RequirePremiumUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		if userID == "" {
			utils.UnauthorizedResponse(c, "Authentication required")
			c.Abort()
			return
		}

		userObjID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			utils.BadRequestResponse(c, "Invalid user ID", nil)
			c.Abort()
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Check if user has active premium subscription
		var subscription models.Subscription
		err = config.Coll.PremiumMemberships.FindOne(ctx, bson.M{
			"user_id": userObjID,
			"status":  "active",
			"end_date": bson.M{"$gt": time.Now()},
		}).Decode(&subscription)

		if err != nil {
			utils.ForbiddenResponse(c, "Premium subscription required")
			c.Abort()
			return
		}

		// Add subscription info to context
		c.Set("subscription", subscription)
		c.Set("is_premium", true)
		c.Next()
	}
}

// OptionalPremiumMiddleware adds premium status to context without requiring it
func OptionalPremiumMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		if userID == "" {
			c.Set("is_premium", false)
			c.Next()
			return
		}

		userObjID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			c.Set("is_premium", false)
			c.Next()
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		// Check premium status
		var subscription models.Subscription
		err = config.Coll.PremiumMemberships.FindOne(ctx, bson.M{
			"user_id": userObjID,
			"status":  "active",
			"end_date": bson.M{"$gt": time.Now()},
		}).Decode(&subscription)

		if err == nil {
			c.Set("is_premium", true)
			c.Set("subscription", subscription)
		} else {
			c.Set("is_premium", false)
		}

		c.Next()
	}
}

// GetPremiumFeaturesByUserType returns premium features based on user type
func GetPremiumFeaturesByUserType(userType models.UserType) map[string]interface{} {
	if userType == models.UserTypeSeller {
		return map[string]interface{}{
			"features": []string{
				"priority_listings",
				"advanced_analytics", 
				"vip_support",
				"enhanced_security",
				"advanced_reports",
				"promotional_tools",
				"customer_insights",
				"bulk_operations",
				"api_access",
				"white_label_store",
			},
			"limits": map[string]interface{}{
				"max_products": 1000,
				"max_images_per_product": 20,
				"analytics_retention_days": 365,
				"support_response_time": "1 hour",
			},
			"pricing": map[string]interface{}{
				"monthly": 5000,  // ₦5,000 for sellers
				"yearly": 50000,  // ₦50,000 for sellers (2 months free)
			},
		}
	} else {
		// Buyer premium features
		return map[string]interface{}{
			"features": []string{
				"early_access",
				"exclusive_deals",
				"priority_support",
				"enhanced_security",
				"purchase_analytics",
				"price_alerts",
				"reward_points_bonus",
				"free_shipping",
				"extended_warranty",
				"personal_shopper",
			},
			"limits": map[string]interface{}{
				"max_price_alerts": 100,
				"max_wishlist_items": 500,
				"analytics_retention_days": 365,
				"support_response_time": "30 minutes",
			},
			"pricing": map[string]interface{}{
				"monthly": 2500,  // ₦2,500 for buyers
				"yearly": 25000,  // ₦25,000 for buyers (2 months free)
			},
		}
	}
}

// CheckPremiumFeatureAccess checks if user has access to specific premium feature
func CheckPremiumFeatureAccess(c *gin.Context, feature string) bool {
	isPremium, exists := c.Get("is_premium")
	if !exists || !isPremium.(bool) {
		return false
	}

	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User
	err := config.Coll.Users.FindOne(ctx, bson.M{"_id": userObjID}).Decode(&user)
	if err != nil {
		return false
	}

	features := GetPremiumFeaturesByUserType(user.UserType)
	featureList := features["features"].([]string)

	for _, f := range featureList {
		if f == feature {
			return true
		}
	}

	return false
}