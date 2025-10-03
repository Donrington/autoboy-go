package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// OrderStatus represents the status of an order
type OrderStatus string

const (
	OrderStatusPending     OrderStatus = "pending"
	OrderStatusConfirmed   OrderStatus = "confirmed"
	OrderStatusPaid        OrderStatus = "paid"
	OrderStatusProcessing  OrderStatus = "processing"
	OrderStatusShipped     OrderStatus = "shipped"
	OrderStatusDelivered   OrderStatus = "delivered"
	OrderStatusCompleted   OrderStatus = "completed"
	OrderStatusCancelled   OrderStatus = "cancelled"
	OrderStatusRefunded    OrderStatus = "refunded"
	OrderStatusDisputed    OrderStatus = "disputed"
)

// PaymentStatus represents payment status
type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusPaid      PaymentStatus = "paid"
	PaymentStatusFailed    PaymentStatus = "failed"
	PaymentStatusRefunded  PaymentStatus = "refunded"
	PaymentStatusCancelled PaymentStatus = "cancelled"
)

// Order represents the main order model
type Order struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	OrderNumber     string             `bson:"order_number" json:"order_number"`
	BuyerID         primitive.ObjectID `bson:"buyer_id" json:"buyer_id"`
	SellerID        primitive.ObjectID `bson:"seller_id" json:"seller_id"`

	// Order items
	Items           []OrderItem        `bson:"items" json:"items"`

	// Pricing
	SubtotalAmount  float64            `bson:"subtotal_amount" json:"subtotal_amount"`
	ShippingAmount  float64            `bson:"shipping_amount" json:"shipping_amount"`
	TaxAmount       float64            `bson:"tax_amount" json:"tax_amount"`
	DiscountAmount  float64            `bson:"discount_amount" json:"discount_amount"`
	TotalAmount     float64            `bson:"total_amount" json:"total_amount"`
	Currency        string             `bson:"currency" json:"currency"`

	// Status tracking
	Status          OrderStatus        `bson:"status" json:"status"`
	PaymentStatus   PaymentStatus      `bson:"payment_status" json:"payment_status"`

	// Addresses
	ShippingAddress Address            `bson:"shipping_address" json:"shipping_address"`
	BillingAddress  Address            `bson:"billing_address" json:"billing_address"`

	// Payment information
	PaymentMethod   string             `bson:"payment_method" json:"payment_method"`
	PaymentID       *primitive.ObjectID `bson:"payment_id,omitempty" json:"payment_id,omitempty"`

	// Shipping information
	ShippingMethod  string             `bson:"shipping_method" json:"shipping_method"`
	TrackingNumber  string             `bson:"tracking_number,omitempty" json:"tracking_number,omitempty"`
	CarrierName     string             `bson:"carrier_name,omitempty" json:"carrier_name,omitempty"`
	EstimatedDelivery *time.Time       `bson:"estimated_delivery,omitempty" json:"estimated_delivery,omitempty"`

	// Special handling
	IsGift          bool               `bson:"is_gift" json:"is_gift"`
	GiftMessage     string             `bson:"gift_message,omitempty" json:"gift_message,omitempty"`
	SpecialInstructions string         `bson:"special_instructions,omitempty" json:"special_instructions,omitempty"`

	// Customer communication
	Notes           []OrderNote        `bson:"notes,omitempty" json:"notes,omitempty"`

	// Status timestamps
	ConfirmedAt     *time.Time         `bson:"confirmed_at,omitempty" json:"confirmed_at,omitempty"`
	PaidAt          *time.Time         `bson:"paid_at,omitempty" json:"paid_at,omitempty"`
	ProcessedAt     *time.Time         `bson:"processed_at,omitempty" json:"processed_at,omitempty"`
	ShippedAt       *time.Time         `bson:"shipped_at,omitempty" json:"shipped_at,omitempty"`
	DeliveredAt     *time.Time         `bson:"delivered_at,omitempty" json:"delivered_at,omitempty"`
	CompletedAt     *time.Time         `bson:"completed_at,omitempty" json:"completed_at,omitempty"`
	CancelledAt     *time.Time         `bson:"cancelled_at,omitempty" json:"cancelled_at,omitempty"`

	// Cancellation/Return information
	CancellationReason string          `bson:"cancellation_reason,omitempty" json:"cancellation_reason,omitempty"`
	CancelledBy     *primitive.ObjectID `bson:"cancelled_by,omitempty" json:"cancelled_by,omitempty"`

	// Admin fields
	AdminNotes      string             `bson:"admin_notes,omitempty" json:"admin_notes,omitempty"`
	Priority        int                `bson:"priority" json:"priority"` // 1=high, 2=normal, 3=low

	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}

