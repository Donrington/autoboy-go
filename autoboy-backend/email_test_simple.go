package main

import (
	"fmt"
	"log"
	"os"

	"autoboy-backend/services"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Create email service
	emailService := services.NewEmailService()

	// Check configuration
	fmt.Printf("Email Service Configuration:\n")
	fmt.Printf("SMTP Host: %s\n", os.Getenv("SMTP_HOST"))
	fmt.Printf("SMTP Port: %s\n", os.Getenv("SMTP_PORT"))
	fmt.Printf("SMTP Username: %s\n", os.Getenv("SMTP_USERNAME"))
	fmt.Printf("From Email: %s\n", os.Getenv("FROM_EMAIL"))
	fmt.Printf("Password Length: %d\n", len(os.Getenv("SMTP_PASSWORD")))

	// Test verification email
	fmt.Println("\nSending verification email to cotexjenifer@gmail.com...")
	err = emailService.SendVerificationEmail("cotexjenifer@gmail.com", "Jennifer Cotex", "test-verification-token-123")
	if err != nil {
		fmt.Printf("❌ Verification email failed: %v\n", err)
	} else {
		fmt.Println("✅ Verification email sent successfully!")
	}

	// Test welcome email
	fmt.Println("\nSending welcome email to cotexjenifer@gmail.com...")
	err = emailService.SendWelcomeEmail("cotexjenifer@gmail.com", "Jennifer Cotex")
	if err != nil {
		fmt.Printf("❌ Welcome email failed: %v\n", err)
	} else {
		fmt.Println("✅ Welcome email sent successfully!")
	}

	// Test password reset email
	fmt.Println("\nSending password reset email to cotexjenifer@gmail.com...")
	err = emailService.SendPasswordResetEmail("cotexjenifer@gmail.com", "Jennifer Cotex", "test-reset-token-456")
	if err != nil {
		fmt.Printf("❌ Password reset email failed: %v\n", err)
	} else {
		fmt.Println("✅ Password reset email sent successfully!")
	}

	fmt.Println("\n🎉 All email tests completed! Check cotexjenifer@gmail.com inbox.")
}