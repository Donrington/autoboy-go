package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"autoboy-backend/config"
	"autoboy-backend/models"
	"autoboy-backend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SubscriptionHandler struct{}

func NewSubscriptionHandler() *SubscriptionHandler {
	return &SubscriptionHandler{}
}

// CreateSubscription handles premium subscription with payment
func (h *SubscriptionHandler) CreateSubscription(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)
	
	var req struct {
		PlanID           string `json:"plan_id" binding:"required"`
		PaymentReference string `json:"payment_reference" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}
	
	// Get subscription plan
	plan, err := h.getSubscriptionPlan(req.PlanID)
	if err != nil {
		utils.NotFoundResponse(c, "Subscription plan not found")
		return
	}
	
	// TODO: Verify payment with Paystack before creating subscription
	subscription := models.Subscription{
		ID:            primitive.NewObjectID(),
		UserID:        userObjID,
		PlanID:        req.PlanID,
		Status:        "active",
		StartDate:     time.Now(),
		EndDate:       time.Now().AddDate(0, plan.DurationMonths, 0),
		Amount:        plan.Price,
		PaymentMethod: "paystack",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	_, err = config.Coll.PremiumMemberships.InsertOne(ctx, subscription)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create subscription", err.Error())
		return
	}
	
	utils.SuccessResponse(c, http.StatusCreated, "Subscription created successfully", subscription)
}

// Subscribe handles premium subscription with payment (alias for CreateSubscription)
func (h *SubscriptionHandler) Subscribe(c *gin.Context) {
	h.CreateSubscription(c)
}

// CancelSubscription handles subscription cancellation
func (h *SubscriptionHandler) CancelSubscription(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	now := time.Now()
	update := bson.M{
		"$set": bson.M{
			"status": "cancelled",
			"cancelled_at": now,
			"updated_at": now,
		},
	}
	
	result, err := config.Coll.PremiumMemberships.UpdateOne(ctx, bson.M{"user_id": userObjID, "status": "active"}, update)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to cancel subscription", err.Error())
		return
	}
	
	if result.MatchedCount == 0 {
		utils.NotFoundResponse(c, "Active subscription not found")
		return
	}
	
	utils.SuccessResponse(c, http.StatusOK, "Subscription cancelled successfully", gin.H{"cancelled_at": now})
}

// GetSubscriptionStatus returns user's subscription status
func (h *SubscriptionHandler) GetSubscriptionStatus(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	var subscription models.Subscription
	err := config.Coll.PremiumMemberships.FindOne(ctx, bson.M{"user_id": userObjID, "status": "active"}).Decode(&subscription)
	
	if err != nil {
		utils.SuccessResponse(c, http.StatusOK, "Subscription status retrieved", gin.H{
			"is_premium": false,
			"status":     "inactive",
			"subscription": nil,
		})
		return
	}
	
	// Check if subscription is expired
	if time.Now().After(subscription.EndDate) {
		config.Coll.PremiumMemberships.UpdateOne(ctx, bson.M{"_id": subscription.ID}, bson.M{"$set": bson.M{"status": "expired"}})
		
		utils.SuccessResponse(c, http.StatusOK, "Subscription status retrieved", gin.H{
			"is_premium": false,
			"status":     "expired",
			"subscription": subscription,
		})
		return
	}
	
	utils.SuccessResponse(c, http.StatusOK, "Subscription status retrieved", gin.H{
		"is_premium": true,
		"status":     "active",
		"subscription": subscription,
	})
}

// GetSubscriptionPlans returns available subscription plans based on user type
func (h *SubscriptionHandler) GetSubscriptionPlans(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	// Get user to determine type
	var user models.User
	err := config.Coll.Users.FindOne(ctx, bson.M{"_id": userObjID}).Decode(&user)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to get user info", err.Error())
		return
	}
	
	var plans []gin.H
	
	if user.UserType == models.UserTypeSeller {
		// Seller premium plans (higher pricing, seller-focused features)
		plans = []gin.H{
			{
				"id":               "seller_monthly",
				"name":             "Seller Monthly Premium",
				"price":            5000,
				"duration_months":  1,
				"currency":         "NGN",
				"user_type":        "seller",
				"features": []string{
					"Premium Seller Badge",
					"Priority Listings (Top Search Results)",
					"Advanced Sales Analytics",
					"VIP Support (1-hour response)",
					"Enhanced Security & Fraud Protection",
					"Advanced Reports & Insights",
					"Promotional Tools",
					"Customer Behavior Analytics",
					"Bulk Operations",
					"API Access",
				},
			},
			{
				"id":               "seller_yearly",
				"name":             "Seller Yearly Premium",
				"price":            50000,
				"duration_months":  12,
				"currency":         "NGN",
				"savings":          "17% OFF (Save ₦10,000)",
				"user_type":        "seller",
				"features": []string{
					"Premium Seller Badge",
					"Priority Listings (Top Search Results)",
					"Advanced Sales Analytics",
					"VIP Support (1-hour response)",
					"Enhanced Security & Fraud Protection",
					"Advanced Reports & Insights",
					"Promotional Tools",
					"Customer Behavior Analytics",
					"Bulk Operations",
					"API Access",
					"White-label Store",
					"Dedicated Account Manager",
				},
			},
		}
	} else {
		// Buyer premium plans (lower pricing, buyer-focused features)
		plans = []gin.H{
			{
				"id":               "buyer_monthly",
				"name":             "Buyer Monthly Premium",
				"price":            2500,
				"duration_months":  1,
				"currency":         "NGN",
				"user_type":        "buyer",
				"features": []string{
					"Premium Buyer Badge",
					"Early Access to New Products",
					"Exclusive Deals & Discounts",
					"Priority Support (30-min response)",
					"Enhanced Buyer Protection",
					"Purchase Analytics & Insights",
					"Advanced Price Alerts",
					"Bonus Reward Points (2x)",
					"Free Premium Shipping",
					"Extended Return Policy",
				},
			},
			{
				"id":               "buyer_yearly",
				"name":             "Buyer Yearly Premium",
				"price":            25000,
				"duration_months":  12,
				"currency":         "NGN",
				"savings":          "17% OFF (Save ₦5,000)",
				"user_type":        "buyer",
				"features": []string{
					"Premium Buyer Badge",
					"Early Access to New Products",
					"Exclusive Deals & Discounts",
					"Priority Support (30-min response)",
					"Enhanced Buyer Protection",
					"Purchase Analytics & Insights",
					"Advanced Price Alerts",
					"Bonus Reward Points (2x)",
					"Free Premium Shipping",
					"Extended Return Policy",
					"Personal Shopping Assistant",
					"VIP Customer Status",
				},
			},
		}
	}
	
	utils.SuccessResponse(c, http.StatusOK, "Subscription plans retrieved", gin.H{
		"user_type": user.UserType,
		"plans": plans,
	})
}

// GetPremiumFeatures returns premium features list based on user type
func (h *SubscriptionHandler) GetPremiumFeatures(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	// Get user to determine type
	var user models.User
	err := config.Coll.Users.FindOne(ctx, bson.M{"_id": userObjID}).Decode(&user)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to get user info", err.Error())
		return
	}
	
	var features []gin.H
	
	if user.UserType == models.UserTypeSeller {
		// Seller premium features
		features = []gin.H{
			{
				"icon":        "diamond",
				"title":       "Premium Seller Badge",
				"description": "Stand out with a verified premium seller badge",
			},
			{
				"icon":        "trending-up",
				"title":       "Priority Listings",
				"description": "Your products appear first in search results",
			},
			{
				"icon":        "analytics",
				"title":       "Advanced Analytics",
				"description": "Detailed insights on sales, revenue, and customer behavior",
			},
			{
				"icon":        "chatbubbles",
				"title":       "VIP Support",
				"description": "24/7 dedicated seller support with priority response",
			},
			{
				"icon":        "shield-checkmark",
				"title":       "Enhanced Security",
				"description": "Advanced fraud protection and secure transactions",
			},
			{
				"icon":        "bar-chart",
				"title":       "Advanced Reports",
				"description": "Comprehensive sales reports and performance metrics",
			},
			{
				"icon":        "megaphone",
				"title":       "Promotional Tools",
				"description": "Advanced marketing and promotional features",
			},
			{
				"icon":        "people",
				"title":       "Customer Insights",
				"description": "Detailed customer analytics and behavior tracking",
			},
		}
	} else {
		// Buyer premium features
		features = []gin.H{
			{
				"icon":        "diamond",
				"title":       "Premium Buyer Badge",
				"description": "Get recognized as a premium buyer with exclusive badge",
			},
			{
				"icon":        "flash",
				"title":       "Early Access",
				"description": "Get first access to new products and flash sales",
			},
			{
				"icon":        "star",
				"title":       "Exclusive Deals",
				"description": "Access to premium-only products and special discounts",
			},
			{
				"icon":        "chatbubbles",
				"title":       "Priority Support",
				"description": "24/7 premium customer support with faster response",
			},
			{
				"icon":        "shield-checkmark",
				"title":       "Enhanced Security",
				"description": "Advanced buyer protection and secure transactions",
			},
			{
				"icon":        "analytics",
				"title":       "Purchase Analytics",
				"description": "Track your spending, savings, and purchase history",
			},
			{
				"icon":        "notifications",
				"title":       "Price Alerts",
				"description": "Get notified when items in your wishlist drop in price",
			},
			{
				"icon":        "gift",
				"title":       "Reward Points",
				"description": "Earn bonus reward points on every purchase",
			},
		}
	}
	
	utils.SuccessResponse(c, http.StatusOK, "Premium features retrieved", gin.H{
		"user_type": user.UserType,
		"features": features,
	})
}

// UpgradeSubscription handles subscription upgrades
func (h *SubscriptionHandler) UpgradeSubscription(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)
	
	var req struct {
		NewPlanID string `json:"new_plan_id" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}
	
	newPlan, err := h.getSubscriptionPlan(req.NewPlanID)
	if err != nil {
		utils.NotFoundResponse(c, "New subscription plan not found")
		return
	}
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	update := bson.M{
		"$set": bson.M{
			"plan_id": req.NewPlanID,
			"amount": newPlan.Price,
			"end_date": time.Now().AddDate(0, newPlan.DurationMonths, 0),
			"updated_at": time.Now(),
		},
	}
	
	result, err := config.Coll.PremiumMemberships.UpdateOne(ctx, bson.M{"user_id": userObjID, "status": "active"}, update)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to upgrade subscription", err.Error())
		return
	}
	
	if result.MatchedCount == 0 {
		utils.NotFoundResponse(c, "Active subscription not found")
		return
	}
	
	utils.SuccessResponse(c, http.StatusOK, "Subscription upgraded successfully", gin.H{"plan_id": req.NewPlanID})
}

