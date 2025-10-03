package handlers

import (
	"net/http"

	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type BadgeHandler struct{}

func NewBadgeHandler() *BadgeHandler {
	return &BadgeHandler{}
}

// GetUserBadges gets user's earned badges
func (h *BadgeHandler) GetUserBadges(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var userBadges []models.UserBadge
	cursor, err := utils.DB.Collection("user_badges").Find(c, bson.M{"user_id": userObjID})
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch user badges", err.Error())
		return
	}
	defer cursor.Close(c)

	if err = cursor.All(c, &userBadges); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode badges", err.Error())
		return
	}

	// Get badge details
	var badges []gin.H
	for _, userBadge := range userBadges {
		var badge models.Badge
		utils.DB.Collection("badges").FindOne(c, bson.M{"_id": userBadge.BadgeID}).Decode(&badge)
		
		badges = append(badges, gin.H{
			"badge": badge,
			"earned_at": userBadge.EarnedAt,
		})
	}

	utils.SuccessResponse(c, http.StatusOK, "User badges retrieved", gin.H{
		"badges": badges,
	})
}

// GetAvailableBadges gets all available badges
func (h *BadgeHandler) GetAvailableBadges(c *gin.Context) {
	var badges []models.Badge
	cursor, err := utils.DB.Collection("badges").Find(c, bson.M{})
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch badges", err.Error())
		return
	}
	defer cursor.Close(c)

	if err = cursor.All(c, &badges); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode badges", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Available badges retrieved", gin.H{
		"badges": badges,
	})
}

// GetUserRewards gets user's reward points
func (h *BadgeHandler) GetUserRewards(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var user models.User
	err := utils.DB.Collection("users").FindOne(c, bson.M{"_id": userObjID}).Decode(&user)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Reward points retrieved", gin.H{
		"points": user.RewardPoints,
		"level": h.calculateUserLevel(user.RewardPoints),
	})
}

// GetRewardsHistory gets user's rewards history
func (h *BadgeHandler) GetRewardsHistory(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var rewardHistory []models.RewardTransaction
	cursor, err := utils.DB.Collection("reward_transactions").Find(c, bson.M{"user_id": userObjID})
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch rewards history", err.Error())
		return
	}
	defer cursor.Close(c)

	if err = cursor.All(c, &rewardHistory); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode rewards history", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Rewards history retrieved", gin.H{
		"history": rewardHistory,
	})
}

// calculateUserLevel calculates user level based on reward points
func (h *BadgeHandler) calculateUserLevel(points int) string {
	if points >= 10000 {
		return "Diamond"
	} else if points >= 5000 {
		return "Gold"
	} else if points >= 2000 {
		return "Silver"
	} else if points >= 500 {
		return "Bronze"
	}
	return "Beginner"
}