// OrderItem represents individual items in an order
type OrderItem struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ProductID       primitive.ObjectID `bson:"product_id" json:"product_id"`
	ProductTitle    string             `bson:"product_title" json:"product_title"`
	ProductImage    string             `bson:"product_image" json:"product_image"`
	SKU             string             `bson:"sku,omitempty" json:"sku,omitempty"`
	Quantity        int                `bson:"quantity" json:"quantity"`
	UnitPrice       float64            `bson:"unit_price" json:"unit_price"`
	TotalPrice      float64            `bson:"total_price" json:"total_price"`
	Currency        string             `bson:"currency" json:"currency"`

	// Product snapshot at time of order
	ProductSnapshot ProductSnapshot    `bson:"product_snapshot" json:"product_snapshot"`

	// Item status (for partial fulfillment)
	Status          OrderStatus        `bson:"status" json:"status"`
	ProcessedAt     *time.Time         `bson:"processed_at,omitempty" json:"processed_at,omitempty"`
	ShippedAt       *time.Time         `bson:"shipped_at,omitempty" json:"shipped_at,omitempty"`
	DeliveredAt     *time.Time         `bson:"delivered_at,omitempty" json:"delivered_at,omitempty"`
}

// ProductSnapshot represents product information at time of order
type ProductSnapshot struct {
	Title           string             `bson:"title" json:"title"`
	Description     string             `bson:"description" json:"description"`
	Brand           string             `bson:"brand,omitempty" json:"brand,omitempty"`
	Model           string             `bson:"model,omitempty" json:"model,omitempty"`
	Condition       ProductCondition   `bson:"condition" json:"condition"`
	Specifications  map[string]interface{} `bson:"specifications,omitempty" json:"specifications,omitempty"`
	CategoryID      primitive.ObjectID `bson:"category_id" json:"category_id"`
	CategoryName    string             `bson:"category_name" json:"category_name"`
}

