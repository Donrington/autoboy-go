package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// PaymentGateway represents supported payment gateways
type PaymentGateway string

const (
	PaymentGatewayPaystack    PaymentGateway = "paystack"
	PaymentGatewayFlutterwave PaymentGateway = "flutterwave"
	PaymentGatewayStripe      PaymentGateway = "stripe"
	PaymentGatewayBank        PaymentGateway = "bank_transfer"
	PaymentGatewayCrypto      PaymentGateway = "cryptocurrency"
	PaymentGatewayWallet      PaymentGateway = "wallet"
)

// PaymentMethod represents different payment methods
type PaymentMethod string

const (
	PaymentMethodCard         PaymentMethod = "card"
	PaymentMethodBankTransfer PaymentMethod = "bank_transfer"
	PaymentMethodUSSD         PaymentMethod = "ussd"
	PaymentMethodQR           PaymentMethod = "qr_code"
	PaymentMethodBankAccount  PaymentMethod = "bank_account"
	PaymentMethodMobileMoney  PaymentMethod = "mobile_money"
	PaymentMethodCrypto       PaymentMethod = "cryptocurrency"
	PaymentMethodWallet       PaymentMethod = "wallet"
)

// PaymentType represents the type of payment
type PaymentType string

const (
	PaymentTypeOrder           PaymentType = "order"
	PaymentTypePremium         PaymentType = "premium_membership"
	PaymentTypeEscrow          PaymentType = "escrow"
	PaymentTypeRefund          PaymentType = "refund"
	PaymentTypeWithdrawal      PaymentType = "withdrawal"
	PaymentTypeTopup           PaymentType = "wallet_topup"
	PaymentTypeCommission      PaymentType = "commission"
	PaymentTypePenalty         PaymentType = "penalty"
)

// Payment represents the main payment model
type Payment struct {
	ID                  primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PaymentNumber       string             `bson:"payment_number" json:"payment_number"`
	UserID              primitive.ObjectID `bson:"user_id" json:"user_id"`
	OrderID             *primitive.ObjectID `bson:"order_id,omitempty" json:"order_id,omitempty"`
	SwapDealID          *primitive.ObjectID `bson:"swap_deal_id,omitempty" json:"swap_deal_id,omitempty"`

	// Payment details
	Amount              float64            `bson:"amount" json:"amount"`
	Currency            string             `bson:"currency" json:"currency"`
	PaymentType         PaymentType        `bson:"payment_type" json:"payment_type"`
	PaymentMethod       PaymentMethod      `bson:"payment_method" json:"payment_method"`
	PaymentGateway      PaymentGateway     `bson:"payment_gateway" json:"payment_gateway"`

	// Gateway specific information
	GatewayPaymentID    string             `bson:"gateway_payment_id,omitempty" json:"gateway_payment_id,omitempty"`
	GatewayReference    string             `bson:"gateway_reference,omitempty" json:"gateway_reference,omitempty"`
	TransactionID       string             `bson:"transaction_id,omitempty" json:"transaction_id,omitempty"`

	// Status and processing
	Status              PaymentStatus      `bson:"status" json:"status"`
	FailureReason       string             `bson:"failure_reason,omitempty" json:"failure_reason,omitempty"`
	RetryCount          int                `bson:"retry_count" json:"retry_count"`
	MaxRetries          int                `bson:"max_retries" json:"max_retries"`

	// Payment method details
	PaymentDetails      PaymentDetails     `bson:"payment_details,omitempty" json:"payment_details,omitempty"`

	// Fees and charges
	GatewayFee          float64            `bson:"gateway_fee" json:"gateway_fee"`
	PlatformFee         float64            `bson:"platform_fee" json:"platform_fee"`
	NetAmount           float64            `bson:"net_amount" json:"net_amount"`

	// Verification and security
	IsVerified          bool               `bson:"is_verified" json:"is_verified"`
	VerificationCode    string             `bson:"verification_code,omitempty" json:"verification_code,omitempty"`
	SecurityHash        string             `bson:"security_hash,omitempty" json:"security_hash,omitempty"`

	// Customer information
	CustomerEmail       string             `bson:"customer_email" json:"customer_email"`
	CustomerPhone       string             `bson:"customer_phone" json:"customer_phone"`
	CustomerName        string             `bson:"customer_name" json:"customer_name"`

	// Billing information
	BillingAddress      Address            `bson:"billing_address,omitempty" json:"billing_address,omitempty"`

	// Metadata
	Metadata            map[string]interface{} `bson:"metadata,omitempty" json:"metadata,omitempty"`
	IPAddress           string             `bson:"ip_address" json:"ip_address"`
	UserAgent           string             `bson:"user_agent" json:"user_agent"`

	// Timestamps
	InitiatedAt         time.Time          `bson:"initiated_at" json:"initiated_at"`
	ConfirmedAt         *time.Time         `bson:"confirmed_at,omitempty" json:"confirmed_at,omitempty"`
	FailedAt            *time.Time         `bson:"failed_at,omitempty" json:"failed_at,omitempty"`
	CancelledAt         *time.Time         `bson:"cancelled_at,omitempty" json:"cancelled_at,omitempty"`
	RefundedAt          *time.Time         `bson:"refunded_at,omitempty" json:"refunded_at,omitempty"`

	// Webhook and notifications
	WebhookProcessed    bool               `bson:"webhook_processed" json:"webhook_processed"`
	NotificationSent    bool               `bson:"notification_sent" json:"notification_sent"`

	CreatedAt           time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt           time.Time          `bson:"updated_at" json:"updated_at"`
}

