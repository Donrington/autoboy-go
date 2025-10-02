package services

import (
	"log"
)

// Services holds all application services
type Services struct {
	Email    *EmailService
	SMS      *SMSService
	Image    *ImageService
	Payment  *PaymentService
	Cache    *CacheService
	Search   *SearchService
	Analytics *AnalyticsService
}

var AppServices *Services

// InitializeServices initializes all application services
func InitializeServices() {
	log.Println("Initializing application services...")

	AppServices = &Services{
		Email:     NewEmailService(),
		SMS:       NewSMSService(),
		Image:     NewImageService(),
		Payment:   NewPaymentService(),
		Cache:     NewCacheService(),
		Search:    NewSearchService(),
		Analytics: NewAnalyticsService(),
	}

	log.Println("All services initialized successfully")
}

// GetServices returns the global services instance
func GetServices() *Services {
	if AppServices == nil {
		InitializeServices()
	}
	return AppServices
}