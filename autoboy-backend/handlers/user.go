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

func (h *UserHandler) GetWishlist(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "Wishlist retrieved successfully", []interface{}{})
}

func (h *UserHandler) AddToWishlist(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "Added to wishlist successfully", nil)
}

func (h *UserHandler) RemoveFromWishlist(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "Removed from wishlist successfully", nil)
}

func (h *UserHandler) GetNotifications(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "Notifications retrieved successfully", []interface{}{})
}

func (h *UserHandler) MarkNotificationRead(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "Notification marked as read", nil)
}

func (h *UserHandler) MarkAllNotificationsRead(c *gin.Context) {
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