// PaymentDetails represents payment method specific details
type PaymentDetails struct {
	// Card payments
	CardLast4       string `bson:"card_last4,omitempty" json:"card_last4,omitempty"`
	CardBrand       string `bson:"card_brand,omitempty" json:"card_brand,omitempty"`
	CardExpiry      string `bson:"card_expiry,omitempty" json:"card_expiry,omitempty"`
	CardCountry     string `bson:"card_country,omitempty" json:"card_country,omitempty"`
	CardBank        string `bson:"card_bank,omitempty" json:"card_bank,omitempty"`

	// Bank transfer
	BankName        string `bson:"bank_name,omitempty" json:"bank_name,omitempty"`
	BankCode        string `bson:"bank_code,omitempty" json:"bank_code,omitempty"`
	AccountNumber   string `bson:"account_number,omitempty" json:"account_number,omitempty"`
	AccountName     string `bson:"account_name,omitempty" json:"account_name,omitempty"`

	// Mobile money
	MobileNetwork   string `bson:"mobile_network,omitempty" json:"mobile_network,omitempty"`
	MobileNumber    string `bson:"mobile_number,omitempty" json:"mobile_number,omitempty"`

	// Cryptocurrency
	CryptoType      string `bson:"crypto_type,omitempty" json:"crypto_type,omitempty"`
	CryptoAddress   string `bson:"crypto_address,omitempty" json:"crypto_address,omitempty"`
	BlockchainTxHash string `bson:"blockchain_tx_hash,omitempty" json:"blockchain_tx_hash,omitempty"`
	Confirmations   int    `bson:"confirmations,omitempty" json:"confirmations,omitempty"`

	// USSD
	USSDCode        string `bson:"ussd_code,omitempty" json:"ussd_code,omitempty"`
	USSDSession     string `bson:"ussd_session,omitempty" json:"ussd_session,omitempty"`
}

