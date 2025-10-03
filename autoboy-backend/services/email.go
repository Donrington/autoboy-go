package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"

	"autoboy-backend/utils"
)

// EmailService handles email operations
type EmailService struct {
	smtpHost     string
	smtpPort     string
	smtpUsername string
	smtpPassword string
	fromEmail    string
	fromName     string
}

// NewEmailService creates a new email service
func NewEmailService() *EmailService {
	return &EmailService{
		smtpHost:     utils.GetEnv("SMTP_HOST", "smtp.gmail.com"),
		smtpPort:     utils.GetEnv("SMTP_PORT", "465"),
		smtpUsername: utils.GetEnv("SMTP_USERNAME", ""),
		smtpPassword: utils.GetEnv("SMTP_PASSWORD", ""),
		fromEmail:    utils.GetEnv("FROM_EMAIL", "autoboyexpress@gmail.com"),
		fromName:     "AutoBoy",
	}
}

// EmailTemplate represents an email template
type EmailTemplate struct {
	Subject string
	Body    string
}

// SendEmail sends an email
func (s *EmailService) SendEmail(to, subject, body string) error {
	// Try SendGrid first if API key is available
	sendGridKey := utils.GetEnv("SENDGRID_API_KEY", "")
	if sendGridKey != "" {
		log.Printf("[EMAIL] Attempting SendGrid API")
		return s.sendWithSendGrid(to, subject, body, sendGridKey)
	}
	
	// Fallback to Gmail SMTP
	log.Printf("=== EMAIL SERVICE DEBUG START ===")
	log.Printf("[EMAIL] Recipient: %s", to)
	log.Printf("[EMAIL] Subject: %s", subject)
	log.Printf("[EMAIL] SMTP Host: %s", s.smtpHost)
	log.Printf("[EMAIL] SMTP Port: %s", s.smtpPort)
	log.Printf("[EMAIL] SMTP Username: %s", s.smtpUsername)
	log.Printf("[EMAIL] From Email: %s", s.fromEmail)
	log.Printf("[EMAIL] Password Length: %d", len(s.smtpPassword))
	
	if s.smtpUsername == "" || s.smtpPassword == "" {
		log.Printf("[EMAIL ERROR] SMTP credentials not configured - Username: '%s', Password Length: %d", s.smtpUsername, len(s.smtpPassword))
		return fmt.Errorf("SMTP credentials not configured")
	}

	// Setup authentication
	auth := smtp.PlainAuth("", s.smtpUsername, s.smtpPassword, s.smtpHost)

	// Compose message with proper headers
	msg := []byte(fmt.Sprintf(
		"From: %s <%s>\r\n"+
			"To: %s\r\n"+
			"Subject: %s\r\n"+
			"MIME-Version: 1.0\r\n"+
			"Content-Type: text/html; charset=UTF-8\r\n"+
			"Content-Transfer-Encoding: 8bit\r\n"+
			"\r\n"+
			"%s\r\n",
		s.fromName, s.fromEmail, to, subject, body,
	))

	// Send email with detailed error logging
	log.Printf("[EMAIL] Attempting SMTP connection to %s:%s", s.smtpHost, s.smtpPort)
	log.Printf("[EMAIL] Auth details - Username: %s, From: %s", s.smtpUsername, s.fromEmail)
	
	err := smtp.SendMail(s.smtpHost+":"+s.smtpPort, auth, s.fromEmail, []string{to}, msg)
	if err != nil {
		log.Printf("[EMAIL ERROR] SMTP SendMail failed: %v", err)
		log.Printf("[EMAIL ERROR] Error type: %T", err)
		log.Printf("[EMAIL ERROR] Full error details: %+v", err)
		
		// Log specific Gmail errors
		if s.smtpHost == "smtp.gmail.com" {
			log.Printf("[EMAIL ERROR] Gmail troubleshooting:")
			log.Printf("[EMAIL ERROR] 1. Verify 2FA is enabled on autoboyexpress@gmail.com")
			log.Printf("[EMAIL ERROR] 2. Verify app password is correct: %s", s.smtpPassword[:4]+"...")
			log.Printf("[EMAIL ERROR] 3. Check Gmail security settings")
			log.Printf("[EMAIL ERROR] 4. Verify account is not locked")
		}
		
		log.Printf("=== EMAIL SERVICE DEBUG END (FAILED) ===")
		
		// Try Resend as fallback
		resendKey := utils.GetEnv("RESEND_API_KEY", "")
		if resendKey != "" {
			log.Printf("[EMAIL] Gmail failed, trying Resend as fallback...")
			return s.sendWithResend(to, subject, body, resendKey)
		}
		
		return fmt.Errorf("email send failed: %v", err)
	}

	log.Printf("[EMAIL SUCCESS] ✅ Email sent successfully to %s", to)
	log.Printf("[EMAIL SUCCESS] Subject: %s", subject)
	log.Printf("=== EMAIL SERVICE DEBUG END (SUCCESS) ===")
	return nil
}

