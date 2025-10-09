package handlers

import (
	"net/http"
	"time"

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

// GetPriorityListings gets priority listings for premium users
func (h *DealHandler) GetPriorityListings(c *gin.Context) {
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
	if user.Profile.PremiumStatus == "none" {
		utils.ErrorResponse(c, http.StatusForbidden, "Premium access required", "This feature requires premium membership")
		return
	}

	// Get priority listings (products with early access or VIP-only status)
	filter := bson.M{
		"status": "active",
		"$or": []bson.M{
			{"priority_access": true},
			{"early_access": true},
			{"vip_only": true},
		},
	}

	var products []models.Product
	cursor, err := utils.DB.Collection("products").Find(c, filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch priority listings", err.Error())
		return
	}
	defer cursor.Close(c)

	if err = cursor.All(c, &products); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode priority listings", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Priority listings retrieved successfully", gin.H{
		"products": products,
		"count": len(products),
	})
}

// GetFlashDeals gets flash deals available to users
func (h *DealHandler) GetFlashDeals(c *gin.Context) {
	userID := c.GetString("user_id")

	// Get user to check premium status
	var user models.User
	userObjID, _ := primitive.ObjectIDFromHex(userID)
	err := utils.DB.Collection("users").FindOne(c, bson.M{"_id": userObjID}).Decode(&user)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found", err.Error())
		return
	}

	// Get flash deals
	filter := bson.M{
		"is_active": true,
		"deal_type": "flash",
		"end_time": bson.M{"$gt": primitive.NewDateTimeFromTime(time.Now())},
	}

	// Premium users get access to exclusive flash deals
	if user.Profile.PremiumStatus != "none" {
		filter["$or"] = []bson.M{
			{"is_premium_only": false},
			{"is_premium_only": true},
		}
	} else {
		filter["is_premium_only"] = false
	}

	var deals []models.ExclusiveDeal
	cursor, err := utils.DB.Collection("flash_deals").Find(c, filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch flash deals", err.Error())
		return
	}
	defer cursor.Close(c)

	if err = cursor.All(c, &deals); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode flash deals", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Flash deals retrieved successfully", gin.H{
		"deals": deals,
		"count": len(deals),
		"user_tier": user.Profile.PremiumStatus,
	})
}