# AutoBoy MongoDB Database Schema Documentation

## Overview

This document describes the complete MongoDB database schema for the AutoBoy e-commerce platform built with Go (Golang). The schema is designed to support all core features including user management, product listings, order processing, payments, chat functionality, and administrative operations.

## Database Architecture

- **Database**: MongoDB
- **Language**: Go (Golang)
- **ODM**: MongoDB Go Driver
- **Schema Design**: Document-oriented with embedded documents and references

## Collections Overview

### Core Collections Summary

| Collection | Purpose | Key Features |
|------------|---------|--------------|
| `users` | User management and profiles | Multi-role auth, verification, premium status |
| `products` | Product listings and catalog | Media support, swap functionality, analytics |
| `orders` | Order management and tracking | Status tracking, shipping, disputes |
| `payments` | Payment processing and transactions | Multi-gateway, escrow, crypto support |
| `conversations` | Chat conversations | Real-time messaging, product context |
| `messages` | Individual chat messages | Media attachments, reactions, encryption |

---

## Detailed Schema Documentation

### 1. User Management System

#### Users Collection (`users`)

**Purpose**: Stores all user accounts with embedded profile information

**Key Features**:
- Multi-role authentication (Buyer, Seller, Admin)
- Embedded profile with verification status
- Premium membership tracking
- Security features (2FA, login attempts)
- Address management
- Preferences and settings

**Indexes**:
- `email` (unique)
- `username` (unique)
- `phone` (unique)
- `user_type`
- `profile.verification_status`
- `profile.premium_status`

**Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+234812345678",
  "user_type": "seller",
  "status": "active",
  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "verification_status": "verified",
    "premium_status": "premium",
    "addresses": [...],
    "business_name": "John's Electronics"
  },
  "created_at": ISODate("..."),
  "updated_at": ISODate("...")
}
```

#### Supporting Collections:
- `user_sessions` - Active user sessions with device tracking
- `user_activities` - User action logs and audit trail
- `premium_memberships` - Premium subscription details
- `user_wallets` - Digital wallet for transactions

---

### 2. Product Management System

#### Products Collection (`products`)

**Purpose**: Product catalog with comprehensive metadata

**Key Features**:
- Multi-media support (images, videos)
- Geographic location tracking with 2dsphere index
- Swap functionality with preferences
- SEO optimization with full-text search
- Analytics tracking (views, likes, shares)
- Admin moderation capabilities

**Indexes**:
- `seller_id`
- `category_id`
- `status`
- `location.coordinates` (2dsphere)
- `title, description, tags` (text index)
- `price`, `created_at`

**Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "seller_id": ObjectId("..."),
  "category_id": ObjectId("..."),
  "title": "iPhone 15 Pro Max",
  "price": 1200000,
  "condition": "new",
  "swap_available": true,
  "location": {
    "city": "Lagos",
    "coordinates": [3.3792, 6.5244]
  },
  "images": [...],
  "specifications": {...},
  "view_count": 150,
  "status": "active"
}
```

#### Categories Collection (`categories`)

**Purpose**: Hierarchical product categorization

**Key Features**:
- Nested categories with parent-child relationships
- Dynamic attributes per category
- SEO metadata
- Filterable specifications

**Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "name": "Smartphones",
  "slug": "smartphones",
  "parent_id": null,
  "attributes": [
    {
      "name": "Brand",
      "type": "select",
      "options": ["Apple", "Samsung", "Google"],
      "is_filterable": true
    }
  ]
}
```

#### Supporting Collections:
- `product_reviews` - Customer reviews and ratings
- `product_questions` - Q&A between buyers and sellers
- `product_wishlists` - User saved products
- `product_views` - View tracking and analytics
- `product_flags` - Reported products

---

### 3. Order Management System

#### Orders Collection (`orders`)

**Purpose**: Complete order lifecycle management

**Key Features**:
- Multi-item orders with individual tracking
- Comprehensive status tracking
- Shipping and delivery management
- Customer communication notes
- Cancellation and refund handling

**Indexes**:
- `order_number` (unique)
- `buyer_id`, `seller_id`
- `status`, `payment_status`
- `created_at`

**Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "order_number": "ORD-2024-001",
  "buyer_id": ObjectId("..."),
  "seller_id": ObjectId("..."),
  "items": [
    {
      "product_id": ObjectId("..."),
      "quantity": 1,
      "unit_price": 1200000,
      "product_snapshot": {...}
    }
  ],
  "total_amount": 1200000,
  "status": "confirmed",
  "shipping_address": {...}
}
```

