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
	notificationHandler := handlers.NewNotificationHandler()
	badgeHandler := handlers.NewBadgeHandler()
	walletHandler := handlers.NewWalletHandler()
	reportHandler := handlers.NewReportHandler()
	disputeHandler := handlers.NewDisputeHandler()
	chatHandler := handlers.NewChatHandler()
	alertHandler := handlers.NewAlertHandler()
	dealHandler := handlers.NewDealHandler()
	swapHandler := handlers.NewSwapHandler()
	analyticsHandler := handlers.NewAnalyticsHandler()
	sellerDashboardHandler := handlers.NewSellerDashboardHandler()
	searchHandler := handlers.NewSearchHandler()

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

			// Search routes
			public.GET("/search", searchHandler.SearchProducts)
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
				seller.GET("/dashboard", sellerDashboardHandler.GetSellerDashboard)

				// Seller analytics
				sellerAnalytics := seller.Group("/analytics")
				{
					sellerAnalytics.GET("/sales", sellerDashboardHandler.GetSellerSalesAnalytics)
					sellerAnalytics.GET("/products", sellerDashboardHandler.GetSellerProductAnalytics)
					sellerAnalytics.GET("/revenue", sellerDashboardHandler.GetSellerRevenueAnalytics)
				}

				// Seller profile
				seller.GET("/profile", sellerDashboardHandler.GetSellerProfile)
				seller.PUT("/profile", sellerDashboardHandler.UpdateSellerProfile)
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
				swap.GET("/", swapHandler.GetUserSwapDeals)
				swap.POST("/create", swapHandler.CreateSwapDeal)
				swap.GET("/:id", swapHandler.GetSwapDeal)
				swap.PUT("/:id/accept", swapHandler.AcceptSwapDeal)
				swap.PUT("/:id/reject", swapHandler.RejectSwapDeal)
			}

			// Analytics routes
			analytics := protected.Group("/analytics")
			{
				analytics.GET("/dashboard", analyticsHandler.GetDashboardAnalytics)
				analytics.GET("/sales", analyticsHandler.GetSalesAnalytics)
				analytics.GET("/products", analyticsHandler.GetProductAnalytics)
			}

			// Notifications routes
			notifications := protected.Group("/notifications")
			{
				notifications.GET("/", notificationHandler.GetNotifications)
				notifications.PUT("/:id/read", notificationHandler.MarkNotificationAsRead)
				notifications.DELETE("/:id", notificationHandler.DeleteNotification)
			}

			// Reports routes
			reports := protected.Group("/reports")
			{
				reports.POST("/product", reportHandler.ReportProduct)
				reports.POST("/user", reportHandler.ReportUser)
			}

			// Disputes routes
			disputes := protected.Group("/disputes")
			{
				disputes.GET("/", disputeHandler.GetDisputes)
				disputes.POST("/create", disputeHandler.CreateDispute)
				disputes.GET("/:id", disputeHandler.GetDispute)
			}

			// Wallet routes
			wallet := protected.Group("/wallet")
			{
				wallet.GET("/balance", walletHandler.GetWalletBalance)
				wallet.GET("/transactions", walletHandler.GetWalletTransactions)
				wallet.POST("/withdraw", walletHandler.RequestWithdrawal)
			}

			// User-specific routes
			userSpecific := protected.Group("/user")
			{
				userSpecific.GET("/badges", badgeHandler.GetUserBadges)
				userSpecific.GET("/rewards", badgeHandler.GetUserRewards)
				userSpecific.GET("/rewards/history", badgeHandler.GetRewardsHistory)
				userSpecific.GET("/alerts", alertHandler.GetUserAlerts)
				userSpecific.GET("/disputes", disputeHandler.GetDisputes)
			}

			// Badges routes
			badges := protected.Group("/badges")
			{
				badges.GET("/", badgeHandler.GetUserBadges)
				badges.GET("/available", badgeHandler.GetAvailableBadges)
			}

			// Alerts routes
			alerts := protected.Group("/alerts")
			{
				alerts.POST("/price", alertHandler.CreatePriceAlert)
			}

			// Deals routes
			deals := protected.Group("/deals")
			{
				deals.GET("/exclusive", dealHandler.GetExclusiveDeals)
			}

			// Chat routes
			conversations := protected.Group("/conversations")
			{
				conversations.GET("/", chatHandler.GetConversations)
				conversations.POST("/", chatHandler.CreateConversation)
				conversations.GET("/:id/messages", chatHandler.GetMessages)
			}

			messages := protected.Group("/messages")
			{
				messages.POST("/", chatHandler.SendMessage)
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