// OrderNote represents communication notes on orders
type OrderNote struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	UserType  string             `bson:"user_type" json:"user_type"` // buyer, seller, admin
	Message   string             `bson:"message" json:"message"`
	IsPublic  bool               `bson:"is_public" json:"is_public"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}

// SwapDeal represents swap transactions between users
type SwapDeal struct {
	ID                  primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	SwapNumber          string             `bson:"swap_number" json:"swap_number"`
	InitiatorID         primitive.ObjectID `bson:"initiator_id" json:"initiator_id"`
	RecipientID         primitive.ObjectID `bson:"recipient_id" json:"recipient_id"`

	// Products being swapped
	InitiatorProductID  primitive.ObjectID `bson:"initiator_product_id" json:"initiator_product_id"`
	RecipientProductID  primitive.ObjectID `bson:"recipient_product_id" json:"recipient_product_id"`

	// Additional cash involved (if any)
	CashDifference      float64            `bson:"cash_difference" json:"cash_difference"`
	CashPayerID         *primitive.ObjectID `bson:"cash_payer_id,omitempty" json:"cash_payer_id,omitempty"`
	Currency            string             `bson:"currency" json:"currency"`

	// Swap terms and conditions
	Terms               string             `bson:"terms,omitempty" json:"terms,omitempty"`
	Conditions          []string           `bson:"conditions,omitempty" json:"conditions,omitempty"`

	// Status and tracking
	Status              SwapStatus         `bson:"status" json:"status"`

	// Meetup/shipping information
	ExchangeMethod      string             `bson:"exchange_method" json:"exchange_method"` // meetup, shipping
	MeetupLocation      string             `bson:"meetup_location,omitempty" json:"meetup_location,omitempty"`
	MeetupTime          *time.Time         `bson:"meetup_time,omitempty" json:"meetup_time,omitempty"`

	// Shipping details (if shipping)
	InitiatorShipping   ShippingInfo       `bson:"initiator_shipping,omitempty" json:"initiator_shipping,omitempty"`
	RecipientShipping   ShippingInfo       `bson:"recipient_shipping,omitempty" json:"recipient_shipping,omitempty"`

	// Communication
	Messages            []SwapMessage      `bson:"messages,omitempty" json:"messages,omitempty"`

	// Status timestamps
	ProposedAt          time.Time          `bson:"proposed_at" json:"proposed_at"`
	AcceptedAt          *time.Time         `bson:"accepted_at,omitempty" json:"accepted_at,omitempty"`
	RejectedAt          *time.Time         `bson:"rejected_at,omitempty" json:"rejected_at,omitempty"`
	CompletedAt         *time.Time         `bson:"completed_at,omitempty" json:"completed_at,omitempty"`
	CancelledAt         *time.Time         `bson:"cancelled_at,omitempty" json:"cancelled_at,omitempty"`

	// Cancellation information
	CancellationReason  string             `bson:"cancellation_reason,omitempty" json:"cancellation_reason,omitempty"`
	CancelledBy         *primitive.ObjectID `bson:"cancelled_by,omitempty" json:"cancelled_by,omitempty"`

	CreatedAt           time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt           time.Time          `bson:"updated_at" json:"updated_at"`
}

// SwapStatus represents the status of a swap deal
type SwapStatus string

const (
	SwapStatusProposed  SwapStatus = "proposed"
	SwapStatusAccepted  SwapStatus = "accepted"
	SwapStatusRejected  SwapStatus = "rejected"
	SwapStatusInProgress SwapStatus = "in_progress"
	SwapStatusCompleted SwapStatus = "completed"
	SwapStatusCancelled SwapStatus = "cancelled"
	SwapStatusDisputed  SwapStatus = "disputed"
)

// ShippingInfo represents shipping information for swaps
type ShippingInfo struct {
	Address        Address    `bson:"address" json:"address"`
	TrackingNumber string     `bson:"tracking_number,omitempty" json:"tracking_number,omitempty"`
	CarrierName    string     `bson:"carrier_name,omitempty" json:"carrier_name,omitempty"`
	ShippedAt      *time.Time `bson:"shipped_at,omitempty" json:"shipped_at,omitempty"`
	DeliveredAt    *time.Time `bson:"delivered_at,omitempty" json:"delivered_at,omitempty"`
}

// SwapMessage represents messages within a swap deal
type SwapMessage struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	Message   string             `bson:"message" json:"message"`
	Images    []string           `bson:"images,omitempty" json:"images,omitempty"`
	IsSystem  bool               `bson:"is_system" json:"is_system"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}