// Escrow represents escrow transactions
type Escrow struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	EscrowNumber    string             `bson:"escrow_number" json:"escrow_number"`
	PaymentID       primitive.ObjectID `bson:"payment_id" json:"payment_id"`
	OrderID         *primitive.ObjectID `bson:"order_id,omitempty" json:"order_id,omitempty"`
	SwapDealID      *primitive.ObjectID `bson:"swap_deal_id,omitempty" json:"swap_deal_id,omitempty"`

	// Parties involved
	PayerID         primitive.ObjectID `bson:"payer_id" json:"payer_id"`
	PayeeID         primitive.ObjectID `bson:"payee_id" json:"payee_id"`

	// Amount details
	Amount          float64            `bson:"amount" json:"amount"`
	Currency        string             `bson:"currency" json:"currency"`
	EscrowFee       float64            `bson:"escrow_fee" json:"escrow_fee"`
	NetAmount       float64            `bson:"net_amount" json:"net_amount"`

	// Status and conditions
	Status          EscrowStatus       `bson:"status" json:"status"`
	ReleaseConditions []string         `bson:"release_conditions" json:"release_conditions"`
	AutoReleaseDate *time.Time         `bson:"auto_release_date,omitempty" json:"auto_release_date,omitempty"`

	// Release information
	ReleasedBy      *primitive.ObjectID `bson:"released_by,omitempty" json:"released_by,omitempty"`
	ReleaseReason   string             `bson:"release_reason,omitempty" json:"release_reason,omitempty"`
	PartialReleases []PartialRelease   `bson:"partial_releases,omitempty" json:"partial_releases,omitempty"`

	// Dispute handling
	DisputeID       *primitive.ObjectID `bson:"dispute_id,omitempty" json:"dispute_id,omitempty"`
	IsDisputed      bool               `bson:"is_disputed" json:"is_disputed"`

	// Timestamps
	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
	ReleasedAt      *time.Time         `bson:"released_at,omitempty" json:"released_at,omitempty"`
	RefundedAt      *time.Time         `bson:"refunded_at,omitempty" json:"refunded_at,omitempty"`
}

// EscrowStatus represents the status of escrow funds
type EscrowStatus string

const (
	EscrowStatusHeld        EscrowStatus = "held"
	EscrowStatusReleased    EscrowStatus = "released"
	EscrowStatusRefunded    EscrowStatus = "refunded"
	EscrowStatusDisputed    EscrowStatus = "disputed"
	EscrowStatusCancelled   EscrowStatus = "cancelled"
	EscrowStatusExpired     EscrowStatus = "expired"
)

// PartialRelease represents partial escrow releases
type PartialRelease struct {
	Amount      float64            `bson:"amount" json:"amount"`
	Reason      string             `bson:"reason" json:"reason"`
	ReleasedBy  primitive.ObjectID `bson:"released_by" json:"released_by"`
	ReleasedAt  time.Time          `bson:"released_at" json:"released_at"`
}

// WalletTransaction represents wallet transactions
type WalletTransaction struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	TransactionNumber string           `bson:"transaction_number" json:"transaction_number"`
	UserID          primitive.ObjectID `bson:"user_id" json:"user_id"`
	WalletID        primitive.ObjectID `bson:"wallet_id" json:"wallet_id"`

	// Transaction details
	Type            WalletTransactionType `bson:"type" json:"type"`
	Amount          float64               `bson:"amount" json:"amount"`
	Currency        string                `bson:"currency" json:"currency"`
	BalanceBefore   float64               `bson:"balance_before" json:"balance_before"`
	BalanceAfter    float64               `bson:"balance_after" json:"balance_after"`

	// Reference information
	ReferenceType   string                `bson:"reference_type,omitempty" json:"reference_type,omitempty"`
	ReferenceID     *primitive.ObjectID   `bson:"reference_id,omitempty" json:"reference_id,omitempty"`
	PaymentID       *primitive.ObjectID   `bson:"payment_id,omitempty" json:"payment_id,omitempty"`

	// Description and metadata
	Description     string                `bson:"description" json:"description"`
	Metadata        map[string]interface{} `bson:"metadata,omitempty" json:"metadata,omitempty"`

	// Status
	Status          WalletTransactionStatus `bson:"status" json:"status"`
	FailureReason   string                  `bson:"failure_reason,omitempty" json:"failure_reason,omitempty"`

	CreatedAt       time.Time             `bson:"created_at" json:"created_at"`
	ProcessedAt     *time.Time            `bson:"processed_at,omitempty" json:"processed_at,omitempty"`
}

// WalletTransactionType represents types of wallet transactions
type WalletTransactionType string

