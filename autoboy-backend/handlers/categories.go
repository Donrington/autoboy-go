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

type CategoryHandler struct{}

func NewCategoryHandler() *CategoryHandler {
	return &CategoryHandler{}
}

func (h *CategoryHandler) GetCategories(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get all active categories
	cursor, err := config.Coll.Categories.Find(ctx, bson.M{"is_active": true})
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch categories", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var categories []models.Category
	if err = cursor.All(ctx, &categories); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to decode categories", err.Error())
		return
	}

	// If no categories exist, create default ones
	if len(categories) == 0 {
		defaultCategories := []models.Category{
			{
				ID:          primitive.NewObjectID(),
				Name:        "Phones & Tablets",
				Slug:        "phones-tablets",
				Description: "Mobile phones, tablets, and accessories",
				IsActive:    true,
				SortOrder:   1,
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			},
			{
				ID:          primitive.NewObjectID(),
				Name:        "Laptops & Computers",
				Slug:        "laptops-computers",
				Description: "Laptops, desktops, and computer accessories",
				IsActive:    true,
				SortOrder:   2,
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			},
			{
				ID:          primitive.NewObjectID(),
				Name:        "Gaming",
				Slug:        "gaming",
				Description: "Gaming consoles, accessories, and games",
				IsActive:    true,
				SortOrder:   3,
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			},
			{
				ID:          primitive.NewObjectID(),
				Name:        "Audio & Video",
				Slug:        "audio-video",
				Description: "Headphones, speakers, cameras, and more",
				IsActive:    true,
				SortOrder:   4,
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			},
			{
				ID:          primitive.NewObjectID(),
				Name:        "Wearables",
				Slug:        "wearables",
				Description: "Smartwatches, fitness trackers, and accessories",
				IsActive:    true,
				SortOrder:   5,
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			},
		}

		// Insert default categories
		var docs []interface{}
		for _, cat := range defaultCategories {
			docs = append(docs, cat)
		}
		config.Coll.Categories.InsertMany(ctx, docs)
		categories = defaultCategories
	}

	utils.SuccessResponse(c, http.StatusOK, "Categories retrieved successfully", categories)
}

func (h *CategoryHandler) GetCategory(c *gin.Context) {
	categoryID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(categoryID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid category ID", nil)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var category models.Category
	err = config.Coll.Categories.FindOne(ctx, bson.M{
		"_id":       objID,
		"is_active": true,
	}).Decode(&category)

	if err != nil {
		utils.NotFoundResponse(c, "Category not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Category retrieved successfully", category)
}