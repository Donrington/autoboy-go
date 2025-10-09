package handlers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"autoboy-backend/config"
	"autoboy-backend/models"
	"autoboy-backend/services"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ProductHandler handles product-related requests
type ProductHandler struct {
	imageService *services.ImageService
}

// NewProductHandler creates a new product handler
func NewProductHandler(imageService *services.ImageService) *ProductHandler {
	return &ProductHandler{
		imageService: imageService,
	}
}

// CreateProductRequest represents product creation request
type CreateProductRequest struct {
	Title           string                 `json:"title" binding:"required,min=5,max=200"`
	Description     string                 `json:"description" binding:"required,min=20,max=5000"`
	Price           float64                `json:"price" binding:"required,min=0"`
	Currency        string                 `json:"currency" binding:"required"`
	Condition       string                 `json:"condition" binding:"required,oneof=new uk_used nigeria_used refurbished"`
	Brand           string                 `json:"brand"`
	Model           string                 `json:"model"`
	Color           string                 `json:"color"`
	CategoryID      string                 `json:"category_id" binding:"required"`
	Specifications  map[string]interface{} `json:"specifications"`
	Images          []string               `json:"images"`
	Quantity        int                    `json:"quantity" binding:"min=0"`
	Location        ProductLocationReq     `json:"location" binding:"required"`
	SwapAvailable   bool                   `json:"swap_available"`
	SwapPreferences []SwapPreferenceReq    `json:"swap_preferences"`
	Tags            []string               `json:"tags"`
}

type ProductLocationReq struct {
	City       string    `json:"city" binding:"required"`
	State      string    `json:"state" binding:"required"`
	Country    string    `json:"country" binding:"required"`
	PostalCode string    `json:"postal_code"`
	Coordinates []float64 `json:"coordinates"`
}

type SwapPreferenceReq struct {
	CategoryID  string  `json:"category_id"`
	Brand       string  `json:"brand"`
	Model       string  `json:"model"`
	MinValue    float64 `json:"min_value"`
	MaxValue    float64 `json:"max_value"`
	Condition   string  `json:"condition"`
	Description string  `json:"description"`
}

// CreateProduct handles product creation
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	user, _ := c.Get("user")
	currentUser := user.(*models.User)

	// Check if user is a seller or admin
	if currentUser.UserType != models.UserTypeSeller && currentUser.UserType != models.UserTypeAdmin {
		utils.ForbiddenResponse(c, "Only sellers and admins can create products")
		return
	}

	// Validate category
	categoryID, err := primitive.ObjectIDFromHex(req.CategoryID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid category ID", nil)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if category exists
	var category models.Category
	err = config.Coll.Categories.FindOne(ctx, bson.M{
		"_id":       categoryID,
		"is_active": true,
	}).Decode(&category)
	if err != nil {
		utils.BadRequestResponse(c, "Category not found or inactive", nil)
		return
	}

	// Create product
	sellerID, _ := primitive.ObjectIDFromHex(userID.(string))
	product := models.Product{
		ID:          primitive.NewObjectID(),
		SellerID:    sellerID,
		CategoryID:  categoryID,
		Title:       utils.SanitizeString(req.Title),
		Description: utils.SanitizeString(req.Description),
		Price:       req.Price,
		Currency:    req.Currency,
		Condition:   models.ProductCondition(req.Condition),
		Brand:       req.Brand,
		Model:       req.Model,
		Color:       req.Color,
		Specifications: req.Specifications,
		Quantity:    req.Quantity,
		Location: models.ProductLocation{
			City:        req.Location.City,
			State:       req.Location.State,
			Country:     req.Location.Country,
			PostalCode:  req.Location.PostalCode,
			Coordinates: req.Location.Coordinates,
		},
		SwapAvailable: req.SwapAvailable,
		Status:        getProductStatus(currentUser.UserType),
		IsFeatured:    false,
		Tags:          req.Tags,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	// Process swap preferences
	for _, sp := range req.SwapPreferences {
		swapPref := models.SwapPreference{
			Brand:       sp.Brand,
			Model:       sp.Model,
			MinValue:    sp.MinValue,
			MaxValue:    sp.MaxValue,
			Description: sp.Description,
		}
		
		if sp.CategoryID != "" {
			catID, err := primitive.ObjectIDFromHex(sp.CategoryID)
			if err == nil {
				swapPref.CategoryID = catID
			}
		}
		
		if sp.Condition != "" {
			swapPref.Condition = models.ProductCondition(sp.Condition)
		}
		
		product.SwapPreferences = append(product.SwapPreferences, swapPref)
	}

	// Process images
	for i, imageURL := range req.Images {
		media := models.ProductMedia{
			ID:        primitive.NewObjectID(),
			URL:       imageURL,
			Type:      "image",
			SortOrder: i,
			IsMain:    i == 0,
			UploadedAt: time.Now(),
		}
		product.Images = append(product.Images, media)
	}

	// Insert product
	_, err = config.Coll.Products.InsertOne(ctx, product)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create product", err.Error())
		return
	}

	utils.CreatedResponse(c, "Product created successfully", product)
}

