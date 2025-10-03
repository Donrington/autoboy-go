package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"os"

	"autoboy-backend/config"
	"autoboy-backend/handlers"
	"autoboy-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Initialize database
	if err := config.InitializeDatabase(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize collections
	config.Coll = config.DB.InitializeCollections()

	// Create email service
	emailService := services.NewEmailService()
	smsService := services.NewSMSService()

	// Create auth handler
	authHandler := handlers.NewAuthHandler(emailService, smsService)

	// Create Gin router
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/register", authHandler.Register)

	// Test registration request
	registrationData := map[string]interface{}{
		"username":     "testuser123",
		"email":        "cotexjenifer@gmail.com",
		"password":     "TestPass123!",
		"phone":        "08012345678",
		"first_name":   "Jennifer",
		"last_name":    "Cotex",
		"user_type":    "buyer",
		"accept_terms": true,
	}

	jsonData, _ := json.Marshal(registrationData)
	req, _ := http.NewRequest("POST", "/register", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	w := httptest.NewRecorder()

	// Perform request
	fmt.Println("Testing user registration with email notification...")
	router.ServeHTTP(w, req)

	// Check response
	fmt.Printf("Status Code: %d\n", w.Code)
	fmt.Printf("Response Body: %s\n", w.Body.String())

	// Check if email service is properly configured
	fmt.Printf("\nEmail Service Configuration:\n")
	fmt.Printf("SMTP Host: %s\n", os.Getenv("SMTP_HOST"))
	fmt.Printf("SMTP Port: %s\n", os.Getenv("SMTP_PORT"))
	fmt.Printf("SMTP Username: %s\n", os.Getenv("SMTP_USERNAME"))
	fmt.Printf("From Email: %s\n", os.Getenv("FROM_EMAIL"))
	fmt.Printf("Password Length: %d\n", len(os.Getenv("SMTP_PASSWORD")))

	// Test direct email sending
	fmt.Println("\nTesting direct email sending...")
	err = emailService.SendVerificationEmail("cotexjenifer@gmail.com", "Jennifer Cotex", "test-token-123")
	if err != nil {
		fmt.Printf("Direct email test failed: %v\n", err)
	} else {
		fmt.Println("Direct email test successful!")
	}
}