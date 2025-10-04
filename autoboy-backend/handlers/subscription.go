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

// Subscribe handles premium subscription with payment
func (h *SubscriptionHandler) Subscribe(c *gin.Context) {
	userID := c.GetUint("user_id")
	
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
		UserID:        userID,
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

// CancelSubscription handles subscription cancellation
func (h *SubscriptionHandler) CancelSubscription(c *gin.Context) {
	userID := c.GetUint("user_id")
	
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
	
	result, err := config.Coll.PremiumMemberships.UpdateOne(ctx, bson.M{"user_id": userID, "status": "active"}, update)
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
	userID := c.GetUint("user_id")
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	var subscription models.Subscription
	err := config.Coll.PremiumMemberships.FindOne(ctx, bson.M{"user_id": userID, "status": "active"}).Decode(&subscription)
	
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

// GetSubscriptionPlans returns available subscription plans
func (h *SubscriptionHandler) GetSubscriptionPlans(c *gin.Context) {
	plans := []gin.H{
		{
			"id":               "monthly",
			"name":             "Monthly Premium",
			"price":            2500,
			"duration_months":  1,
			"currency":         "NGN",
			"features": []string{
				"Premium Badge",
				"Priority Listings",
				"Advanced Analytics",
				"Priority Support",
				"Enhanced Security",
				"Exclusive Deals",
			},
		},
		{
			"id":               "yearly",
			"name":             "Yearly Premium",
			"price":            25000,
			"duration_months":  12,
			"currency":         "NGN",
			"savings":          "17% OFF",
			"features": []string{
				"Premium Badge",
				"Priority Listings",
				"Advanced Analytics",
				"Priority Support",
				"Enhanced Security",
				"Exclusive Deals",
				"VIP Support",
				"Advanced Reports",
			},
		},
	}
	
	utils.SuccessResponse(c, http.StatusOK, "Subscription plans retrieved", plans)
}

// GetPremiumFeatures returns premium features list
func (h *SubscriptionHandler) GetPremiumFeatures(c *gin.Context) {
	features := []gin.H{
		{
			"icon":        "diamond",
			"title":       "Premium Badge",
			"description": "Stand out with a verified premium badge",
		},
		{
			"icon":        "trending-up",
			"title":       "Priority Listings",
			"description": "Your products appear first in search results",
		},
		{
			"icon":        "analytics",
			"title":       "Advanced Analytics",
			"description": "Detailed insights on your sales performance",
		},
		{
			"icon":        "chatbubbles",
			"title":       "Priority Support",
			"description": "24/7 premium customer support",
		},
		{
			"icon":        "shield-checkmark",
			"title":       "Enhanced Security",
			"description": "Advanced fraud protection and secure transactions",
		},
		{
			"icon":        "star",
			"title":       "Exclusive Deals",
			"description": "Access to premium-only products and discounts",
		},
	}
	
	utils.SuccessResponse(c, http.StatusOK, "Premium features retrieved", features)
}

// UpgradeSubscription handles subscription upgrades
func (h *SubscriptionHandler) UpgradeSubscription(c *gin.Context) {
	userID := c.GetUint("user_id")
	
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
	
	result, err := config.Coll.PremiumMemberships.UpdateOne(ctx, bson.M{"user_id": userID, "status": "active"}, update)
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
	userID := c.GetUint("user_id")
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	var subscriptions []models.Subscription
	cursor, err := config.Coll.PremiumMemberships.Find(ctx, bson.M{"user_id": userID})
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
		"monthly": {
			ID:             "monthly",
			Name:           "Monthly Premium",
			Price:          2500,
			DurationMonths: 1,
		},
		"yearly": {
			ID:             "yearly",
			Name:           "Yearly Premium",
			Price:          25000,
			DurationMonths: 12,
		},
	}
	
	plan, exists := plans[planID]
	if !exists {
		return nil, utils.ErrNotFound
	}
	
	return plan, nil
}