// GetProducts handles product listing with filters
func (h *ProductHandler) GetProducts(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	search := c.Query("search")
	category := c.Query("category")
	condition := c.Query("condition")
	minPrice, _ := strconv.ParseFloat(c.Query("min_price"), 64)
	maxPrice, _ := strconv.ParseFloat(c.Query("max_price"), 64)
	location := c.Query("location")
	sortBy := c.DefaultQuery("sort", "created_at")
	sortOrder := c.DefaultQuery("order", "desc")

	// Build filter
	filter := bson.M{
		"status": models.ProductStatusActive,
	}

	// Search filter
	if search != "" {
		filter["$text"] = bson.M{"$search": search}
	}

	// Category filter
	if category != "" {
		categoryID, err := primitive.ObjectIDFromHex(category)
		if err == nil {
			filter["category_id"] = categoryID
		}
	}

	// Condition filter
	if condition != "" {
		filter["condition"] = condition
	}

	// Price range filter
	if minPrice > 0 || maxPrice > 0 {
		priceFilter := bson.M{}
		if minPrice > 0 {
			priceFilter["$gte"] = minPrice
		}
		if maxPrice > 0 {
			priceFilter["$lte"] = maxPrice
		}
		filter["price"] = priceFilter
	}

	// Location filter
	if location != "" {
		filter["$or"] = []bson.M{
			{"location.city": bson.M{"$regex": location, "$options": "i"}},
			{"location.state": bson.M{"$regex": location, "$options": "i"}},
		}
	}

	// Calculate pagination
	page, limit, totalPages, offset := utils.CalculatePagination(page, limit, 0)

	// Sort options
	sort := bson.D{}
	if sortOrder == "desc" {
		sort = append(sort, bson.E{Key: sortBy, Value: -1})
	} else {
		sort = append(sort, bson.E{Key: sortBy, Value: 1})
	}

	// Get total count
	total, err := config.Coll.Products.CountDocuments(ctx, filter)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to count products", err.Error())
		return
	}

	// Recalculate total pages with actual count
	_, _, totalPages, _ = utils.CalculatePagination(page, limit, total)

	// Enhanced pipeline with seller info and ratings
	pipeline := []bson.M{
		{"$match": filter},
		{"$lookup": bson.M{
			"from":         "users",
			"localField":   "seller_id",
			"foreignField": "_id",
			"as":           "seller",
		}},
		{"$unwind": "$seller"},
		{"$lookup": bson.M{
			"from": "product_reviews",
			"let": bson.M{"productId": "$_id"},
			"pipeline": []bson.M{
				{"$match": bson.M{
					"$expr": bson.M{"$eq": []string{"$product_id", "$$productId"}},
					"is_approved": true,
				}},
				{"$group": bson.M{
					"_id": nil,
					"avg_rating": bson.M{"$avg": "$rating"},
					"review_count": bson.M{"$sum": 1},
				}},
			},
			"as": "rating_info",
		}},
		{"$addFields": bson.M{
			"seller_info": bson.M{
				"id":     "$seller._id",
				"name":   bson.M{"$concat": []string{"$seller.profile.first_name", " ", "$seller.profile.last_name"}},
				"avatar": "$seller.profile.avatar",
				"rating": "$seller.profile.rating",
			},
			"rating": bson.M{"$ifNull": []interface{}{
				bson.M{"$arrayElemAt": []interface{}{"$rating_info.avg_rating", 0}},
				0,
			}},
			"review_count": bson.M{"$ifNull": []interface{}{
				bson.M{"$arrayElemAt": []interface{}{"$rating_info.review_count", 0}},
				0,
			}},
			"in_stock": bson.M{"$gt": []interface{}{"$quantity", 0}},
			"is_new": bson.M{"$gte": []interface{}{"$created_at", time.Now().AddDate(0, 0, -30)}},
		}},
		{"$project": bson.M{
			"seller":      0,
			"rating_info": 0,
		}},
		{"$sort": sort},
		{"$skip": offset},
		{"$limit": limit},
	}

	cursor, err := config.Coll.Products.Aggregate(ctx, pipeline)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch products", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var products []bson.M
	if err = cursor.All(ctx, &products); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to decode products", err.Error())
		return
	}

	// Prepare response with metadata
	meta := &utils.Meta{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}

	utils.SuccessResponseWithMeta(c, http.StatusOK, "Products retrieved successfully", products, meta)
}

