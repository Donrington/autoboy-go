package routes

import (
	"net/http"
	"time"

	"autoboy-backend/handlers"
	"autoboy-backend/middleware"
	"autoboy-backend/models"
	"autoboy-backend/services"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all application routes
func SetupRoutes(router *gin.Engine) {
	// Initialize WebSocket hub
	go services.WSHub.Run()

	// Initialize services
	emailService := services.NewEmailService()
	smsService := services.NewSMSService()
	imageService := services.NewImageService()
	paymentService := services.NewPaymentService()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(emailService, smsService)
	productHandler := handlers.NewProductHandler(imageService)
	userHandler := handlers.NewUserHandler(emailService, smsService)
	orderHandler := handlers.NewOrderHandler(paymentService, emailService)
	sellerHandler := handlers.NewSellerHandler(emailService)
	cartHandler := handlers.NewCartHandler()
	categoryHandler := handlers.NewCategoryHandler()

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		utils.SuccessResponse(c, http.StatusOK, "AutoBoy API is healthy", map[string]interface{}{
			"status":    "ok",
			"timestamp": time.Now(),
			"version":   "1.0.0",
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Public routes (no authentication required)
		public := v1.Group("/")
		{
			// Authentication routes with rate limiting
			auth := public.Group("/auth")
			auth.Use(middleware.AuthRateLimit())
			{
				auth.POST("/register", authHandler.Register)
				auth.POST("/login", authHandler.Login)
				auth.GET("/verify-email", authHandler.VerifyEmail)
				auth.POST("/forgot-password", authHandler.ForgotPassword)
				auth.POST("/reset-password", authHandler.ResetPassword)
				auth.POST("/resend-email-verification", authHandler.ResendEmailVerification)
			}

			// Public product routes
			products := public.Group("/products")
			products.Use(middleware.OptionalAuthMiddleware())
			{
				products.GET("/", productHandler.GetProducts)
				products.GET("/:id", productHandler.GetProduct)
			}

			// Public category routes
			categories := public.Group("/categories")
			{
				categories.GET("/", categoryHandler.GetCategories)
				categories.GET("/:id", categoryHandler.GetCategory)
			}
		}

		// Protected routes (authentication required)
		protected := v1.Group("/")
		protected.Use(middleware.AuthMiddleware())
		protected.Use(middleware.APIRateLimit())
		{
			// User routes
			user := protected.Group("/user")
			{
				user.GET("/profile", userHandler.GetProfile)
				user.PUT("/profile", userHandler.UpdateProfile)
				user.POST("/verify-phone", authHandler.VerifyPhone)
				user.POST("/resend-phone-otp", authHandler.ResendPhoneOTP)
				user.POST("/change-password", userHandler.ChangePassword)
				user.POST("/logout", authHandler.Logout)

				// User addresses
				addresses := user.Group("/addresses")
				{
					addresses.GET("/", userHandler.GetAddresses)
					addresses.POST("/", userHandler.CreateAddress)
					addresses.PUT("/:id", userHandler.UpdateAddress)
					addresses.DELETE("/:id", userHandler.DeleteAddress)
				}

				// User orders
				orders := user.Group("/orders")
				{
					orders.GET("/", orderHandler.GetUserOrders)
					orders.GET("/:id", orderHandler.GetOrder)
					orders.POST("/:id/cancel", orderHandler.CancelOrder)
				}

				// User wishlist
				wishlist := user.Group("/wishlist")
				{
					wishlist.GET("/", userHandler.GetWishlist)
					wishlist.POST("/", userHandler.AddToWishlist)
					wishlist.DELETE("/:id", userHandler.RemoveFromWishlist)
				}

				// Seller application
				user.POST("/apply-seller", sellerHandler.ApplyToBecomeseller)
			}

			// Seller routes
			seller := protected.Group("/seller")
			seller.Use(middleware.RequireUserType(models.UserTypeSeller))
			{
				// Seller products
				products := seller.Group("/products")
				{
					products.GET("/", productHandler.GetProducts)
					products.POST("/", productHandler.CreateProduct)
					products.GET("/:id", productHandler.GetProduct)
					products.PUT("/:id", productHandler.UpdateProduct)
					products.DELETE("/:id", productHandler.DeleteProduct)
				}

				// Seller orders
				orders := seller.Group("/orders")
				{
					orders.GET("/", orderHandler.GetSellerOrders)
					orders.GET("/:id", orderHandler.GetSellerOrder)
					orders.PUT("/:id/status", orderHandler.UpdateOrderStatus)
				}

				// Seller dashboard
				seller.GET("/dashboard", func(c *gin.Context) {
					utils.SuccessResponse(c, 200, "Seller dashboard data", map[string]interface{}{
						"total_products": 0,
						"total_orders": 0,
						"total_revenue": 0,
						"pending_orders": 0,
						"recent_orders": []interface{}{},
						"top_products": []interface{}{},
					})
				})

				// Seller analytics
				sellerAnalytics := seller.Group("/analytics")
				{
					sellerAnalytics.GET("/sales", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Sales data", []interface{}{}) })
					sellerAnalytics.GET("/products", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Product performance", []interface{}{}) })
					sellerAnalytics.GET("/revenue", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Revenue data", []interface{}{}) })
				}

				// Seller profile
				seller.GET("/profile", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Seller profile", nil) })
				seller.PUT("/profile", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Profile updated", nil) })
			}

			// Order routes
			orders := protected.Group("/orders")
			{
				orders.POST("/", orderHandler.CreateOrder)
				orders.GET("/:id/track", orderHandler.TrackOrder)
			}

			// Cart routes
			cart := protected.Group("/cart")
			{
				cart.GET("/", cartHandler.GetCart)
				cart.POST("/add", cartHandler.AddToCart)
				cart.PUT("/update", cartHandler.UpdateCartItem)
				cart.DELETE("/remove/:id", cartHandler.RemoveFromCart)
				cart.DELETE("/clear", cartHandler.ClearCart)
			}

			// Swap deals routes
			swap := protected.Group("/swap")
			{
				swap.GET("/", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Swap deals", []interface{}{}) })
				swap.POST("/create", func(c *gin.Context) { utils.SuccessResponse(c, 201, "Swap deal created", nil) })
				swap.GET("/:id", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Swap deal details", nil) })
				swap.PUT("/:id/accept", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Swap deal accepted", nil) })
				swap.PUT("/:id/reject", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Swap deal rejected", nil) })
			}

			// Analytics routes
			analytics := protected.Group("/analytics")
			{
				analytics.GET("/dashboard", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Analytics data", map[string]interface{}{"sales": 0, "orders": 0, "revenue": 0}) })
				analytics.GET("/sales", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Sales analytics", []interface{}{}) })
				analytics.GET("/products", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Product analytics", []interface{}{}) })
			}

			// Notifications routes
			notifications := protected.Group("/notifications")
			{
				notifications.GET("/", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Notifications", []interface{}{}) })
				notifications.PUT("/:id/read", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Notification marked as read", nil) })
				notifications.DELETE("/:id", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Notification deleted", nil) })
			}

			// Reports routes
			reports := protected.Group("/reports")
			{
				reports.POST("/product", func(c *gin.Context) { utils.SuccessResponse(c, 201, "Product reported", nil) })
				reports.POST("/user", func(c *gin.Context) { utils.SuccessResponse(c, 201, "User reported", nil) })
				reports.GET("/", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Reports", []interface{}{}) })
			}

			// Disputes routes
			disputes := protected.Group("/disputes")
			{
				disputes.GET("/", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Disputes", []interface{}{}) })
				disputes.POST("/create", func(c *gin.Context) { utils.SuccessResponse(c, 201, "Dispute created", nil) })
				disputes.GET("/:id", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Dispute details", nil) })
			}

			// Wallet routes
			wallet := protected.Group("/wallet")
			{
				wallet.GET("/balance", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Wallet balance", map[string]interface{}{"balance": 0}) })
				wallet.GET("/transactions", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Transactions", []interface{}{}) })
				wallet.POST("/withdraw", func(c *gin.Context) { utils.SuccessResponse(c, 201, "Withdrawal requested", nil) })
			}

			// Badges routes
			badges := protected.Group("/badges")
			{
				badges.GET("/", func(c *gin.Context) { utils.SuccessResponse(c, 200, "User badges", []interface{}{}) })
				badges.GET("/available", func(c *gin.Context) { utils.SuccessResponse(c, 200, "Available badges", []interface{}{}) })
			}

			// WebSocket routes
			ws := protected.Group("/ws")
			{
				ws.GET("/connect", handlers.WebSocketHandler)
				ws.GET("/online", handlers.GetOnlineUsers)
			}

			// Admin WebSocket routes
			admin := protected.Group("/admin")
			admin.Use(middleware.RequireUserType(models.UserTypeAdmin))
			{
				admin.POST("/broadcast", handlers.BroadcastNotification)
			}
		}
	}

	// 404 handler
	router.NoRoute(func(c *gin.Context) {
		utils.NotFoundResponse(c, "Endpoint not found")
	})
}