const (
	WalletTransactionCredit      WalletTransactionType = "credit"
	WalletTransactionDebit       WalletTransactionType = "debit"
	WalletTransactionTopup       WalletTransactionType = "topup"
	WalletTransactionWithdrawal  WalletTransactionType = "withdrawal"
	WalletTransactionEscrow      WalletTransactionType = "escrow"
	WalletTransactionRefund      WalletTransactionType = "refund"
	WalletTransactionCommission  WalletTransactionType = "commission"
	WalletTransactionPenalty     WalletTransactionType = "penalty"
	WalletTransactionBonus       WalletTransactionType = "bonus"
)

// WalletTransactionStatus represents wallet transaction status
type WalletTransactionStatus string

const (
	WalletTransactionStatusPending   WalletTransactionStatus = "pending"
	WalletTransactionStatusCompleted WalletTransactionStatus = "completed"
	WalletTransactionStatusFailed    WalletTransactionStatus = "failed"
	WalletTransactionStatusCancelled WalletTransactionStatus = "cancelled"
)

// PaymentWebhook represents webhook events from payment gateways
type PaymentWebhook struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PaymentID       *primitive.ObjectID `bson:"payment_id,omitempty" json:"payment_id,omitempty"`
	Gateway         PaymentGateway     `bson:"gateway" json:"gateway"`
	Event           string             `bson:"event" json:"event"`
	EventID         string             `bson:"event_id" json:"event_id"`
	RawPayload      map[string]interface{} `bson:"raw_payload" json:"raw_payload"`
	ProcessedData   map[string]interface{} `bson:"processed_data,omitempty" json:"processed_data,omitempty"`
	Status          WebhookStatus      `bson:"status" json:"status"`
	ProcessedAt     *time.Time         `bson:"processed_at,omitempty" json:"processed_at,omitempty"`
	FailureReason   string             `bson:"failure_reason,omitempty" json:"failure_reason,omitempty"`
	RetryCount      int                `bson:"retry_count" json:"retry_count"`
	Headers         map[string]string  `bson:"headers,omitempty" json:"headers,omitempty"`
	IPAddress       string             `bson:"ip_address" json:"ip_address"`
	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
}

// WebhookStatus represents webhook processing status
type WebhookStatus string

const (
	WebhookStatusPending   WebhookStatus = "pending"
	WebhookStatusProcessed WebhookStatus = "processed"
	WebhookStatusFailed    WebhookStatus = "failed"
	WebhookStatusIgnored   WebhookStatus = "ignored"
)

// Refund represents refund transactions
type Refund struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	RefundNumber    string             `bson:"refund_number" json:"refund_number"`
	PaymentID       primitive.ObjectID `bson:"payment_id" json:"payment_id"`
	OrderID         *primitive.ObjectID `bson:"order_id,omitempty" json:"order_id,omitempty"`
	RequestedBy     primitive.ObjectID `bson:"requested_by" json:"requested_by"`

	// Refund details
	OriginalAmount  float64            `bson:"original_amount" json:"original_amount"`
	RefundAmount    float64            `bson:"refund_amount" json:"refund_amount"`
	Currency        string             `bson:"currency" json:"currency"`
	Reason          string             `bson:"reason" json:"reason"`
	Description     string             `bson:"description,omitempty" json:"description,omitempty"`

	// Processing information
	RefundMethod    PaymentMethod      `bson:"refund_method" json:"refund_method"`
	GatewayRefundID string             `bson:"gateway_refund_id,omitempty" json:"gateway_refund_id,omitempty"`
	Status          RefundStatus       `bson:"status" json:"status"`

	// Approval workflow
	RequiresApproval bool               `bson:"requires_approval" json:"requires_approval"`
	ApprovedBy      *primitive.ObjectID `bson:"approved_by,omitempty" json:"approved_by,omitempty"`
	ApprovedAt      *time.Time         `bson:"approved_at,omitempty" json:"approved_at,omitempty"`
	RejectedReason  string             `bson:"rejected_reason,omitempty" json:"rejected_reason,omitempty"`

	// Processing timestamps
	ProcessedAt     *time.Time         `bson:"processed_at,omitempty" json:"processed_at,omitempty"`
	CompletedAt     *time.Time         `bson:"completed_at,omitempty" json:"completed_at,omitempty"`
	FailedAt        *time.Time         `bson:"failed_at,omitempty" json:"failed_at,omitempty"`

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}

