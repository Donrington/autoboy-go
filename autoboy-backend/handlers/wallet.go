package handlers

import (
	"net/http"

	"autoboy-backend/models"
	"autoboy-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type WalletHandler struct{}

func NewWalletHandler() *WalletHandler {
	return &WalletHandler{}
}

// GetWalletBalance gets user's wallet balance
func (h *WalletHandler) GetWalletBalance(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var wallet models.Wallet
	err := utils.DB.Collection("wallets").FindOne(c, bson.M{"user_id": userObjID}).Decode(&wallet)
	if err != nil {
		// Create wallet if doesn't exist
		wallet = models.Wallet{
			ID:      primitive.NewObjectID(),
			UserID:  userObjID,
			Balance: 0,
		}
		utils.DB.Collection("wallets").InsertOne(c, wallet)
	}

	utils.SuccessResponse(c, http.StatusOK, "Wallet balance retrieved", gin.H{
		"balance": wallet.Balance,
		"currency": "NGN",
	})
}

// GetWalletTransactions gets user's wallet transaction history
func (h *WalletHandler) GetWalletTransactions(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var transactions []models.WalletTransaction
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(50)
	
	cursor, err := utils.DB.Collection("wallet_transactions").Find(c, bson.M{"user_id": userObjID}, opts)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch transactions", err.Error())
		return
	}
	defer cursor.Close(c)

	if err = cursor.All(c, &transactions); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to decode transactions", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Transactions retrieved successfully", gin.H{
		"transactions": transactions,
	})
}

// RequestWithdrawal creates a withdrawal request
func (h *WalletHandler) RequestWithdrawal(c *gin.Context) {
	userID := c.GetString("user_id")
	userObjID, _ := primitive.ObjectIDFromHex(userID)

	var req struct {
		Amount      float64 `json:"amount" binding:"required,min=1000"`
		BankAccount string  `json:"bank_account" binding:"required"`
		BankName    string  `json:"bank_name" binding:"required"`
		AccountName string  `json:"account_name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err.Error())
		return
	}

	// Check wallet balance
	var wallet models.Wallet
	err := utils.DB.Collection("wallets").FindOne(c, bson.M{"user_id": userObjID}).Decode(&wallet)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Wallet not found", err.Error())
		return
	}

	if wallet.Balance < req.Amount {
		utils.ErrorResponse(c, http.StatusBadRequest, "Insufficient balance", "")
		return
	}

	// Create withdrawal request
	withdrawal := models.WithdrawalRequest{
		ID:          primitive.NewObjectID(),
		UserID:      userObjID,
		Amount:      req.Amount,
		BankAccount: req.BankAccount,
		BankName:    req.BankName,
		AccountName: req.AccountName,
		Status:      "pending",
		CreatedAt:   primitive.NewDateTimeFromTime(utils.GetCurrentTime()),
	}

	_, err = utils.DB.Collection("withdrawal_requests").InsertOne(c, withdrawal)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create withdrawal request", err.Error())
		return
	}

	// Update wallet balance (hold the amount)
	update := bson.M{"$inc": bson.M{"balance": -req.Amount, "held_balance": req.Amount}}
	utils.DB.Collection("wallets").UpdateOne(c, bson.M{"user_id": userObjID}, update)

	utils.SuccessResponse(c, http.StatusCreated, "Withdrawal request created successfully", gin.H{
		"withdrawal_id": withdrawal.ID,
		"status": "pending",
	})
}