package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"autoboy-backend/utils"
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
		// TODO: Update subscription status in database
		// TODO: Send confirmation email
		utils.SuccessResponse(c, http.StatusOK, "Payment verified successfully", paystackResp.Data)
	} else {
		utils.BadRequestResponse(c, fmt.Sprintf("Payment status: %s", status), paystackResp.Data)
	}
}