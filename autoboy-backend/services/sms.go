package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"autoboy-backend/utils"
)

// SMSService handles SMS operations
type SMSService struct {
	apiKey    string
	apiSecret string
	sender    string
	baseURL   string
}

// NewSMSService creates a new SMS service
func NewSMSService() *SMSService {
	return &SMSService{
		apiKey:    utils.GetEnv("SMS_API_KEY", ""),
		apiSecret: utils.GetEnv("SMS_API_SECRET", ""),
		sender:    utils.GetEnv("SMS_SENDER", "AutoBoy"),
		baseURL:   utils.GetEnv("SMS_BASE_URL", "https://api.ng.termii.com/api"),
	}
}

// SMSRequest represents SMS API request
type SMSRequest struct {
	To      string `json:"to"`
	From    string `json:"from"`
	SMS     string `json:"sms"`
	Type    string `json:"type"`
	Channel string `json:"channel"`
	APIKey  string `json:"api_key"`
}

// SMSResponse represents SMS API response
type SMSResponse struct {
	MessageID string `json:"message_id"`
	Message   string `json:"message"`
	Balance   string `json:"balance"`
	User      string `json:"user"`
}

// SendSMS sends an SMS message
func (s *SMSService) SendSMS(to, message string) error {
	if s.apiKey == "" {
		log.Printf("SMS not sent to %s: API key not configured", to)
		return nil // Don't fail in development
	}

	// Normalize phone number
	normalizedPhone := utils.NormalizePhone(to)
	if normalizedPhone == "" {
		return fmt.Errorf("invalid phone number: %s", to)
	}

	// Prepare request
	smsReq := SMSRequest{
		To:      normalizedPhone,
		From:    s.sender,
		SMS:     message,
		Type:    "plain",
		Channel: "generic",
		APIKey:  s.apiKey,
	}

	// Convert to JSON
	jsonData, err := json.Marshal(smsReq)
	if err != nil {
		return fmt.Errorf("failed to marshal SMS request: %v", err)
	}

	// Send HTTP request
	resp, err := http.Post(
		s.baseURL+"/sms/send",
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return fmt.Errorf("failed to send SMS request: %v", err)
	}
	defer resp.Body.Close()

	// Parse response
	var smsResp SMSResponse
	if err := json.NewDecoder(resp.Body).Decode(&smsResp); err != nil {
		return fmt.Errorf("failed to decode SMS response: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("SMS API error: %s", smsResp.Message)
	}

	log.Printf("SMS sent successfully to %s, Message ID: %s", normalizedPhone, smsResp.MessageID)
	return nil
}

// SendOTP sends OTP via SMS
func (s *SMSService) SendOTP(phone, otp string) error {
	message := fmt.Sprintf("Your AutoBoy verification code is: %s. This code expires in 10 minutes. Do not share this code with anyone.", otp)
	return s.SendSMS(phone, message)
}

// SendOrderNotification sends order notification SMS
func (s *SMSService) SendOrderNotification(phone, orderNumber, status string) error {
	var message string
	
	switch status {
	case "confirmed":
		message = fmt.Sprintf("Your AutoBoy order %s has been confirmed and is being processed. Track your order in the app.", orderNumber)
	case "shipped":
		message = fmt.Sprintf("Great news! Your AutoBoy order %s has been shipped. You'll receive it soon!", orderNumber)
	case "delivered":
		message = fmt.Sprintf("Your AutoBoy order %s has been delivered. Thank you for shopping with us!", orderNumber)
	default:
		message = fmt.Sprintf("Your AutoBoy order %s status has been updated to: %s", orderNumber, status)
	}
	
	return s.SendSMS(phone, message)
}

// SendPaymentNotification sends payment notification SMS
func (s *SMSService) SendPaymentNotification(phone, amount, status string) error {
	var message string
	
	switch status {
	case "success":
		message = fmt.Sprintf("Payment of %s received successfully. Your AutoBoy order is being processed.", amount)
	case "failed":
		message = fmt.Sprintf("Payment of %s failed. Please try again or contact support if the issue persists.", amount)
	default:
		message = fmt.Sprintf("Payment status update: %s for amount %s", status, amount)
	}
	
	return s.SendSMS(phone, message)
}

// SendSecurityAlert sends security alert SMS
func (s *SMSService) SendSecurityAlert(phone, alertType string) error {
	var message string
	
	switch alertType {
	case "login":
		message = "New login detected on your AutoBoy account. If this wasn't you, please secure your account immediately."
	case "password_change":
		message = "Your AutoBoy account password was changed. If you didn't make this change, contact support immediately."
	case "suspicious_activity":
		message = "Suspicious activity detected on your AutoBoy account. Please review your account security settings."
	default:
		message = "Security alert for your AutoBoy account. Please check your account for any unauthorized activity."
	}
	
	return s.SendSMS(phone, message)
}

// SendWelcomeSMS sends welcome SMS to new users
func (s *SMSService) SendWelcomeSMS(phone, name string) error {
	message := fmt.Sprintf("Hi %s! Welcome to AutoBoy - Nigeria's #1 gadget trading platform. Start buying, selling & swapping gadgets today!", name)
	return s.SendSMS(phone, message)
}

// SendPromotionalSMS sends promotional SMS
func (s *SMSService) SendPromotionalSMS(phone, promoCode, discount string) error {
	message := fmt.Sprintf("🎉 Special offer! Get %s off your next AutoBoy purchase with code: %s. Valid for 7 days. Shop now!", discount, promoCode)
	return s.SendSMS(phone, message)
}

// ValidatePhoneNumber validates if phone number can receive SMS
func (s *SMSService) ValidatePhoneNumber(phone string) bool {
	normalizedPhone := utils.NormalizePhone(phone)
	return normalizedPhone != "" && len(normalizedPhone) >= 10
}