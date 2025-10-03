package services

import (
	"fmt"
	"log"
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
		smtpPort:     utils.GetEnv("SMTP_PORT", "587"),
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
	if s.smtpUsername == "" || s.smtpPassword == "" {
		log.Printf("Email not sent to %s: SMTP credentials not configured", to)
		return nil // Don't fail in development
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
	log.Printf("Attempting to send email to %s via %s:%s", to, s.smtpHost, s.smtpPort)
	err := smtp.SendMail(s.smtpHost+":"+s.smtpPort, auth, s.fromEmail, []string{to}, msg)
	if err != nil {
		log.Printf("Failed to send email to %s: %v", to, err)
		
		// Log specific Gmail errors
		if s.smtpHost == "smtp.gmail.com" {
			log.Printf("Gmail SMTP Error - Check: 1) 2FA enabled 2) App password generated 3) Correct credentials")
		}
		
		return fmt.Errorf("email send failed: %v", err)
	}

	log.Printf("Email sent successfully to %s", to)
	return nil
}

// SendVerificationEmail sends email verification email
func (s *EmailService) SendVerificationEmail(email, name, token string) error {
	verificationURL := fmt.Sprintf("%s/api/v1/auth/verify-email?token=%s", 
		utils.GetEnv("FRONTEND_URL", "http://localhost:3000"), token)

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