// GetProduct handles single product retrieval
func (h *ProductHandler) GetProduct(c *gin.Context) {
	productID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(productID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid product ID", nil)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var product models.Product
	err = config.Coll.Products.FindOne(ctx, bson.M{
		"_id":    objID,
		"status": bson.M{"$ne": models.ProductStatusDeleted},
	}).Decode(&product)

	if err != nil {
		utils.NotFoundResponse(c, "Product not found")
		return
	}

	// Increment view count
	go func() {
		config.Coll.Products.UpdateOne(context.Background(),
			bson.M{"_id": objID},
			bson.M{"$inc": bson.M{"view_count": 1}},
		)

		// Log product view
		userID, _ := c.Get("user_id")
		view := models.ProductView{
			ID:        primitive.NewObjectID(),
			ProductID: objID,
			IPAddress: c.ClientIP(),
			UserAgent: c.Request.UserAgent(),
			ViewedAt:  time.Now(),
		}
		
		if userID != nil {
			userObjID, _ := primitive.ObjectIDFromHex(userID.(string))
			view.UserID = &userObjID
		}
		
		config.Coll.ProductViews.InsertOne(context.Background(), view)
	}()

	utils.SuccessResponse(c, http.StatusOK, "Product retrieved successfully", product)
}

// UpdateProduct handles product updates
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	productID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(productID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid product ID", nil)
		return
	}

	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	sellerID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if product exists and belongs to seller
	var existingProduct models.Product
	err = config.Coll.Products.FindOne(ctx, bson.M{
		"_id":       objID,
		"seller_id": sellerID,
	}).Decode(&existingProduct)

	if err != nil {
		utils.NotFoundResponse(c, "Product not found or access denied")
		return
	}

	// Update product
	update := bson.M{
		"$set": bson.M{
			"title":        utils.SanitizeString(req.Title),
			"description":  utils.SanitizeString(req.Description),
			"price":        req.Price,
			"currency":     req.Currency,
			"condition":    models.ProductCondition(req.Condition),
			"brand":        req.Brand,
			"model":        req.Model,
			"color":        req.Color,
			"quantity":     req.Quantity,
			"location": models.ProductLocation{
				City:        req.Location.City,
				State:       req.Location.State,
				Country:     req.Location.Country,
				PostalCode:  req.Location.PostalCode,
				Coordinates: req.Location.Coordinates,
			},
			"swap_available": req.SwapAvailable,
			"tags":           req.Tags,
			"updated_at":     time.Now(),
		},
	}

	_, err = config.Coll.Products.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to update product", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Product updated successfully", nil)
}

// DeleteProduct handles product deletion
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	productID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(productID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid product ID", nil)
		return
	}

	userID, _ := c.Get("user_id")
	sellerID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Soft delete - update status to deleted
	result, err := config.Coll.Products.UpdateOne(ctx,
		bson.M{
			"_id":       objID,
			"seller_id": sellerID,
		},
		bson.M{
			"$set": bson.M{
				"status":     models.ProductStatusDeleted,
				"updated_at": time.Now(),
			},
		},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to delete product", err.Error())
		return
	}

	if result.MatchedCount == 0 {
		utils.NotFoundResponse(c, "Product not found or access denied")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Product deleted successfully", nil)
}

