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
	buyerDashboardHandler := handlers.NewBuyerDashboardHandler()
	reviewHandler := handlers.NewReviewHandler()
	searchHandler := handlers.NewSearchHandler()
	adminHandler := handlers.NewAdminHandler()
	subscriptionHandler := handlers.NewSubscriptionHandler()
	paystackHandler := handlers.NewPaystackHandler()
	wishlistHandler := handlers.NewWishlistHandler()
	followHandler := handlers.NewFollowHandler()
	activityHandler := handlers.NewActivityHandler()
	savedSearchHandler := handlers.NewSavedSearchHandler()
	questionHandler := handlers.NewQuestionHandler()
	trackingHandler := handlers.NewTrackingHandler()
	priceAlertHandler := handlers.NewPriceAlertHandler()
	systemHandler := handlers.NewSystemHandler()

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
				auth.POST("/resend-verification", authHandler.ResendEmailVerification)
			}

			// Public product routes
			products := public.Group("/products")
			products.Use(middleware.OptionalAuthMiddleware())
			{
				products.GET("/", productHandler.GetProducts)
				products.GET("/:id", productHandler.GetProduct)
				products.GET("/:id/reviews", reviewHandler.GetProductReviews)
				products.GET("/:id/questions", questionHandler.GetProductQuestions)
			}

			// Public category routes
			categories := public.Group("/categories")
			{
				categories.GET("/", categoryHandler.GetCategories)
				categories.GET("/:id", categoryHandler.GetCategory)
			}

			// Search routes
			public.GET("/search", searchHandler.SearchProducts)
			public.POST("/search/advanced", searchHandler.AdvancedSearch)
			public.GET("/search/suggestions", searchHandler.GetSearchSuggestions)

			// Order tracking (public with order number)
			public.GET("/orders/:id/track", trackingHandler.GetOrderTracking)
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
				user.DELETE("/account", userHandler.DeleteAccount)

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
					orders.POST("/:id/return", orderHandler.RequestReturn)
					orders.POST("/:id/refund", orderHandler.RequestRefund)
				}

				// User notifications
				user.GET("/notifications", userHandler.GetNotifications)
				user.PUT("/notifications/:id/read", userHandler.MarkNotificationRead)
				user.PUT("/notifications/read-all", userHandler.MarkAllNotificationsRead)

				// User activity
				user.GET("/activity", activityHandler.GetUserActivity)

				// Premium features
				user.GET("/premium/status", userHandler.GetPremiumStatus)
				user.GET("/premium/analytics", userHandler.GetPremiumAnalytics)

				// Seller application
				user.POST("/apply-seller", sellerHandler.ApplyToBecomeseller)
			}

			// Wishlist routes
			wishlist := protected.Group("/wishlist")
			{
				wishlist.GET("/", wishlistHandler.GetWishlist)
				wishlist.POST("/", wishlistHandler.AddToWishlist)
				wishlist.DELETE("/:id", wishlistHandler.RemoveFromWishlist)
			}

			// Follow routes
			follow := protected.Group("/follow")
			{
				follow.POST("/:id", followHandler.FollowUser)
				follow.DELETE("/:id", followHandler.UnfollowUser)
				follow.GET("/followers", followHandler.GetFollowers)
				follow.GET("/following", followHandler.GetFollowing)
			}

			// Saved searches routes
			searches := protected.Group("/saved-searches")
			{
				searches.GET("/", savedSearchHandler.GetSavedSearches)
				searches.POST("/", savedSearchHandler.CreateSavedSearch)
				searches.DELETE("/:id", savedSearchHandler.DeleteSavedSearch)
			}

			// Price alerts routes
			alerts := protected.Group("/price-alerts")
			{
				alerts.GET("/", priceAlertHandler.GetPriceAlerts)
				alerts.POST("/", priceAlertHandler.CreatePriceAlert)
				alerts.DELETE("/:id", priceAlertHandler.DeletePriceAlert)
			}

			// Cart routes
			cart := protected.Group("/cart")
			{
				cart.GET("/", cartHandler.GetCart)
				cart.POST("/add", cartHandler.AddToCart)
				cart.PUT("/update", cartHandler.UpdateCartItem)
				cart.DELETE("/remove/:id", cartHandler.RemoveFromCart)
				cart.DELETE("/clear", cartHandler.ClearCart)
				cart.POST("/save-later/:id", cartHandler.SaveForLater)
				cart.GET("/saved-items", cartHandler.GetSavedItems)
				cart.POST("/move-to-cart/:id", cartHandler.MoveToCart)
				cart.GET("/validate", cartHandler.ValidateCart)
				cart.POST("/promo", cartHandler.ApplyPromoCode)
			}

			// Order routes
			orders := protected.Group("/orders")
			{
				orders.POST("/", orderHandler.CreateOrder)
			}

			// Review routes
			reviews := protected.Group("/reviews")
			{
				reviews.POST("/", reviewHandler.CreateReview)
				reviews.GET("/my-reviews", reviewHandler.GetUserReviews)
			}

			// Question routes
			questions := protected.Group("/questions")
			{
				questions.POST("/", questionHandler.CreateQuestion)
				questions.PUT("/:id/answer", questionHandler.AnswerQuestion)
			}

			// Subscription routes
			subscription := protected.Group("/subscription")
			{
				subscription.GET("/plans", subscriptionHandler.GetSubscriptionPlans)
				subscription.GET("/features", subscriptionHandler.GetPremiumFeatures)
				subscription.GET("/status", subscriptionHandler.GetSubscriptionStatus)
				subscription.POST("/create", subscriptionHandler.CreateSubscription)
				subscription.POST("/subscribe", subscriptionHandler.Subscribe)
				subscription.POST("/cancel", subscriptionHandler.CancelSubscription)
				subscription.POST("/upgrade", subscriptionHandler.UpgradeSubscription)
				subscription.GET("/billing-history", subscriptionHandler.GetBillingHistory)
			}

			// Analytics routes (Premium only)
			analytics := protected.Group("/analytics")
			{
				analytics.GET("/seller", analyticsHandler.GetSellerAnalytics)
				analytics.GET("/buyer", analyticsHandler.GetBuyerAnalytics)
				analytics.GET("/dashboard", analyticsHandler.GetDashboardAnalytics)
				analytics.GET("/sales", analyticsHandler.GetSalesAnalytics)
			}

			// Seller routes
			seller := protected.Group("/seller")
			seller.Use(middleware.RequireUserType(models.UserTypeSeller))
			{
				// Seller products
				products := seller.Group("/products")
				{
					products.GET("/", sellerHandler.GetProducts)
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
					orders.POST("/:id/ship", orderHandler.ShipOrder)
				}

				// Seller tracking
				seller.POST("/tracking", trackingHandler.AddTrackingEvent)

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

			// Admin routes
			admin := protected.Group("/admin")
			admin.Use(middleware.RequireUserType(models.UserTypeAdmin))
			{
				// Admin user management
				admin.GET("/users", adminHandler.GetUsers)
				admin.GET("/users/:id", adminHandler.GetUser)
				admin.PUT("/users/:id/status", adminHandler.UpdateUserStatus)

				// Admin product management
				admin.GET("/products", adminHandler.GetAllProducts)
				admin.PUT("/products/:id/approve", adminHandler.ApproveProduct)
				admin.PUT("/products/:id/reject", adminHandler.RejectProduct)

				// Admin order management
				admin.GET("/orders", orderHandler.GetAllTransactions)
				admin.GET("/orders/:id", adminHandler.GetOrder)

				// Admin analytics
				admin.GET("/analytics", adminHandler.GetSystemAnalytics)
				admin.GET("/dashboard", adminHandler.GetAdminDashboard)

				// System management endpoints
				admin.POST("/system/init-database", systemHandler.InitializeDatabase)
				admin.GET("/system/test-endpoints", systemHandler.TestEndpoints)
				admin.GET("/system/status", systemHandler.GetSystemStatus)
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

			// Notifications routes
			notifications := protected.Group("/notifications")
			{
				notifications.GET("/", notificationHandler.GetNotifications)
				notifications.PUT("/:id/read", notificationHandler.MarkNotificationAsRead)
				notifications.DELETE("/:id", notificationHandler.DeleteNotification)
				notifications.POST("/preferences", notificationHandler.UpdateNotificationPreferences)
				notifications.GET("/preferences", notificationHandler.GetNotificationPreferences)
				notifications.POST("/send", notificationHandler.SendNotification)
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

			// Buyer dashboard routes
			buyer := protected.Group("/buyer")
			buyer.Use(middleware.RequireUserType(models.UserTypeBuyer))
			{
				buyer.GET("/dashboard", buyerDashboardHandler.GetBuyerDashboard)
				buyer.GET("/recent-activity", buyerDashboardHandler.GetBuyerRecentActivity)
			}

			// Badges routes
			badges := protected.Group("/badges")
			{
				badges.GET("/", badgeHandler.GetUserBadges)
				badges.GET("/available", badgeHandler.GetAvailableBadges)
			}

			// Deals routes
			deals := protected.Group("/deals")
			{
				deals.GET("/exclusive", dealHandler.GetExclusiveDeals)
				deals.GET("/priority-listings", dealHandler.GetPriorityListings)
				deals.GET("/flash-deals", dealHandler.GetFlashDeals)
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

			// Payment routes
			payment := protected.Group("/payment")
			{
				payment.POST("/initialize", paystackHandler.InitializePayment)
				payment.GET("/verify/:reference", paystackHandler.VerifyPayment)
				payment.POST("/refund", paystackHandler.ProcessRefund)
				payment.POST("/dispute", paystackHandler.HandlePaymentDispute)
				payment.POST("/webhook", paystackHandler.HandleWebhook)
			}
		}
	}

	// 404 handler
	router.NoRoute(func(c *gin.Context) {
		utils.NotFoundResponse(c, "Endpoint not found")
	})
}