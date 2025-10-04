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

)

type PriceAlertHandler struct{}

type PriceAlert struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	ProductID   primitive.ObjectID `bson:"product_id" json:"product_id"`
	TargetPrice float64            `bson:"target_price" json:"target_price"`
	CurrentPrice float64           `bson:"current_price" json:"current_price"`
	Status      string             `bson:"status" json:"status"` // active, triggered, expired
	IsActive    bool               `bson:"is_active" json:"is_active"`
	TriggeredAt *time.Time         `bson:"triggered_at,omitempty" json:"triggered_at,omitempty"`
	ExpiresAt   *time.Time         `bson:"expires_at,omitempty" json:"expires_at,omitempty"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}

func NewPriceAlertHandler() *PriceAlertHandler {
	return &PriceAlertHandler{}
}

func (h *PriceAlertHandler) GetPriceAlerts(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := []bson.M{
		{"$match": bson.M{"user_id": userObjID, "is_active": true}},
		{"$lookup": bson.M{
			"from":         "products",
			"localField":   "product_id",
			"foreignField": "_id",
			"as":           "product",
		}},
		{"$unwind": "$product"},
		{"$project": bson.M{
			"target_price":  1,
			"current_price": 1,
			"status":        1,
			"created_at":    1,
			"expires_at":    1,
			"product": bson.M{
				"id":    "$product._id",
				"title": "$product.title",
				"price": "$product.price",
				"image": bson.M{"$arrayElemAt": []interface{}{"$product.images.url", 0}},
			},
		}},
		{"$sort": bson.M{"created_at": -1}},
	}

	cursor, err := config.Coll.PriceAlerts.Aggregate(ctx, pipeline)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch price alerts", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var alerts []bson.M
	cursor.All(ctx, &alerts)

	utils.SuccessResponse(c, http.StatusOK, "Price alerts retrieved", alerts)
}

func (h *PriceAlertHandler) CreatePriceAlert(c *gin.Context) {
	var req struct {
		ProductID   string  `json:"product_id" binding:"required"`
		TargetPrice float64 `json:"target_price" binding:"required,min=0"`
		ExpiresIn   int     `json:"expires_in"` // days
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))
	productObjID, _ := primitive.ObjectIDFromHex(req.ProductID)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get current product price
	var product struct {
		Price float64 `bson:"price"`
	}
	err := config.Coll.Products.FindOne(ctx, bson.M{
		"_id":    productObjID,
		"status": "active",
	}).Decode(&product)

	if err != nil {
		utils.NotFoundResponse(c, "Product not found")
		return
	}

	// Check if alert already exists
	var existing PriceAlert
	err = config.Coll.PriceAlerts.FindOne(ctx, bson.M{
		"user_id":    userObjID,
		"product_id": productObjID,
		"is_active":  true,
	}).Decode(&existing)

	if err == nil {
		utils.BadRequestResponse(c, "Price alert already exists for this product", nil)
		return
	}

	// Set expiry date
	var expiresAt *time.Time
	if req.ExpiresIn > 0 {
		expiry := time.Now().AddDate(0, 0, req.ExpiresIn)
		expiresAt = &expiry
	}

	alert := PriceAlert{
		ID:           primitive.NewObjectID(),
		UserID:       userObjID,
		ProductID:    productObjID,
		TargetPrice:  req.TargetPrice,
		CurrentPrice: product.Price,
		Status:       "active",
		IsActive:     true,
		ExpiresAt:    expiresAt,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	_, err = config.Coll.PriceAlerts.InsertOne(ctx, alert)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create price alert", err.Error())
		return
	}

	utils.CreatedResponse(c, "Price alert created successfully", alert)
}

func (h *PriceAlertHandler) DeletePriceAlert(c *gin.Context) {
	alertID := c.Param("id")
	alertObjID, _ := primitive.ObjectIDFromHex(alertID)
	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := config.Coll.PriceAlerts.UpdateOne(ctx,
		bson.M{"_id": alertObjID, "user_id": userObjID},
		bson.M{"$set": bson.M{"is_active": false, "updated_at": time.Now()}},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to delete price alert", err.Error())
		return
	}

	if result.MatchedCount == 0 {
		utils.NotFoundResponse(c, "Price alert not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Price alert deleted", nil)
}

// CheckPriceAlerts - background job to check and trigger alerts
func (h *PriceAlertHandler) CheckPriceAlerts() {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Get all active alerts
	cursor, err := config.Coll.PriceAlerts.Find(ctx, bson.M{
		"is_active": true,
		"status":    "active",
		"$or": []bson.M{
			{"expires_at": bson.M{"$gt": time.Now()}},
			{"expires_at": nil},
		},
	})

	if err != nil {
		return
	}
	defer cursor.Close(ctx)

	var alerts []PriceAlert
	cursor.All(ctx, &alerts)

	for _, alert := range alerts {
		// Get current product price
		var product struct {
			Price float64 `bson:"price"`
		}
		err := config.Coll.Products.FindOne(ctx, bson.M{
			"_id":    alert.ProductID,
			"status": "active",
		}).Decode(&product)

		if err != nil {
			continue
		}

		// Check if target price is reached
		if product.Price <= alert.TargetPrice {
			// Trigger alert
			now := time.Now()
			config.Coll.PriceAlerts.UpdateOne(ctx,
				bson.M{"_id": alert.ID},
				bson.M{
					"$set": bson.M{
						"status":        "triggered",
						"current_price": product.Price,
						"triggered_at":  now,
						"updated_at":    now,
					},
				},
			)

			// Create notification
			h.createPriceAlertNotification(ctx, alert, product.Price)
		} else {
			// Update current price
			config.Coll.PriceAlerts.UpdateOne(ctx,
				bson.M{"_id": alert.ID},
				bson.M{
					"$set": bson.M{
						"current_price": product.Price,
						"updated_at":    time.Now(),
					},
				},
			)
		}
	}
}

func (h *PriceAlertHandler) createPriceAlertNotification(ctx context.Context, alert PriceAlert, newPrice float64) {
	notification := bson.M{
		"_id":        primitive.NewObjectID(),
		"user_id":    alert.UserID,
		"type":       "price_alert",
		"title":      "Price Alert Triggered!",
		"message":    "A product in your price alerts has dropped to your target price",
		"is_read":    false,
		"related_id": alert.ProductID,
		"priority":   2,
		"created_at": time.Now(),
	}

	config.Coll.Notifications.InsertOne(ctx, notification)
}