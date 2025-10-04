package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"autoboy-backend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PaystackHandler struct{}

func NewPaystackHandler() *PaystackHandler {
	return &PaystackHandler{}
}

const (
	PaystackBaseURL = "https://api.paystack.co"
)

var (
	PaystackSecretKey = utils.GetEnv("PAYSTACK_SECRET_KEY", "")
	PaystackPublicKey = utils.GetEnv("PAYSTACK_PUBLIC_KEY", "")
)

type InitializePaymentRequest struct {
	Email    string `json:"email" binding:"required"`
	Amount   int    `json:"amount" binding:"required"` // Amount in kobo
	Currency string `json:"currency"`
	Callback string `json:"callback_url"`
	Metadata map[string]interface{} `json:"metadata"`
}

type PaystackResponse struct {
	Status  bool        `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

// InitializePayment initializes a Paystack payment
func (h *PaystackHandler) InitializePayment(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	// Validate Paystack secret key
	if PaystackSecretKey == "" {
		utils.InternalServerErrorResponse(c, "Payment service not configured", "Paystack secret key not found")
		return
	}
	
	var req InitializePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	// Set default currency
	if req.Currency == "" {
		req.Currency = "NGN"
	}

	// Add user metadata
	if req.Metadata == nil {
		req.Metadata = make(map[string]interface{})
	}
	req.Metadata["user_id"] = userID

	// Make request to Paystack
	jsonData, _ := json.Marshal(req)
	
	httpReq, err := http.NewRequest("POST", PaystackBaseURL+"/transaction/initialize", bytes.NewBuffer(jsonData))
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create payment request", err.Error())
		return
	}

	httpReq.Header.Set("Authorization", "Bearer "+PaystackSecretKey)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to initialize payment", err.Error())
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to read payment response", err.Error())
		return
	}

	var paystackResp PaystackResponse
	if err := json.Unmarshal(body, &paystackResp); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to parse payment response", err.Error())
		return
	}

	if !paystackResp.Status {
		utils.BadRequestResponse(c, "Payment initialization failed", paystackResp.Message)
		return
	}

	// Extract checkout URL and reference from Paystack response
	paymentData := paystackResp.Data.(map[string]interface{})
	checkoutURL := paymentData["authorization_url"].(string)
	reference := paymentData["reference"].(string)

	response := gin.H{
		"checkout_url": checkoutURL,
		"reference":    reference,
		"access_code":  paymentData["access_code"],
	}

	utils.SuccessResponse(c, http.StatusOK, "Payment initialized successfully", response)
}

// VerifyPayment verifies a Paystack payment
func (h *PaystackHandler) VerifyPayment(c *gin.Context) {
	reference := c.Param("reference")
	if reference == "" {
		utils.BadRequestResponse(c, "Payment reference is required", nil)
		return
	}

	// Make request to Paystack
	httpReq, err := http.NewRequest("GET", PaystackBaseURL+"/transaction/verify/"+reference, nil)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create verification request", err.Error())
		return
	}

	httpReq.Header.Set("Authorization", "Bearer "+PaystackSecretKey)

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to verify payment", err.Error())
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to read verification response", err.Error())
		return
	}

	var paystackResp PaystackResponse
	if err := json.Unmarshal(body, &paystackResp); err != nil {
		utils.InternalServerErrorResponse(c, "Failed to parse verification response", err.Error())
		return
	}

	if !paystackResp.Status {
		utils.BadRequestResponse(c, "Payment verification failed", paystackResp.Message)
		return
	}

	// Extract payment data
	paymentData := paystackResp.Data.(map[string]interface{})
	status := paymentData["status"].(string)

	if status == "success" {
		// Update subscription status in database
		paymentData := paystackResp.Data.(map[string]interface{})
		if metadata, ok := paymentData["metadata"].(map[string]interface{}); ok {
			if userIDStr, exists := metadata["user_id"]; exists {
				userID := fmt.Sprintf("%v", userIDStr)
				userObjID, _ := primitive.ObjectIDFromHex(userID)
				
				// Update user premium status
				update := bson.M{
					"$set": bson.M{
						"premium_status": "active",
						"premium_expires_at": time.Now().AddDate(0, 1, 0), // 1 month
						"updated_at": time.Now(),
					},
				}
				utils.DB.Collection("users").UpdateOne(c, bson.M{"_id": userObjID}, update)
			}
		}
		
		// TODO: Send confirmation email
		utils.SuccessResponse(c, http.StatusOK, "Payment verified successfully", paystackResp.Data)
	} else {
		utils.BadRequestResponse(c, fmt.Sprintf("Payment status: %s", status), paystackResp.Data)
	}
}

// ProcessRefund processes a payment refund
func (h *PaystackHandler) ProcessRefund(c *gin.Context) {
	var req struct {
		TransactionID string  `json:"transaction_id" binding:"required"`
		Amount        float64 `json:"amount"`
		Reason        string  `json:"reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	refundData := map[string]interface{}{
		"transaction": req.TransactionID,
	}

	if req.Amount > 0 {
		refundData["amount"] = int(req.Amount * 100) // Convert to kobo
	}

	jsonData, _ := json.Marshal(refundData)
	httpReq, err := http.NewRequest("POST", PaystackBaseURL+"/refund", bytes.NewBuffer(jsonData))
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create refund request", err.Error())
		return
	}

	httpReq.Header.Set("Authorization", "Bearer "+PaystackSecretKey)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to process refund", err.Error())
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var paystackResp PaystackResponse
	json.Unmarshal(body, &paystackResp)

	if !paystackResp.Status {
		utils.BadRequestResponse(c, "Refund failed", paystackResp.Message)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Refund processed successfully", paystackResp.Data)
}