// GetBillingHistory returns user's billing history
func (h *SubscriptionHandler) GetBillingHistory(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	var subscriptions []models.Subscription
	cursor, err := config.Coll.PremiumMemberships.Find(ctx, bson.M{"user_id": userObjID})
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to retrieve billing history", err.Error())
		return
	}
	defer cursor.Close(ctx)
	
	if err = cursor.All(ctx, &subscriptions); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to decode billing history", err.Error())
		return
	}
	
	utils.SuccessResponse(c, http.StatusOK, "Billing history retrieved", subscriptions)
}

// Helper function to get subscription plan details
func (h *SubscriptionHandler) getSubscriptionPlan(planID string) (*models.SubscriptionPlan, error) {
	plans := map[string]*models.SubscriptionPlan{
		"seller_monthly": {
			ID:             "seller_monthly",
			Name:           "Seller Monthly Premium",
			Price:          5000,
			DurationMonths: 1,
			UserType:       "seller",
		},
		"seller_yearly": {
			ID:             "seller_yearly",
			Name:           "Seller Yearly Premium",
			Price:          50000,
			DurationMonths: 12,
			UserType:       "seller",
		},
		"buyer_monthly": {
			ID:             "buyer_monthly",
			Name:           "Buyer Monthly Premium",
			Price:          2500,
			DurationMonths: 1,
			UserType:       "buyer",
		},
		"buyer_yearly": {
			ID:             "buyer_yearly",
			Name:           "Buyer Yearly Premium",
			Price:          25000,
			DurationMonths: 12,
			UserType:       "buyer",
		},
	}
	
	plan, exists := plans[planID]
	if !exists {
		return nil, utils.ErrNotFound
	}
	
	return plan, nil
}