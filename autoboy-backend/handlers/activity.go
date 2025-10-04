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
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ActivityHandler struct{}

func NewActivityHandler() *ActivityHandler {
	return &ActivityHandler{}
}

func (h *ActivityHandler) GetUserActivity(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.Coll.UserActivities.Find(ctx,
		bson.M{"user_id": userObjID},
		options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(50),
	)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch activity", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var activities []models.UserActivity
	cursor.All(ctx, &activities)

	utils.SuccessResponse(c, http.StatusOK, "Activity retrieved successfully", activities)
}

func (h *ActivityHandler) LogActivity(userID primitive.ObjectID, action, resource, resourceID string, details map[string]interface{}, c *gin.Context) {
	activity := models.UserActivity{
		ID:         primitive.NewObjectID(),
		UserID:     userID,
		Action:     action,
		Resource:   resource,
		ResourceID: resourceID,
		Details:    details,
		IPAddress:  c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
		Timestamp:  time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	config.Coll.UserActivities.InsertOne(ctx, activity)
}