// SendVerificationEmail sends email verification email
func (s *EmailService) SendVerificationEmail(email, name, token string) error {
	log.Printf("[EMAIL] Preparing verification email for %s (name: %s)", email, name)
	verificationURL := fmt.Sprintf("%s/api/v1/auth/verify-email?token=%s", 
		utils.GetEnv("FRONTEND_URL", "http://localhost:3000"), token)
	log.Printf("[EMAIL] Verification URL: %s", verificationURL)

	template := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verify Your Email - AutoBoy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #22C55E; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #22C55E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to AutoBoy!</h1>
        </div>
        <div class="content">
            <h2>Hi %s,</h2>
            <p>Thank you for registering with AutoBoy, Nigeria's premier gadget trading platform!</p>
            <p>To complete your registration and start buying/selling gadgets, please verify your email address by clicking the button below:</p>
            <a href="%s" class="button">Verify Email Address</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="%s">%s</a></p>
            <p>This verification link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with AutoBoy, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 AutoBoy. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>`

	body := fmt.Sprintf(template, name, verificationURL, verificationURL, verificationURL)
	return s.SendEmail(email, "Verify Your AutoBoy Account", body)
}

// SendPasswordResetEmail sends password reset email
func (s *EmailService) SendPasswordResetEmail(email, name, token string) error {
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", 
		utils.GetEnv("FRONTEND_URL", "http://localhost:3000"), token)

	template := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reset Your Password - AutoBoy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #22C55E; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #22C55E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <h2>Hi %s,</h2>
            <p>We received a request to reset your AutoBoy account password.</p>
            <p>Click the button below to reset your password:</p>
            <a href="%s" class="button">Reset Password</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="%s">%s</a></p>
            <div class="warning">
                <strong>Security Notice:</strong>
                <ul>
                    <li>This link will expire in 1 hour for security reasons</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Your password will remain unchanged until you create a new one</li>
                </ul>
            </div>
        </div>
        <div class="footer">
            <p>&copy; 2024 AutoBoy. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>`

	body := fmt.Sprintf(template, name, resetURL, resetURL, resetURL)
	return s.SendEmail(email, "Reset Your AutoBoy Password", body)
}

// SendOrderConfirmationEmail sends order confirmation email
func (s *EmailService) SendOrderConfirmationEmail(email, name, orderNumber string, amount float64) error {
	template := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order Confirmation - AutoBoy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #22C55E; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmed!</h1>
        </div>
        <div class="content">
            <h2>Hi %s,</h2>
            <p>Thank you for your order! We've received your payment and are processing your order.</p>
            <div class="order-details">
                <h3>Order Details:</h3>
                <p><strong>Order Number:</strong> %s</p>
                <p><strong>Total Amount:</strong> %s</p>
                <p><strong>Status:</strong> Processing</p>
            </div>
            <p>You'll receive another email with tracking information once your order ships.</p>
            <p>You can track your order status anytime by logging into your AutoBoy account.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 AutoBoy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`

	body := fmt.Sprintf(template, name, orderNumber, utils.FormatCurrency(amount))
	return s.SendEmail(email, fmt.Sprintf("Order Confirmation - %s", orderNumber), body)
}

// SendWelcomeEmail sends welcome email to new users
func (s *EmailService) SendWelcomeEmail(email, name string) error {
	template := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to AutoBoy!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #22C55E; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .features { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to AutoBoy!</h1>
        </div>
        <div class="content">
            <h2>Hi %s,</h2>
            <p>Welcome to AutoBoy - Nigeria's premier platform for buying and selling gadgets!</p>
            <div class="features">
                <h3>What you can do on AutoBoy:</h3>
                <ul>
                    <li>🛒 Buy authentic gadgets from verified sellers</li>
                    <li>💰 Sell your gadgets to thousands of buyers</li>
                    <li>🔄 Swap gadgets with other users</li>
                    <li>💬 Chat directly with buyers and sellers</li>
                    <li>🛡️ Secure payments and escrow protection</li>
                    <li>📱 Mobile-friendly experience</li>
                </ul>
            </div>
            <p>Start exploring our marketplace and find amazing deals on phones, laptops, tablets, and more!</p>
            <p>If you have any questions, our support team is here to help.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 AutoBoy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`

	body := fmt.Sprintf(template, name)
	return s.SendEmail(email, "Welcome to AutoBoy - Start Trading Gadgets!", body)
}

