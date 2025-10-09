package handlers

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"time"

	"autoboy-backend/config"
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

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var products []models.Product
	cursor, err := config.Coll.Products.Find(ctx, filter, opts)
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
	total, _ := config.Coll.Products.CountDocuments(ctx, filter)

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

// AdvancedSearch performs advanced search with filters
func (h *SearchHandler) AdvancedSearch(c *gin.Context) {
	var req struct {
		Query      string   `json:"query"`
		Categories []string `json:"categories"`
		MinPrice   float64  `json:"min_price"`
		MaxPrice   float64  `json:"max_price"`
		Conditions []string `json:"conditions"`
		Locations  []string `json:"locations"`
		Rating     float64  `json:"min_rating"`
		SortBy     string   `json:"sort_by"`
		SortOrder  string   `json:"sort_order"`
		Page       int      `json:"page"`
		Limit      int      `json:"limit"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	// Set defaults
	if req.Page == 0 {
		req.Page = 1
	}
	if req.Limit == 0 {
		req.Limit = 20
	}
	if req.SortBy == "" {
		req.SortBy = "created_at"
	}
	if req.SortOrder == "" {
		req.SortOrder = "desc"
	}

	// Build aggregation pipeline
	pipeline := []bson.M{
		{"$match": bson.M{"status": "active"}},
	}

	// Text search
	if req.Query != "" {
		pipeline[0]["$match"].(bson.M)["$text"] = bson.M{"$search": req.Query}
	}

	// Category filter
	if len(req.Categories) > 0 {
		var categoryObjIDs []primitive.ObjectID
		for _, cat := range req.Categories {
			if objID, err := primitive.ObjectIDFromHex(cat); err == nil {
				categoryObjIDs = append(categoryObjIDs, objID)
			}
		}
		if len(categoryObjIDs) > 0 {
			pipeline[0]["$match"].(bson.M)["category_id"] = bson.M{"$in": categoryObjIDs}
		}
	}

	// Price filter
	if req.MinPrice > 0 || req.MaxPrice > 0 {
		priceFilter := bson.M{}
		if req.MinPrice > 0 {
			priceFilter["$gte"] = req.MinPrice
		}
		if req.MaxPrice > 0 {
			priceFilter["$lte"] = req.MaxPrice
		}
		pipeline[0]["$match"].(bson.M)["price"] = priceFilter
	}

	// Condition filter
	if len(req.Conditions) > 0 {
		pipeline[0]["$match"].(bson.M)["condition"] = bson.M{"$in": req.Conditions}
	}

	// Location filter
	if len(req.Locations) > 0 {
		locationFilters := []bson.M{}
		for _, loc := range req.Locations {
			locationFilters = append(locationFilters, bson.M{
				"$or": []bson.M{
					{"location.city": bson.M{"$regex": loc, "$options": "i"}},
					{"location.state": bson.M{"$regex": loc, "$options": "i"}},
				},
			})
		}
		pipeline[0]["$match"].(bson.M)["$or"] = locationFilters
	}

	// Add rating lookup and filter
	if req.Rating > 0 {
		pipeline = append(pipeline, bson.M{
			"$lookup": bson.M{
				"from": "reviews",
				"localField": "_id",
				"foreignField": "product_id",
				"as": "reviews",
			},
		})
		pipeline = append(pipeline, bson.M{
			"$addFields": bson.M{
				"average_rating": bson.M{"$avg": "$reviews.rating"},
			},
		})
		pipeline = append(pipeline, bson.M{
			"$match": bson.M{"average_rating": bson.M{"$gte": req.Rating}},
		})
	}

	// Sort
	sortOrder := 1
	if req.SortOrder == "desc" {
		sortOrder = -1
	}
	pipeline = append(pipeline, bson.M{
		"$sort": bson.M{req.SortBy: sortOrder},
	})

	// Pagination
	skip := (req.Page - 1) * req.Limit
	pipeline = append(pipeline, bson.M{"$skip": skip})
	pipeline = append(pipeline, bson.M{"$limit": req.Limit})

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.Coll.Products.Aggregate(ctx, pipeline)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Advanced search failed", err.Error())
		return
	}
	defer cursor.Close(c)

	var products []bson.M
	cursor.All(c, &products)

	utils.SuccessResponse(c, http.StatusOK, "Advanced search completed", gin.H{
		"products": products,
		"pagination": gin.H{
			"page": req.Page,
			"limit": req.Limit,
			"total": len(products),
		},
	})
}

// GetSearchSuggestions provides search suggestions
func (h *SearchHandler) GetSearchSuggestions(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		utils.BadRequestResponse(c, "Query parameter is required", nil)
		return
	}

	// Get product name suggestions
	productPipeline := []bson.M{
		{"$match": bson.M{
			"status": "active",
			"name": bson.M{"$regex": query, "$options": "i"},
		}},
		{"$project": bson.M{"name": 1}},
		{"$limit": 5},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	productCursor, _ := config.Coll.Products.Aggregate(ctx, productPipeline)
	var productSuggestions []bson.M
	productCursor.All(c, &productSuggestions)

	// Get category suggestions
	categoryPipeline := []bson.M{
		{"$match": bson.M{
			"name": bson.M{"$regex": query, "$options": "i"},
		}},
		{"$project": bson.M{"name": 1}},
		{"$limit": 3},
	}

	categoryCursor, _ := config.Coll.Categories.Aggregate(ctx, categoryPipeline)
	var categorySuggestions []bson.M
	categoryCursor.All(c, &categorySuggestions)

	// Popular searches (mock data - in real app, track search queries)
	popularSearches := []string{
		"iPhone", "Samsung Galaxy", "MacBook", "PlayStation", "Nike Shoes",
		"Toyota Camry", "Honda Civic", "Furniture", "Electronics", "Fashion",
	}

	var filteredPopular []string
	for _, search := range popularSearches {
		if len(filteredPopular) >= 3 {
			break
		}
		if strings.Contains(strings.ToLower(search), strings.ToLower(query)) {
			filteredPopular = append(filteredPopular, search)
		}
	}

	utils.SuccessResponse(c, http.StatusOK, "Search suggestions retrieved", gin.H{
		"products": productSuggestions,
		"categories": categorySuggestions,
		"popular": filteredPopular,
	})
}