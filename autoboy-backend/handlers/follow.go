package handlers

import (
	"context"
	"net/http"
	"time"

	"autoboy-backend/config"
	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type FollowHandler struct{}

func NewFollowHandler() *FollowHandler {
	return &FollowHandler{}
}

func (h *FollowHandler) FollowUser(c *gin.Context) {
	targetUserID := c.Param("id")
	targetObjID, _ := primitive.ObjectIDFromHex(targetUserID)
	
	userID, _ := c.Get("user_id")
	followerObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	if followerObjID == targetObjID {
		utils.BadRequestResponse(c, "Cannot follow yourself", nil)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if already following
	var existing models.FollowRelationship
	err := config.Coll.FollowRelationships.FindOne(ctx, bson.M{
		"follower_id": followerObjID,
		"following_id": targetObjID,
	}).Decode(&existing)

	if err == nil {
		utils.BadRequestResponse(c, "Already following this user", nil)
		return
	}

	// Create follow relationship
	follow := models.FollowRelationship{
		ID:          primitive.NewObjectID(),
		FollowerID:  followerObjID,
		FollowingID: targetObjID,
		CreatedAt:   time.Now(),
	}

	_, err = config.Coll.FollowRelationships.InsertOne(ctx, follow)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to follow user", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "User followed successfully", nil)
}

func (h *FollowHandler) UnfollowUser(c *gin.Context) {
	targetUserID := c.Param("id")
	targetObjID, _ := primitive.ObjectIDFromHex(targetUserID)
	
	userID, _ := c.Get("user_id")
	followerObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := config.Coll.FollowRelationships.DeleteOne(ctx, bson.M{
		"follower_id": followerObjID,
		"following_id": targetObjID,
	})

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to unfollow user", err.Error())
		return
	}

	if result.DeletedCount == 0 {
		utils.NotFoundResponse(c, "Follow relationship not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "User unfollowed successfully", nil)
}

func (h *FollowHandler) GetFollowers(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := []bson.M{
		{"$match": bson.M{"following_id": userObjID}},
		{"$lookup": bson.M{
			"from":         "users",
			"localField":   "follower_id",
			"foreignField": "_id",
			"as":           "follower",
		}},
		{"$unwind": "$follower"},
		{"$project": bson.M{
			"user": bson.M{
				"id":     "$follower._id",
				"name":   bson.M{"$concat": []string{"$follower.profile.first_name", " ", "$follower.profile.last_name"}},
				"avatar": "$follower.profile.avatar",
				"user_type": "$follower.user_type",
			},
			"followed_at": "$created_at",
		}},
		{"$sort": bson.M{"created_at": -1}},
	}

	cursor, err := config.Coll.FollowRelationships.Aggregate(ctx, pipeline)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch followers", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var followers []bson.M
	cursor.All(ctx, &followers)

	utils.SuccessResponse(c, http.StatusOK, "Followers retrieved successfully", gin.H{
		"followers": followers,
		"count": len(followers),
	})
}

func (h *FollowHandler) GetFollowing(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := []bson.M{
		{"$match": bson.M{"follower_id": userObjID}},
		{"$lookup": bson.M{
			"from":         "users",
			"localField":   "following_id",
			"foreignField": "_id",
			"as":           "following",
		}},
		{"$unwind": "$following"},
		{"$project": bson.M{
			"user": bson.M{
				"id":     "$following._id",
				"name":   bson.M{"$concat": []string{"$following.profile.first_name", " ", "$following.profile.last_name"}},
				"avatar": "$following.profile.avatar",
				"user_type": "$following.user_type",
			},
			"followed_at": "$created_at",
		}},
		{"$sort": bson.M{"created_at": -1}},
	}

	cursor, err := config.Coll.FollowRelationships.Aggregate(ctx, pipeline)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch following", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var following []bson.M
	cursor.All(ctx, &following)

	utils.SuccessResponse(c, http.StatusOK, "Following retrieved successfully", gin.H{
		"following": following,
		"count": len(following),
	})
}