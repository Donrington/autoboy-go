package middleware

import (
	"autoboy-backend/models"

	"github.com/gin-gonic/gin"
)

// SellerMiddleware ensures user is a seller
func SellerMiddleware() gin.HandlerFunc {
	return RequireUserType(models.UserTypeSeller)
}

// AdminMiddleware ensures user is an admin
func AdminMiddleware() gin.HandlerFunc {
	return RequireUserType(models.UserTypeAdmin)
}

// BuyerMiddleware ensures user is a buyer
func BuyerMiddleware() gin.HandlerFunc {
	return RequireUserType(models.UserTypeBuyer)
}