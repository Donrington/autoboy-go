package middleware

import (
	"net/http"
	"sync"
	"time"

	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
)

// RateLimiter represents a rate limiter
type RateLimiter struct {
	requests map[string][]time.Time
	mutex    sync.RWMutex
	limit    int
	window   time.Duration
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
	
	// Clean up old entries periodically
	go rl.cleanup()
	
	return rl
}

// Allow checks if request is allowed
func (rl *RateLimiter) Allow(key string) bool {
	rl.mutex.Lock()
	defer rl.mutex.Unlock()
	
	now := time.Now()
	windowStart := now.Add(-rl.window)
	
	// Get existing requests for this key
	requests := rl.requests[key]
	
	// Filter out old requests
	var validRequests []time.Time
	for _, req := range requests {
		if req.After(windowStart) {
			validRequests = append(validRequests, req)
		}
	}
	
	// Check if limit exceeded
	if len(validRequests) >= rl.limit {
		rl.requests[key] = validRequests
		return false
	}
	
	// Add current request
	validRequests = append(validRequests, now)
	rl.requests[key] = validRequests
	
	return true
}

// cleanup removes old entries
func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	
	for range ticker.C {
		rl.mutex.Lock()
		now := time.Now()
		windowStart := now.Add(-rl.window)
		
		for key, requests := range rl.requests {
			var validRequests []time.Time
			for _, req := range requests {
				if req.After(windowStart) {
					validRequests = append(validRequests, req)
				}
			}
			
			if len(validRequests) == 0 {
				delete(rl.requests, key)
			} else {
				rl.requests[key] = validRequests
			}
		}
		rl.mutex.Unlock()
	}
}

var (
	// Global rate limiter - 100 requests per minute per IP
	globalLimiter = NewRateLimiter(100, time.Minute)
	
	// Auth rate limiter - 5 login attempts per minute per IP
	authLimiter = NewRateLimiter(5, time.Minute)
	
	// API rate limiter - 1000 requests per hour per user
	apiLimiter = NewRateLimiter(1000, time.Hour)
)

// RateLimit middleware for general rate limiting
func RateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		
		if !globalLimiter.Allow(clientIP) {
			utils.ErrorResponse(c, http.StatusTooManyRequests, "Rate limit exceeded", nil)
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// AuthRateLimit middleware for authentication endpoints
func AuthRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		
		if !authLimiter.Allow(clientIP) {
			utils.ErrorResponse(c, http.StatusTooManyRequests, "Too many authentication attempts", nil)
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// APIRateLimit middleware for authenticated API endpoints
func APIRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			// Fall back to IP-based limiting for unauthenticated requests
			clientIP := c.ClientIP()
			if !globalLimiter.Allow(clientIP) {
				utils.ErrorResponse(c, http.StatusTooManyRequests, "Rate limit exceeded", nil)
				c.Abort()
				return
			}
		} else {
			// User-based rate limiting
			if !apiLimiter.Allow(userID.(string)) {
				utils.ErrorResponse(c, http.StatusTooManyRequests, "API rate limit exceeded", nil)
				c.Abort()
				return
			}
		}
		
		c.Next()
	}
}