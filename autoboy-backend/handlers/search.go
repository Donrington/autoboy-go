package handlers

import (
	"net/http"
	"strconv"

	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SearchHandler struct{}

func NewSearchHandler() *SearchHandler {
	return &SearchHandler{}
}

// SearchProducts performs advanced product search
func (h *SearchHandler) SearchProducts(c *gin.Context) {
	query := c.Query("q")
	category := c.Query("category")
	minPrice := c.Query("min_price")
	maxPrice := c.Query("max_price")
	condition := c.Query("condition")
	location := c.Query("location")
	sortBy := c.DefaultQuery("sort", "created_at")
	sortOrder := c.DefaultQuery("order", "desc")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// Build filter
	filter := bson.M{"status": "active"}

	if query != "" {
		filter["$text"] = bson.M{"$search": query}
	}

	if category != "" {
		if categoryObjID, err := primitive.ObjectIDFromHex(category); err == nil {
			filter["category_id"] = categoryObjID
		}
	}

	if minPrice != "" || maxPrice != "" {
		priceFilter := bson.M{}
		if minPrice != "" {
			if min, err := strconv.ParseFloat(minPrice, 64); err == nil {
				priceFilter["$gte"] = min
			}
		}
		if maxPrice != "" {
			if max, err := strconv.ParseFloat(maxPrice, 64); err == nil {
				priceFilter["$lte"] = max
			}
		}
		if len(priceFilter) > 0 {
			filter["price"] = priceFilter
		}
	}

	if condition != "" {
		filter["condition"] = condition
	}

	if location != "" {
		filter["$or"] = []bson.M{
			{"location.city": bson.M{"$regex": location, "$options": "i"}},
			{"location.state": bson.M{"$regex": location, "$options": "i"}},
		}
	}

	// Build sort
	sort := bson.D{}
	if sortOrder == "desc" {
		sort = append(sort, bson.E{Key: sortBy, Value: -1})
	} else {
		sort = append(sort, bson.E{Key: sortBy, Value: 1})
	}

	// Calculate pagination
	skip := (page - 1) * limit
	opts := options.Find().SetSort(sort).SetSkip(int64(skip)).SetLimit(int64(limit))

	var products []models.Product
	cursor, err := utils.DB.Collection("products").Find(c, filter, opts)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Search failed", err.Error())
		return
	}
	defer cursor.Close(c)

	if err = cursor.All(c, &products); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode results", err.Error())
		return
	}

	// Get total count
	total, _ := utils.DB.Collection("products").CountDocuments(c, filter)

	utils.SuccessResponse(c, http.StatusOK, "Search completed", gin.H{
		"products": products,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
		"filters_applied": gin.H{
			"query":     query,
			"category":  category,
			"min_price": minPrice,
			"max_price": maxPrice,
			"condition": condition,
			"location":  location,
		},
	})
}