// SendOrderStatusEmail sends order status update email
func (s *EmailService) SendOrderStatusEmail(email, name, orderNumber, status string) error {
	template := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order Update - AutoBoy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #22C55E; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Status Update</h1>
        </div>
        <div class="content">
            <h2>Hi %s,</h2>
            <p>Your order <strong>%s</strong> has been updated.</p>
            <p>New Status: <span class="status-badge" style="background: #22C55E; color: white;">%s</span></p>
            <p>You can track your order anytime by logging into your AutoBoy account.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 AutoBoy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`

	body := fmt.Sprintf(template, name, orderNumber, status)
	return s.SendEmail(email, fmt.Sprintf("Order Update - %s", orderNumber), body)
}

// SendDisputeNotificationEmail sends dispute notification email
func (s *EmailService) SendDisputeNotificationEmail(email, name, orderNumber, disputeReason string) error {
	template := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Dispute Notification - AutoBoy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Dispute Opened</h1>
        </div>
        <div class="content">
            <h2>Hi %s,</h2>
            <p>A dispute has been opened for order <strong>%s</strong>.</p>
            <p><strong>Reason:</strong> %s</p>
            <p>Our support team will review this dispute and contact you within 24 hours.</p>
            <p>You can view the dispute details in your AutoBoy account.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 AutoBoy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`

	body := fmt.Sprintf(template, name, orderNumber, disputeReason)
	return s.SendEmail(email, fmt.Sprintf("Dispute Opened - Order %s", orderNumber), body)
}

// SendSellerApplicationEmail sends seller application confirmation email
func (s *EmailService) SendSellerApplicationEmail(email, name string) error {
	template := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Seller Application - AutoBoy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #22C55E; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Seller Application Received</h1>
        </div>
        <div class="content">
            <h2>Hi %s,</h2>
            <p>Thank you for applying to become a seller on AutoBoy!</p>
            <p>We've received your application and our team will review it within 2-3 business days.</p>
            <p>Once approved, you'll be able to:</p>
            <ul>
                <li>List unlimited products</li>
                <li>Access seller analytics</li>
                <li>Manage orders and inventory</li>
                <li>Receive payments directly</li>
            </ul>
            <p>We'll notify you once your application is processed.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 AutoBoy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`

	body := fmt.Sprintf(template, name)
	return s.SendEmail(email, "Seller Application Received - AutoBoy", body)
}

// sendWithResend sends email using Resend API
func (s *EmailService) sendWithResend(to, subject, body, apiKey string) error {
	log.Printf("[RESEND] Attempting to send email via Resend API")
	log.Printf("[RESEND] Recipient: %s", to)
	log.Printf("[RESEND] Subject: %s", subject)
	
	// Resend API payload
	payload := map[string]interface{}{
		"from":    fmt.Sprintf("%s <%s>", s.fromName, s.fromEmail),
		"to":      []string{to},
		"subject": subject,
		"html":    body,
	}
	
	jsonData, err := json.Marshal(payload)
	if err != nil {
		log.Printf("[RESEND ERROR] Failed to marshal JSON: %v", err)
		return fmt.Errorf("failed to prepare email data: %v", err)
	}
	
	// Create HTTP request
	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("[RESEND ERROR] Failed to create request: %v", err)
		return fmt.Errorf("failed to create request: %v", err)
	}
	
	// Set headers
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")
	
	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[RESEND ERROR] HTTP request failed: %v", err)
		return fmt.Errorf("resend API request failed: %v", err)
	}
	defer resp.Body.Close()
	
	// Check response
	if resp.StatusCode != 200 {
		log.Printf("[RESEND ERROR] API returned status %d", resp.StatusCode)
		return fmt.Errorf("resend API failed with status %d", resp.StatusCode)
	}
	
	log.Printf("[RESEND SUCCESS] ✅ Email sent successfully via Resend to %s", to)
	return nil
}