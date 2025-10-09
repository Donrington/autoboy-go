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

type QuestionHandler struct{}

func NewQuestionHandler() *QuestionHandler {
	return &QuestionHandler{}
}

func (h *QuestionHandler) GetProductQuestions(c *gin.Context) {
	productID := c.Param("id")
	productObjID, _ := primitive.ObjectIDFromHex(productID)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := []bson.M{
		{"$match": bson.M{"product_id": productObjID, "is_public": true}},
		{"$lookup": bson.M{
			"from":         "users",
			"localField":   "user_id",
			"foreignField": "_id",
			"as":           "user",
		}},
		{"$unwind": "$user"},
		{"$lookup": bson.M{
			"from":         "users",
			"localField":   "answered_by",
			"foreignField": "_id",
			"as":           "answerer",
		}},
		{"$project": bson.M{
			"question":    1,
			"answer":      1,
			"answered_at": 1,
			"created_at":  1,
			"user": bson.M{
				"name": bson.M{"$concat": []interface{}{"$user.profile.first_name", " ", "$user.profile.last_name"}},
			},
			"answerer": bson.M{
				"$cond": bson.M{
					"if": bson.M{"$gt": []interface{}{bson.M{"$size": "$answerer"}, 0}},
					"then": bson.M{
						"name": bson.M{"$concat": []interface{}{
							bson.M{"$arrayElemAt": []interface{}{"$answerer.profile.first_name", 0}},
							" ",
							bson.M{"$arrayElemAt": []interface{}{"$answerer.profile.last_name", 0}},
						}},
						"is_seller": bson.M{"$eq": []interface{}{
							bson.M{"$arrayElemAt": []interface{}{"$answerer.user_type", 0}},
							"seller",
						}},
					},
					"else": nil,
				},
			},
		}},
		{"$sort": bson.M{"created_at": -1}},
	}

	cursor, err := config.Coll.ProductQuestions.Aggregate(ctx, pipeline)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch questions", err.Error())
		return
	}
	defer cursor.Close(ctx)

	var questions []bson.M
	cursor.All(ctx, &questions)

	utils.SuccessResponse(c, http.StatusOK, "Questions retrieved successfully", questions)
}

func (h *QuestionHandler) CreateQuestion(c *gin.Context) {
	var req struct {
		ProductID string `json:"product_id" binding:"required"`
		Question  string `json:"question" binding:"required,min=5,max=500"`
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

	// Verify product exists
	var product models.Product
	err := config.Coll.Products.FindOne(ctx, bson.M{
		"_id":    productObjID,
		"status": models.ProductStatusActive,
	}).Decode(&product)

	if err != nil {
		utils.NotFoundResponse(c, "Product not found")
		return
	}

	question := models.ProductQuestion{
		ID:        primitive.NewObjectID(),
		ProductID: productObjID,
		UserID:    userObjID,
		Question:  req.Question,
		IsPublic:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = config.Coll.ProductQuestions.InsertOne(ctx, question)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create question", err.Error())
		return
	}

	utils.CreatedResponse(c, "Question created successfully", question)
}

func (h *QuestionHandler) AnswerQuestion(c *gin.Context) {
	questionID := c.Param("id")
	questionObjID, _ := primitive.ObjectIDFromHex(questionID)

	var req struct {
		Answer string `json:"answer" binding:"required,min=5,max=1000"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get question and verify user can answer (seller of the product)
	var question models.ProductQuestion
	err := config.Coll.ProductQuestions.FindOne(ctx, bson.M{"_id": questionObjID}).Decode(&question)
	if err != nil {
		utils.NotFoundResponse(c, "Question not found")
		return
	}

	// Verify user is the seller of the product
	var product models.Product
	err = config.Coll.Products.FindOne(ctx, bson.M{
		"_id":       question.ProductID,
		"seller_id": userObjID,
	}).Decode(&product)

	if err != nil {
		utils.ForbiddenResponse(c, "Only the product seller can answer questions")
		return
	}

	now := time.Now()
	_, err = config.Coll.ProductQuestions.UpdateOne(ctx,
		bson.M{"_id": questionObjID},
		bson.M{
			"$set": bson.M{
				"answer":      req.Answer,
				"answered_by": userObjID,
				"answered_at": now,
				"updated_at":  now,
			},
		},
	)

	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to answer question", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Question answered successfully", nil)
}