// HandlePaymentDispute handles payment disputes
func (h *PaystackHandler) HandlePaymentDispute(c *gin.Context) {
	var req struct {
		TransactionID string `json:"transaction_id" binding:"required"`
		Evidence      string `json:"evidence" binding:"required"`
		UploadURL     string `json:"upload_url"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "Invalid request data", err.Error())
		return
	}

	// Store dispute in database
	dispute := bson.M{
		"_id": primitive.NewObjectID(),
		"transaction_id": req.TransactionID,
		"evidence": req.Evidence,
		"upload_url": req.UploadURL,
		"status": "pending",
		"created_at": time.Now(),
	}

	_, err := utils.DB.Collection("payment_disputes").InsertOne(c, dispute)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to record dispute", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Dispute recorded successfully", dispute)
}

// HandleWebhook handles Paystack webhooks
func (h *PaystackHandler) HandleWebhook(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		utils.BadRequestResponse(c, "Failed to read webhook body", err.Error())
		return
	}

	var webhook map[string]interface{}
	if err := json.Unmarshal(body, &webhook); err != nil {
		utils.BadRequestResponse(c, "Invalid webhook data", err.Error())
		return
	}

	event := webhook["event"].(string)
	data := webhook["data"].(map[string]interface{})

	switch event {
	case "charge.success":
		// Handle successful payment
		reference := data["reference"].(string)
		_ = data["amount"].(float64)
		
		// Update order status
		filter := bson.M{"payment_reference": reference}
		update := bson.M{"$set": bson.M{
			"payment_status": "paid",
			"status": "confirmed",
			"updated_at": time.Now(),
		}}
		utils.DB.Collection("orders").UpdateOne(c, filter, update)

	case "subscription.create":
		// TODO: Update subscription status in database
		subscriptionCode := data["subscription_code"].(string)
		customerEmail := data["customer"].(map[string]interface{})["email"].(string)
		
		// Update user subscription
		filter := bson.M{"email": customerEmail}
		update := bson.M{"$set": bson.M{
			"subscription_code": subscriptionCode,
			"subscription_status": "active",
			"updated_at": time.Now(),
		}}
		utils.DB.Collection("users").UpdateOne(c, filter, update)

	case "subscription.disable":
		// Handle subscription cancellation
		subscriptionCode := data["subscription_code"].(string)
		filter := bson.M{"subscription_code": subscriptionCode}
		update := bson.M{"$set": bson.M{
			"subscription_status": "cancelled",
			"updated_at": time.Now(),
		}}
		utils.DB.Collection("users").UpdateOne(c, filter, update)
	}

	// TODO: Send confirmation email based on event type
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}