// getProductStatus returns appropriate status based on user type
func getProductStatus(userType models.UserType) models.ProductStatus {
	if userType == models.UserTypeAdmin {
		return models.ProductStatusActive
	}
	return models.ProductStatusDraft
}

// GetProductRecommendations gets recommended products based on current product
func (h *ProductHandler) GetProductRecommendations(c *gin.Context) {
	productID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(productID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid product ID", nil)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get current product
	var product models.Product
	err = config.Coll.Products.FindOne(ctx, bson.M{"_id": objID}).Decode(&product)
	if err != nil {
		utils.NotFoundResponse(c, "Product not found")
		return
	}

	// Build recommendation pipeline
	pipeline := []bson.M{
		{"$match": bson.M{
			"_id": bson.M{"$ne": objID},
			"status": models.ProductStatusActive,
		}},
	}

	// Add scoring based on similarity
	pipeline = append(pipeline, bson.M{
		"$addFields": bson.M{
			"score": bson.M{
				"$add": []interface{}{
					// Same category: +10 points
					bson.M{"$cond": []interface{}{
						bson.M{"$eq": []interface{}{"$category_id", product.CategoryID}},
						10, 0,
					}},
					// Same brand: +5 points
					bson.M{"$cond": []interface{}{
						bson.M{"$eq": []interface{}{"$brand", product.Brand}},
						5, 0,
					}},
					// Similar price range: +3 points
					bson.M{"$cond": []interface{}{
						bson.M{"$and": []interface{}{
							bson.M{"$gte": []interface{}{"$price", product.Price * 0.7}},
							bson.M{"$lte": []interface{}{"$price", product.Price * 1.3}},
						}},
						3, 0,
					}},
					// Same condition: +2 points
					bson.M{"$cond": []interface{}{
						bson.M{"$eq": []interface{}{"$condition", product.Condition}},
						2, 0,
					}},
				},
			},
		},
	})

	// Sort by score and limit
	pipeline = append(pipeline, bson.M{"$sort": bson.M{"score": -1, "created_at": -1}})
	pipeline = append(pipeline, bson.M{"$limit": 10})

	cursor, err := config.Coll.Products.Aggregate(ctx, pipeline)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to get recommendations", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var recommendations []bson.M
	cursor.All(ctx, &recommendations)

	utils.SuccessResponse(c, http.StatusOK, "Recommendations retrieved", recommendations)
}

// GetProductVariants gets product variants (similar products from same seller)
func (h *ProductHandler) GetProductVariants(c *gin.Context) {
	productID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(productID)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid product ID", nil)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get current product
	var product models.Product
	err = config.Coll.Products.FindOne(ctx, bson.M{"_id": objID}).Decode(&product)
	if err != nil {
		utils.NotFoundResponse(c, "Product not found")
		return
	}

	// Find variants (same seller, brand, model but different attributes)
	filter := bson.M{
		"_id": bson.M{"$ne": objID},
		"seller_id": product.SellerID,
		"status": models.ProductStatusActive,
		"$or": []bson.M{
			{"brand": product.Brand, "model": product.Model},
			{"category_id": product.CategoryID, "brand": product.Brand},
		},
	}

	cursor, err := config.Coll.Products.Find(ctx, filter, options.Find().SetLimit(20))
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to get variants", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var variants []models.Product
	cursor.All(ctx, &variants)

	// Group variants by attributes
	variantGroups := map[string][]models.Product{
		"color": {},
		"size": {},
		"condition": {},
	}

	for _, variant := range variants {
		if variant.Color != product.Color && variant.Color != "" {
			variantGroups["color"] = append(variantGroups["color"], variant)
		}
		if variant.Condition != product.Condition {
			variantGroups["condition"] = append(variantGroups["condition"], variant)
		}
		// Add size variants if specifications contain size info
		if variant.Specifications != nil {
			if size, exists := variant.Specifications["size"]; exists {
				if productSize, hasSize := product.Specifications["size"]; hasSize {
					if size != productSize {
						variantGroups["size"] = append(variantGroups["size"], variant)
					}
				}
			}
		}
	}

	utils.SuccessResponse(c, http.StatusOK, "Product variants retrieved", gin.H{
		"variants": variantGroups,
		"total_variants": len(variants),
	})
}