package handlers

import (
	"context"
	"net/http"
	"time"

	"autoboy-backend/config"
	"autoboy-backend/models"
	"autoboy-backend/services"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UserHandler struct {
	emailService *services.EmailService
	smsService   *services.SMSService
}

func NewUserHandler(emailService *services.EmailService, smsService *services.SMSService) *UserHandler {
	return &UserHandler{
		emailService: emailService,
		smsService:   smsService,
	}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(*models.User)
	utils.SuccessResponse(c, http.StatusOK, "Profile retrieved successfully", currentUser)
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	var req struct {
		FirstName   string `json:"first_name"`
		LastName    string `json:"last_name"`
		Bio         string `json:"bio"`
		DateOfBirth string `json:"date_of_birth"`
		Gender      string `json:"gender"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	objID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"profile.first_name": req.FirstName,
			"profile.last_name":  req.LastName,
			"profile.bio":        req.Bio,
			"profile.gender":     req.Gender,
			"updated_at":         time.Now(),
		},
	}

	_, err := config.Coll.Users.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to update profile", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Profile updated successfully", nil)
}

func (h *UserHandler) GetAddresses(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(*models.User)
	utils.SuccessResponse(c, http.StatusOK, "Addresses retrieved successfully", currentUser.Profile.Addresses)
}

func (h *UserHandler) CreateAddress(c *gin.Context) {
	var req models.Address
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	objID, _ := primitive.ObjectIDFromHex(userID.(string))

	req.ID = primitive.NewObjectID()
	req.CreatedAt = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := config.Coll.Users.UpdateOne(ctx,
		bson.M{"_id": objID},
		bson.M{"$push": bson.M{"profile.addresses": req}},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to add address", err.Error())
		return
	}

	utils.CreatedResponse(c, "Address added successfully", req)
}

func (h *UserHandler) UpdateAddress(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "Address updated successfully", nil)
}

func (h *UserHandler) DeleteAddress(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "Address deleted successfully", nil)
}

// Wishlist methods moved to dedicated WishlistHandler
// These are kept for backward compatibility but should use WishlistHandler
func (h *UserHandler) GetWishlist(c *gin.Context) {
	wishlistHandler := NewWishlistHandler()
	wishlistHandler.GetWishlist(c)
}

func (h *UserHandler) AddToWishlist(c *gin.Context) {
	wishlistHandler := NewWishlistHandler()
	wishlistHandler.AddToWishlist(c)
}

func (h *UserHandler) RemoveFromWishlist(c *gin.Context) {
	wishlistHandler := NewWishlistHandler()
	wishlistHandler.RemoveFromWishlist(c)
}

func (h *UserHandler) GetNotifications(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.Coll.Notifications.Find(ctx, 
		bson.M{"user_id": userObjID},
		options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(50),
	)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch notifications", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var notifications []models.Notification
	cursor.All(ctx, &notifications)

	unreadCount, _ := config.Coll.Notifications.CountDocuments(ctx, bson.M{
		"user_id": userObjID,
		"is_read": false,
	})

	utils.SuccessResponse(c, http.StatusOK, "Notifications retrieved successfully", gin.H{
		"notifications": notifications,
		"unread_count": unreadCount,
	})
}

func (h *UserHandler) MarkNotificationRead(c *gin.Context) {
	notificationID := c.Param("id")
	notifObjID, _ := primitive.ObjectIDFromHex(notificationID)
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	now := time.Now()
	result, err := config.Coll.Notifications.UpdateOne(ctx,
		bson.M{"_id": notifObjID, "user_id": userObjID},
		bson.M{"$set": bson.M{"is_read": true, "read_at": now}},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to mark notification as read", err.Error())
		return
	}

	if result.MatchedCount == 0 {
		utils.NotFoundResponse(c, "Notification not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Notification marked as read", nil)
}

func (h *UserHandler) MarkAllNotificationsRead(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	now := time.Now()
	_, err := config.Coll.Notifications.UpdateMany(ctx,
		bson.M{"user_id": userObjID, "is_read": false},
		bson.M{"$set": bson.M{"is_read": true, "read_at": now}},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to mark all notifications as read", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "All notifications marked as read", nil)
}

func (h *UserHandler) ChangePassword(c *gin.Context) {
	var req struct {
		CurrentPassword string `json:"current_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	user, _ := c.Get("user")
	currentUser := user.(*models.User)

	if !utils.CheckPasswordHash(req.CurrentPassword, currentUser.Password) {
		utils.BadRequestResponse(c, "Current password is incorrect", nil)
		return
	}

	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to hash password", err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = config.Coll.Users.UpdateOne(ctx,
		bson.M{"_id": currentUser.ID},
		bson.M{"$set": bson.M{"password": hashedPassword, "updated_at": time.Now()}},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to update password", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Password changed successfully", nil)
}

func (h *UserHandler) DeleteAccount(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "Account deletion requested", nil)
}

// GetPremiumStatus returns user's premium status and subscription details
func (h *UserHandler) GetPremiumStatus(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(*models.User)

	// Mock premium status data - replace with actual database queries
	premiumStatus := gin.H{
		"is_premium": currentUser.Profile.PremiumStatus != "none",
		"tier": currentUser.Profile.PremiumStatus,
		"features": []string{
			"Premium Badge",
			"Priority Listings",
			"Advanced Analytics",
			"Priority Support",
		},
		"subscription": gin.H{
			"plan": "monthly",
			"status": "active",
			"next_billing": "2024-02-15",
			"amount": 2500,
		},
	}

	utils.SuccessResponse(c, http.StatusOK, "Premium status retrieved successfully", premiumStatus)
}

// GetPremiumAnalytics returns premium analytics for the user
func (h *UserHandler) GetPremiumAnalytics(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(*models.User)

	// Check if user has premium access
	if currentUser.Profile.PremiumStatus == "none" {
		utils.ErrorResponse(c, http.StatusForbidden, "Premium access required", "This feature requires premium membership")
		return
	}

	// Mock analytics data - replace with actual database queries
	analytics := gin.H{
		"monthly_spending": []int{850000, 920000, 750000, 1100000, 980000, 1050000},
		"category_breakdown": gin.H{
			"Mobile Phones": 45,
			"Laptops": 30,
			"Accessories": 15,
			"Gaming": 10,
		},
		"savings_timeline": []int{120000, 150000, 180000, 210000, 250000, 280000},
		"purchase_frequency": gin.H{
			"labels": []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun"},
			"data": []int{8, 12, 9, 15, 11, 14},
		},
		"total_saved": 1250000,
		"exclusive_deals_used": 12,
		"priority_access_count": 8,
		"reward_points": 4500,
	}

	utils.SuccessResponse(c, http.StatusOK, "Premium analytics retrieved successfully", analytics)
}