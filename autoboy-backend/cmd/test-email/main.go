package main

import (
	"log"

	"autoboy-backend/services"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	emailService := services.NewEmailService()
	
	err := emailService.SendEmail(
		"test@example.com", // Replace with your test email
		"AutoBoy Test Email",
		"<h1>Hello from AutoBoy!</h1><p>Email service is working correctly.</p>",
	)

	if err != nil {
		log.Printf("❌ Email failed: %v", err)
	} else {
		log.Println("✅ Email sent successfully!")
	}
}