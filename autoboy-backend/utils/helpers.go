package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"math"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// GetEnv gets environment variable with fallback
func GetEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// GetEnvAsInt gets environment variable as integer with fallback
func GetEnvAsInt(key string, fallback int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return fallback
}

// GetEnvAsBool gets environment variable as boolean with fallback
func GetEnvAsBool(key string, fallback bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolVal, err := strconv.ParseBool(value); err == nil {
			return boolVal
		}
	}
	return fallback
}

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash compares password with hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateRandomString generates a random string of specified length
func GenerateRandomString(length int) string {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return ""
	}
	return hex.EncodeToString(bytes)[:length]
}

// GenerateOTP generates a 6-digit OTP
func GenerateOTP() string {
	bytes := make([]byte, 3)
	if _, err := rand.Read(bytes); err != nil {
		return "123456" // fallback
	}
	
	otp := ""
	for _, b := range bytes {
		otp += fmt.Sprintf("%02d", int(b)%100)
	}
	
	return otp[:6]
}

// IsValidEmail validates email format
func IsValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// IsValidPhone validates phone number format (Nigerian format)
func IsValidPhone(phone string) bool {
	// Remove all non-digit characters
	digits := regexp.MustCompile(`\D`).ReplaceAllString(phone, "")
	
	// Check if it's a valid Nigerian number
	if len(digits) == 11 && strings.HasPrefix(digits, "0") {
		return true
	}
	if len(digits) == 13 && strings.HasPrefix(digits, "234") {
		return true
	}
	if len(digits) == 14 && strings.HasPrefix(digits, "+234") {
		return true
	}
	
	return false
}

// NormalizePhone normalizes phone number to international format
func NormalizePhone(phone string) string {
	// Remove all non-digit characters except +
	cleaned := regexp.MustCompile(`[^\d+]`).ReplaceAllString(phone, "")
	
	// Remove leading + if present
	if strings.HasPrefix(cleaned, "+") {
		cleaned = cleaned[1:]
	}
	
	// Convert to international format
	if strings.HasPrefix(cleaned, "0") && len(cleaned) == 11 {
		return "234" + cleaned[1:]
	}
	if strings.HasPrefix(cleaned, "234") && len(cleaned) == 13 {
		return cleaned
	}
	
	return cleaned
}

// IsValidPassword validates password strength
func IsValidPassword(password string) bool {
	if len(password) < 8 {
		return false
	}
	
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	hasNumber := regexp.MustCompile(`\d`).MatchString(password)
	hasSpecial := regexp.MustCompile(`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).MatchString(password)
	
	return hasUpper && hasLower && hasNumber && hasSpecial
}

// SanitizeString removes potentially harmful characters
func SanitizeString(input string) string {
	// Remove HTML tags
	htmlRegex := regexp.MustCompile(`<[^>]*>`)
	cleaned := htmlRegex.ReplaceAllString(input, "")
	
	// Remove script tags and content
	scriptRegex := regexp.MustCompile(`(?i)<script[^>]*>.*?</script>`)
	cleaned = scriptRegex.ReplaceAllString(cleaned, "")
	
	// Trim whitespace
	cleaned = strings.TrimSpace(cleaned)
	
	return cleaned
}

// TruncateString truncates string to specified length with ellipsis
func TruncateString(str string, length int) string {
	if len(str) <= length {
		return str
	}
	return str[:length-3] + "..."
}

// SlugifyString converts string to URL-friendly slug
func SlugifyString(str string) string {
	// Convert to lowercase
	slug := strings.ToLower(str)
	
	// Replace spaces and special characters with hyphens
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	slug = reg.ReplaceAllString(slug, "-")
	
	// Remove leading and trailing hyphens
	slug = strings.Trim(slug, "-")
	
	return slug
}

// CalculatePagination calculates pagination values
func CalculatePagination(page, limit int, total int64) (int, int, int, int) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	
	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	offset := (page - 1) * limit
	
	return page, limit, totalPages, offset
}

// FormatCurrency formats amount as Nigerian Naira
func FormatCurrency(amount float64) string {
	return fmt.Sprintf("₦%.2f", amount)
}

// ParseCurrency parses currency string to float64
func ParseCurrency(currency string) (float64, error) {
	// Remove currency symbol and commas
	cleaned := strings.ReplaceAll(currency, "₦", "")
	cleaned = strings.ReplaceAll(cleaned, ",", "")
	cleaned = strings.TrimSpace(cleaned)
	
	return strconv.ParseFloat(cleaned, 64)
}

// TimeAgo returns human-readable time difference
func TimeAgo(t time.Time) string {
	now := time.Now()
	diff := now.Sub(t)
	
	if diff < time.Minute {
		return "just now"
	}
	if diff < time.Hour {
		minutes := int(diff.Minutes())
		if minutes == 1 {
			return "1 minute ago"
		}
		return fmt.Sprintf("%d minutes ago", minutes)
	}
	if diff < 24*time.Hour {
		hours := int(diff.Hours())
		if hours == 1 {
			return "1 hour ago"
		}
		return fmt.Sprintf("%d hours ago", hours)
	}
	if diff < 30*24*time.Hour {
		days := int(diff.Hours() / 24)
		if days == 1 {
			return "1 day ago"
		}
		return fmt.Sprintf("%d days ago", days)
	}
	
	return t.Format("Jan 2, 2006")
}

// InitLogger initializes the application logger
func InitLogger() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	
	if GetEnv("GIN_MODE", "") == "release" {
		log.SetOutput(os.Stdout)
	}
}

// Contains checks if slice contains item
func Contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// RemoveDuplicates removes duplicate strings from slice
func RemoveDuplicates(slice []string) []string {
	keys := make(map[string]bool)
	result := []string{}
	
	for _, item := range slice {
		if !keys[item] {
			keys[item] = true
			result = append(result, item)
		}
	}
	
	return result
}

// GenerateOrderNumber generates a unique order number
func GenerateOrderNumber() string {
	timestamp := time.Now().Unix()
	random := GenerateRandomString(4)
	return fmt.Sprintf("ORD-%d-%s", timestamp, strings.ToUpper(random))
}

// GeneratePaymentNumber generates a unique payment number
func GeneratePaymentNumber() string {
	timestamp := time.Now().Unix()
	random := GenerateRandomString(4)
	return fmt.Sprintf("PAY-%d-%s", timestamp, strings.ToUpper(random))
}