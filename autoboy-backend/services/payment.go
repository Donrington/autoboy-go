package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"autoboy-backend/utils"
)

type PaymentService struct {
	paystackSecretKey string
	paystackPublicKey string
}

func NewPaymentService() *PaymentService {
	return &PaymentService{
		paystackSecretKey: utils.GetEnv("PAYSTACK_SECRET_KEY", ""),
		paystackPublicKey: utils.GetEnv("PAYSTACK_PUBLIC_KEY", ""),
	}
}

func (s *PaymentService) InitializePayment(amount float64, email string) (map[string]interface{}, error) {
	if s.paystackSecretKey == "" {
		return nil, fmt.Errorf("paystack secret key not configured")
	}

	// Create payment reference
	reference := utils.GeneratePaymentNumber()

	// Prepare Paystack request
	payload := map[string]interface{}{
		"email":     email,
		"amount":    int(amount * 100), // Convert to kobo
		"reference": reference,
		"currency":  "NGN",
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	// Make request to Paystack
	req, err := http.NewRequest("POST", "https://api.paystack.co/transaction/initialize", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+s.paystackSecretKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if !result["status"].(bool) {
		return nil, fmt.Errorf("payment initialization failed: %v", result["message"])
	}

	return result["data"].(map[string]interface{}), nil
}

func (s *PaymentService) VerifyPayment(reference string) (map[string]interface{}, error) {
	if s.paystackSecretKey == "" {
		return nil, fmt.Errorf("paystack secret key not configured")
	}

	// Make request to Paystack
	req, err := http.NewRequest("GET", "https://api.paystack.co/transaction/verify/"+reference, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+s.paystackSecretKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if !result["status"].(bool) {
		return nil, fmt.Errorf("payment verification failed: %v", result["message"])
	}

	return result["data"].(map[string]interface{}), nil
}