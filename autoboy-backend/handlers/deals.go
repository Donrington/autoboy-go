package handlers

import (
	"net/http"

	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type DealHandler struct{}

func NewDealHandler() *DealHandler {
	return &DealHandler{}
}

// GetExclusiveDeals gets exclusive deals for premium users
func (h *DealHandler) GetExclusiveDeals(c *gin.Context) {
	userID := c.GetString("user_id")

	// Get user to check premium status
	var user models.User
	userObjID, _ := primitive.ObjectIDFromHex(userID)
	err := utils.DB.Collection("users").FindOne(c, bson.M{"_id": userObjID}).Decode(&user)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found", err.Error())
		return
	}

	// Check if user has premium access
	filter := bson.M{"is_active": true}
	if user.Profile.PremiumStatus == "none" {
		filter["required_tier"] = "none" // Only show deals available to free users
	}

	var deals []models.ExclusiveDeal
	cursor, err := utils.DB.Collection("exclusive_deals").Find(c, filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch deals", err.Error())
		return
	}
	defer cursor.Close(c)

	if err = cursor.All(c, &deals); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode deals", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Exclusive deals retrieved successfully", gin.H{
		"deals": deals,
		"user_tier": user.Profile.PremiumStatus,
	})
}