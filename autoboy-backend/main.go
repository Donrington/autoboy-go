package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"autoboy-backend/config"
	"autoboy-backend/middleware"
	"autoboy-backend/routes"
	"autoboy-backend/services"
	"autoboy-backend/utils"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize logger
	utils.InitLogger()
	
	// Log environment variables for debugging (without sensitive data)
	log.Printf("=== ENVIRONMENT DEBUG ===")
	log.Printf("GIN_MODE: %s", os.Getenv("GIN_MODE"))
	log.Printf("PORT: %s", os.Getenv("PORT"))
	log.Printf("FRONTEND_URL: %s", os.Getenv("FRONTEND_URL"))
	log.Printf("SMTP_HOST: %s", os.Getenv("SMTP_HOST"))
	log.Printf("SMTP_PORT: %s", os.Getenv("SMTP_PORT"))
	log.Printf("SMTP_USERNAME: %s", os.Getenv("SMTP_USERNAME"))
	log.Printf("FROM_EMAIL: %s", os.Getenv("FROM_EMAIL"))
	log.Printf("SMTP_PASSWORD length: %d", len(os.Getenv("SMTP_PASSWORD")))
	log.Printf("=========================")

	// Initialize database
	if err := config.InitializeDatabase(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := config.DB.CloseDatabase(ctx); err != nil {
			log.Printf("Error closing database: %v", err)
		}
	}()

	// Initialize collections
	config.Coll = config.DB.InitializeCollections()

	// Set utils DB reference
	utils.SetDB(config.DB.Database)

	// Initialize services
	services.InitializeServices()

	// Initialize rate limiters
	middleware.InitializeRateLimiters()

	// Initialize Redis for caching and sessions
	if err := config.InitializeRedis(); err != nil {
		log.Printf("Warning: Redis initialization failed: %v", err)
	}

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	router := gin.New()

	// Add middleware
	setupMiddleware(router)

	// Setup routes
	routes.SetupRoutes(router)

	// Get port from environment
	port := utils.GetEnv("PORT", "8080")

	// Create HTTP server
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("🚀 AutoBoy API Server starting on port %s", port)
		log.Printf("🔍 Health Check: http://localhost:%s/health", port)
		
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("✅ Server exited gracefully")
}

// setupMiddleware configures all middleware for the application
func setupMiddleware(router *gin.Engine) {
	// Recovery middleware
	router.Use(gin.Recovery())

	// Custom logger middleware
	router.Use(middleware.Logger())

	// CORS middleware - MUST run FIRST before rate limiting to allow OPTIONS preflight
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://localhost:3003", // Vite dev server alternative port
			"http://localhost:5173",
			"http://localhost:5174",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:3003",
			"http://127.0.0.1:5173",
			"https://autoboy-go.vercel.app",  // ✅ Fixed: Added correct Vercel URL
			utils.GetEnv("FRONTEND_URL", "http://localhost:3000"),
		},
		AllowMethods: []string{
			"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS",
		},
		AllowHeaders: []string{
			"Origin", "Content-Type", "Accept", "Authorization",
			"X-Requested-With", "X-API-Key", "X-Device-ID",
			"X-CSRF-Token",
		},
		ExposeHeaders: []string{
			"Content-Length", "X-Total-Count", "X-Page-Count",
			"Content-Type",
		},
		AllowCredentials: true,
		MaxAge:          12 * time.Hour,
	}))

	// Security middleware
	router.Use(middleware.Security())

	// Rate limiting middleware (after CORS)
	router.Use(middleware.RateLimit())

	// Request ID middleware
	router.Use(middleware.RequestID())

	// Compression middleware
	router.Use(middleware.Compression())

	// API versioning middleware
	router.Use(middleware.APIVersion())
}