#### Swap Deals Collection (`swap_deals`)

**Purpose**: Product swap transactions

**Key Features**:
- Two-way product exchange
- Cash difference handling
- Meetup or shipping coordination
- Communication thread
- Status tracking

**Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "swap_number": "SWAP-2024-001",
  "initiator_id": ObjectId("..."),
  "recipient_id": ObjectId("..."),
  "initiator_product_id": ObjectId("..."),
  "recipient_product_id": ObjectId("..."),
  "cash_difference": 50000,
  "exchange_method": "meetup",
  "status": "proposed"
}
```

#### Supporting Collections:
- `order_disputes` - Dispute resolution system
- `order_tracking` - Shipping and delivery events
- `order_returns` - Return and refund requests

---

### 4. Payment System

#### Payments Collection (`payments`)

**Purpose**: Multi-gateway payment processing

**Key Features**:
- Support for multiple payment gateways (Paystack, Flutterwave, Stripe)
- Cryptocurrency payment support
- Comprehensive fee calculation
- Webhook processing
- Security and verification features

**Indexes**:
- `payment_number` (unique)
- `user_id`, `order_id`
- `status`, `payment_gateway`
- `gateway_payment_id`

**Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "payment_number": "PAY-2024-001",
  "user_id": ObjectId("..."),
  "order_id": ObjectId("..."),
  "amount": 1200000,
  "payment_gateway": "paystack",
  "payment_method": "card",
  "status": "completed",
  "gateway_fee": 18000,
  "net_amount": 1182000
}
```

#### Escrow Collection (`escrows`)

**Purpose**: Secure fund holding for transactions

**Key Features**:
- Automatic and manual release conditions
- Dispute handling
- Partial release support
- Auto-release scheduling

#### Supporting Collections:
- `wallet_transactions` - Digital wallet operations
- `refunds` - Refund processing
- `withdrawals` - Seller payout management
- `bank_accounts` - Verified bank accounts

---

### 5. Communication System

#### Conversations Collection (`conversations`)

**Purpose**: Chat conversation management

**Key Features**:
- Direct and group conversations
- Product/order context linking
- Participant settings per user
- Moderation and blocking
- Message encryption support

**Indexes**:
- `participants`
- `product_id`, `order_id`
- `last_message_at`

**Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "type": "direct",
  "participants": [ObjectId("..."), ObjectId("...")],
  "product_id": ObjectId("..."),
  "last_message": {...},
  "participant_settings": {
    "user1": {
      "is_muted": false,
      "last_read_at": ISODate("...")
    }
  }
}
```

#### Messages Collection (`messages`)

**Purpose**: Individual chat messages

**Key Features**:
- Multiple message types (text, media, system)
- File attachments with metadata
- Message reactions and threading
- Delivery and read receipts
- Encryption capabilities

**Indexes**:
- `conversation_id, created_at`
- `sender_id`
- `type`, `status`

#### Supporting Collections:
- `chat_notifications` - Push notification management
- `chat_reports` - Content moderation
- `online_statuses` - User presence tracking

---

### 6. System Collections

#### System Settings Collection (`system_settings`)

**Purpose**: Platform configuration management

**Key Features**:
- Configurable platform parameters
- Feature flags
- Pricing and commission rates
- File upload limits

#### Admin Logs Collection (`admin_logs`)

**Purpose**: Administrative action tracking

**Key Features**:
- Complete audit trail
- User action logging
- System event tracking

---

## Relationships and References

### Primary Relationships

1. **User → Products**: One-to-many (seller relationship)
2. **User → Orders**: One-to-many (buyer/seller relationships)
3. **Product → Category**: Many-to-one
4. **Order → Payment**: One-to-one
5. **Order → Escrow**: One-to-one
6. **User → Conversations**: Many-to-many (participants)
7. **Conversation → Messages**: One-to-many

### Reference Strategy

- **Embedded Documents**: Used for closely related data (Profile in User, OrderItems in Order)
- **ObjectId References**: Used for loosely coupled relationships (Product → Category)
- **Denormalization**: Used for frequently accessed data (last_message in Conversation)

---

## Indexing Strategy

### Performance Optimization

1. **Compound Indexes**: For common query patterns
   - `user_id + created_at` for user-specific data with time sorting
   - `conversation_id + created_at` for message retrieval

2. **Text Indexes**: For search functionality
   - Product search across title, description, and tags

3. **Geospatial Indexes**: For location-based features
   - Product location search with 2dsphere index

4. **TTL Indexes**: For automatic data expiration
   - Session expiration
   - Temporary data cleanup

### Index Considerations

- **Selectivity**: Indexes on high-cardinality fields
- **Query Patterns**: Aligned with application access patterns
- **Write Performance**: Balanced with read optimization
- **Storage**: Optimized for frequently accessed data

---

## Data Consistency and Integrity

### Validation Rules

1. **Email/Username Uniqueness**: Enforced by unique indexes
2. **Referential Integrity**: Handled at application level
3. **Status Consistency**: Validated through business logic
4. **Price Validation**: Non-negative values enforced

### Transaction Handling

- **MongoDB Transactions**: Used for multi-document operations
- **Compensating Actions**: For distributed transaction scenarios
- **Idempotency**: Ensured for payment and order operations

---

## Security Considerations

### Data Protection

1. **Password Hashing**: bcrypt with configurable cost
2. **Sensitive Data**: Credit card info stored in tokenized form
3. **PII Encryption**: Optional encryption for sensitive fields
4. **Access Control**: Role-based permissions

### Audit and Compliance

- **User Activity Tracking**: Complete audit trail
- **Data Retention Policies**: Configurable retention periods
- **GDPR Compliance**: User data deletion capabilities
- **Financial Regulations**: Payment data handling compliance

---

## Scalability and Performance

### Horizontal Scaling

- **Sharding Strategy**: Prepared for user-based sharding
- **Read Replicas**: For read-heavy workloads
- **Connection Pooling**: Optimized for high concurrency

### Performance Optimization

- **Query Optimization**: Efficient index usage
- **Data Aggregation**: MongoDB aggregation pipeline
- **Caching Strategy**: Application-level caching for hot data
- **Background Jobs**: For heavy operations (analytics, notifications)

---

## Environment Configuration

### Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=autoboy
MONGODB_MAX_POOL_SIZE=100
MONGODB_MIN_POOL_SIZE=5
```

### Connection Settings

- **Connection Pooling**: 5-100 connections
- **Timeout Configuration**: 10s connect, 30s idle
- **Retry Logic**: Automatic retry with exponential backoff

---

## Getting Started

### 1. Database Setup

```bash
# Start MongoDB
mongod --dbpath /data/db

# Initialize database
cd autoboy-backend
go run scripts/init_db.go
```

### 2. Default Data

- **Admin User**: admin@autoboy.com / admin123
- **Categories**: Smartphones, Tablets, Laptops, etc.
- **System Settings**: Commission rates, limits, etc.

### 3. Verification

```bash
# Connect to MongoDB
mongo autoboy

# Check collections
show collections

# Verify admin user
db.users.findOne({user_type: "admin"})
```

---

## Maintenance and Monitoring

### Regular Maintenance

1. **Index Optimization**: Monitor and optimize query performance
2. **Data Cleanup**: Remove expired sessions and temporary data
3. **Backup Strategy**: Regular automated backups
4. **Performance Monitoring**: Query performance and resource usage

### Monitoring Metrics

- **Connection Pool Usage**
- **Query Performance**
- **Index Effectiveness**
- **Storage Growth**
- **Replication Lag** (if using replicas)

---

## Migration Strategy

### Schema Evolution

1. **Backward Compatibility**: New fields as optional
2. **Migration Scripts**: For structural changes
3. **Version Control**: Schema version tracking
4. **Testing**: Comprehensive testing before deployment

### Data Migration

- **Incremental Updates**: For large dataset modifications
- **Rollback Plans**: For failed migrations
- **Validation**: Post-migration data integrity checks

---

This comprehensive schema supports all AutoBoy platform features while maintaining flexibility for future enhancements and scalability requirements. The design follows MongoDB best practices and is optimized for the specific needs of an e-commerce platform with social and chat features.