// OrderDispute represents disputes raised on orders
type OrderDispute struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	OrderID         primitive.ObjectID `bson:"order_id" json:"order_id"`
	SwapDealID      *primitive.ObjectID `bson:"swap_deal_id,omitempty" json:"swap_deal_id,omitempty"`
	RaisedBy        primitive.ObjectID `bson:"raised_by" json:"raised_by"`
	AgainstUserID   primitive.ObjectID `bson:"against_user_id" json:"against_user_id"`

	// Dispute details
	Reason          string             `bson:"reason" json:"reason"`
	Description     string             `bson:"description" json:"description"`
	Evidence        []DisputeEvidence  `bson:"evidence,omitempty" json:"evidence,omitempty"`

	// Status and resolution
	Status          DisputeStatus      `bson:"status" json:"status"`
	Priority        int                `bson:"priority" json:"priority"`

	// Admin handling
	AssignedTo      *primitive.ObjectID `bson:"assigned_to,omitempty" json:"assigned_to,omitempty"`
	AdminNotes      string             `bson:"admin_notes,omitempty" json:"admin_notes,omitempty"`
	Resolution      string             `bson:"resolution,omitempty" json:"resolution,omitempty"`
	ResolutionType  string             `bson:"resolution_type,omitempty" json:"resolution_type,omitempty"`

	// Financial resolution
	RefundAmount    float64            `bson:"refund_amount,omitempty" json:"refund_amount,omitempty"`
	RefundTo        *primitive.ObjectID `bson:"refund_to,omitempty" json:"refund_to,omitempty"`

	// Timestamps
	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
	ResolvedAt      *time.Time         `bson:"resolved_at,omitempty" json:"resolved_at,omitempty"`
	ClosedAt        *time.Time         `bson:"closed_at,omitempty" json:"closed_at,omitempty"`
}

// OrderTracking represents order tracking events
type OrderTracking struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	OrderID     primitive.ObjectID `bson:"order_id" json:"order_id"`
	Status      OrderStatus        `bson:"status" json:"status"`
	Location    string             `bson:"location,omitempty" json:"location,omitempty"`
	Description string             `bson:"description" json:"description"`
	Timestamp   time.Time          `bson:"timestamp" json:"timestamp"`
	CreatedBy   *primitive.ObjectID `bson:"created_by,omitempty" json:"created_by,omitempty"`
	IsPublic    bool               `bson:"is_public" json:"is_public"`
}

// OrderReturn represents return requests
type OrderReturn struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	OrderID        primitive.ObjectID `bson:"order_id" json:"order_id"`
	OrderItemID    primitive.ObjectID `bson:"order_item_id" json:"order_item_id"`
	RequestedBy    primitive.ObjectID `bson:"requested_by" json:"requested_by"`
	Reason         string             `bson:"reason" json:"reason"`
	Description    string             `bson:"description" json:"description"`
	Images         []string           `bson:"images,omitempty" json:"images,omitempty"`

	// Return details
	ReturnType     string             `bson:"return_type" json:"return_type"` // return, exchange, refund
	Condition      string             `bson:"condition" json:"condition"`

	// Status and approval
	Status         ReturnStatus       `bson:"status" json:"status"`
	ApprovedBy     *primitive.ObjectID `bson:"approved_by,omitempty" json:"approved_by,omitempty"`
	ApprovedAt     *time.Time         `bson:"approved_at,omitempty" json:"approved_at,omitempty"`
	RejectedReason string             `bson:"rejected_reason,omitempty" json:"rejected_reason,omitempty"`

	// Shipping information
	ReturnShipping ShippingInfo       `bson:"return_shipping,omitempty" json:"return_shipping,omitempty"`

	// Refund information
	RefundAmount   float64            `bson:"refund_amount,omitempty" json:"refund_amount,omitempty"`
	RefundedAt     *time.Time         `bson:"refunded_at,omitempty" json:"refunded_at,omitempty"`

	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time          `bson:"updated_at" json:"updated_at"`
}

// ReturnStatus represents the status of a return request
type ReturnStatus string

const (
	ReturnStatusRequested  ReturnStatus = "requested"
	ReturnStatusApproved   ReturnStatus = "approved"
	ReturnStatusRejected   ReturnStatus = "rejected"
	ReturnStatusShipped    ReturnStatus = "shipped"
	ReturnStatusReceived   ReturnStatus = "received"
	ReturnStatusProcessed  ReturnStatus = "processed"
	ReturnStatusCompleted  ReturnStatus = "completed"
	ReturnStatusCancelled  ReturnStatus = "cancelled"
)