// RefundStatus represents refund status
type RefundStatus string

const (
	RefundStatusRequested  RefundStatus = "requested"
	RefundStatusApproved   RefundStatus = "approved"
	RefundStatusRejected   RefundStatus = "rejected"
	RefundStatusProcessing RefundStatus = "processing"
	RefundStatusCompleted  RefundStatus = "completed"
	RefundStatusFailed     RefundStatus = "failed"
	RefundStatusCancelled  RefundStatus = "cancelled"
)

// BankAccount represents user bank accounts for withdrawals
type BankAccount struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID         primitive.ObjectID `bson:"user_id" json:"user_id"`
	BankName       string             `bson:"bank_name" json:"bank_name"`
	BankCode       string             `bson:"bank_code" json:"bank_code"`
	AccountNumber  string             `bson:"account_number" json:"account_number"`
	AccountName    string             `bson:"account_name" json:"account_name"`
	AccountType    string             `bson:"account_type,omitempty" json:"account_type,omitempty"`
	Currency       string             `bson:"currency" json:"currency"`
	IsVerified     bool               `bson:"is_verified" json:"is_verified"`
	IsDefault      bool               `bson:"is_default" json:"is_default"`
	VerifiedAt     *time.Time         `bson:"verified_at,omitempty" json:"verified_at,omitempty"`
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time          `bson:"updated_at" json:"updated_at"`
}

// Withdrawal represents withdrawal requests
type Withdrawal struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	WithdrawalNumber string            `bson:"withdrawal_number" json:"withdrawal_number"`
	UserID          primitive.ObjectID `bson:"user_id" json:"user_id"`
	BankAccountID   primitive.ObjectID `bson:"bank_account_id" json:"bank_account_id"`

	// Amount details
	Amount          float64            `bson:"amount" json:"amount"`
	Currency        string             `bson:"currency" json:"currency"`
	Fee             float64            `bson:"fee" json:"fee"`
	NetAmount       float64            `bson:"net_amount" json:"net_amount"`

	// Status and processing
	Status          WithdrawalStatus   `bson:"status" json:"status"`
	ProcessingMethod string            `bson:"processing_method" json:"processing_method"`
	GatewayReference string            `bson:"gateway_reference,omitempty" json:"gateway_reference,omitempty"`

	// Approval workflow
	RequiresApproval bool              `bson:"requires_approval" json:"requires_approval"`
	ApprovedBy      *primitive.ObjectID `bson:"approved_by,omitempty" json:"approved_by,omitempty"`
	ApprovedAt      *time.Time         `bson:"approved_at,omitempty" json:"approved_at,omitempty"`
	RejectedReason  string             `bson:"rejected_reason,omitempty" json:"rejected_reason,omitempty"`

	// Processing information
	ProcessedAt     *time.Time         `bson:"processed_at,omitempty" json:"processed_at,omitempty"`
	CompletedAt     *time.Time         `bson:"completed_at,omitempty" json:"completed_at,omitempty"`
	FailedAt        *time.Time         `bson:"failed_at,omitempty" json:"failed_at,omitempty"`
	FailureReason   string             `bson:"failure_reason,omitempty" json:"failure_reason,omitempty"`

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}

// WithdrawalStatus represents withdrawal status
type WithdrawalStatus string

const (
	WithdrawalStatusRequested  WithdrawalStatus = "requested"
	WithdrawalStatusApproved   WithdrawalStatus = "approved"
	WithdrawalStatusRejected   WithdrawalStatus = "rejected"
	WithdrawalStatusProcessing WithdrawalStatus = "processing"
	WithdrawalStatusCompleted  WithdrawalStatus = "completed"
	WithdrawalStatusFailed     WithdrawalStatus = "failed"
	WithdrawalStatusCancelled  WithdrawalStatus = "cancelled"
)