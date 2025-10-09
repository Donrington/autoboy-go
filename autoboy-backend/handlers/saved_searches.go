package handlers

import (
	"context"
	"net/http"
	"time"

	"autoboy-backend/config"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SavedSearchHandler struct{}

type SavedSearch struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	Query       string             `bson:"query" json:"query"`
	Filters     map[string]interface{} `bson:"filters" json:"filters"`
	ResultCount int                `bson:"result_count" json:"result_count"`
	IsActive    bool               `bson:"is_active" json:"is_active"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
	LastChecked time.Time          `bson:"last_checked" json:"last_checked"`
}

func NewSavedSearchHandler() *SavedSearchHandler {
	return &SavedSearchHandler{}
}

func (h *SavedSearchHandler) GetSavedSearches(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.Coll.SavedSearches.Find(ctx,
		bson.M{"user_id": userObjID, "is_active": true},
		options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}),
	)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch saved searches", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var searches []SavedSearch
	cursor.All(ctx, &searches)

	utils.SuccessResponse(c, http.StatusOK, "Saved searches retrieved", searches)
}

func (h *SavedSearchHandler) CreateSavedSearch(c *gin.Context) {
	var req struct {
		Query   string                 `json:"query" binding:"required"`
		Filters map[string]interface{} `json:"filters"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if search already exists
	var existing SavedSearch
	err := config.Coll.SavedSearches.FindOne(ctx, bson.M{
		"user_id": userObjID,
		"query":   req.Query,
		"is_active": true,
	}).Decode(&existing)

	if err == nil {
		utils.BadRequestResponse(c, "Search already saved", nil)
		return
	}

	search := SavedSearch{
		ID:          primitive.NewObjectID(),
		UserID:      userObjID,
		Query:       req.Query,
		Filters:     req.Filters,
		ResultCount: 0,
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		LastChecked: time.Now(),
	}

	_, err = config.Coll.SavedSearches.InsertOne(ctx, search)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to save search", err.Error())
		return
	}

	utils.CreatedResponse(c, "Search saved successfully", search)
}

func (h *SavedSearchHandler) DeleteSavedSearch(c *gin.Context) {
	searchID := c.Param("id")
	searchObjID, _ := primitive.ObjectIDFromHex(searchID)
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := config.Coll.SavedSearches.UpdateOne(ctx,
		bson.M{"_id": searchObjID, "user_id": userObjID},
		bson.M{"$set": bson.M{"is_active": false, "updated_at": time.Now()}},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to delete saved search", err.Error())
		return
	}

	if result.MatchedCount == 0 {
		utils.NotFoundResponse(c, "Saved search not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Saved search deleted", nil)
}