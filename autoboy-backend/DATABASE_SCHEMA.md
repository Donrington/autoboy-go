# AutoBoy Database Schema Documentation

This document provides a comprehensive overview of all database collections and models in the AutoBoy platform, ensuring full feature parity with the React frontend.

## Core Collections

### User Management
- **users** - Main user accounts with profiles, preferences, and social features
- **user_sessions** - Active user sessions with device tracking
- **user_activities** - User activity logs and tracking
- **follow_relationships** - User following/follower relationships
- **user_wallets** - User wallet balances and transaction history
- **premium_memberships** - Premium subscription details

### Product Management
- **products** - Main product catalog with enhanced metadata
- **categories** - Product categories with hierarchical structure
- **product_reviews** - Product reviews and ratings
- **product_questions** - Product Q&A system
- **product_wishlists** - Legacy wishlist collection (deprecated)
- **product_views** - Product view tracking for analytics
- **product_flags** - Reported products and content moderation
- **product_analytics** - Product performance metrics

### Shopping & Cart
- **cart_items** - Shopping cart items with seller information
- **saved_for_later** - Items saved for later purchase
- **promo_codes** - Promotional discount codes
- **promo_code_usage** - Promo code usage tracking

### Orders & Transactions
- **orders** - Order management with detailed tracking
- **swap_deals** - Product swap transactions
- **order_disputes** - Order dispute resolution
- **order_tracking** - Order status and shipping tracking
- **order_returns** - Return and refund requests

### Wishlist System
- **wishlists** - User wishlists with sharing capabilities
- **wishlist_items** - Individual wishlist items with tracking
- **wishlist_shares** - Wishlist sharing permissions

### Search & Discovery
- **saved_searches** - User saved search queries with filters
- **search_history** - Search query history and analytics
- **search_suggestions** - Search autocomplete suggestions

### Price Monitoring
- **price_alerts** - User price alert configurations
- **price_alert_notifications** - Triggered price alert notifications

### Analytics & Insights
- **user_analytics** - User behavior and engagement metrics
- **seller_analytics** - Seller performance analytics
- **buyer_analytics** - Buyer spending and behavior analytics
- **platform_analytics** - Overall platform metrics

### Communication
- **conversations** - Chat conversations between users
- **messages** - Individual chat messages
- **chat_notifications** - Chat-related notifications
- **chat_reports** - Reported chat content
- **chat_mutes** - Muted conversations
- **chat_blocks** - Blocked users
- **online_statuses** - User online status tracking
- **message_templates** - Pre-defined message templates
- **chat_settings** - User chat preferences

### Notifications
- **notifications** - User notifications with multiple types
- **notification_templates** - Notification message templates

### Gamification & Rewards
- **badges** - Available badges and achievements
- **user_badges** - User earned badges
- **reward_points** - User reward point balances
- **points_transactions** - Reward point transaction history

### Deals & Promotions
- **exclusive_deals** - Premium user exclusive deals

### Payment System
- **payments** - Payment transactions
- **transactions** - General transaction records
- **escrows** - Escrow payment holds
- **wallet_transactions** - Wallet transaction history
- **payment_webhooks** - Payment gateway webhooks
- **refunds** - Refund transactions
- **bank_accounts** - User bank account information
- **withdrawals** - Withdrawal requests

### Dispute Resolution
- **disputes** - General dispute cases
- **dispute_messages** - Dispute communication
- **dispute_evidence** - Dispute evidence files
- **dispute_resolutions** - Dispute resolution outcomes
- **reports** - User and content reports
- **moderation_actions** - Admin moderation actions
- **content_flags** - Flagged content tracking
- **user_strikes** - User violation tracking
- **appeal_requests** - User appeal submissions

### System Administration
- **admin_logs** - Administrative action logs
- **system_settings** - Platform configuration
- **api_keys** - API access keys

## Key Model Features

### Enhanced User Model
- Social features (followers/following counts)
- Premium subscription tracking
- Seller performance metrics
- Activity tracking and online status
- Analytics preferences

### Enhanced Product Model
- Comprehensive rating system with breakdown
- Seller information denormalization
- Stock status and availability tracking
- Product badges (new, hot, trending)
- Enhanced search and filtering support

### Advanced Cart System
- Promo code integration
- Tax calculation (7.5% VAT)
- Shipping cost calculation
- Saved for later functionality
- Seller information in cart items

### Comprehensive Analytics
- User behavior tracking
- Seller performance metrics
- Buyer spending patterns
- Platform-wide analytics
- Premium feature analytics

### Price Alert System
- Real-time price monitoring
- Multiple notification channels
- Price history tracking
- Background job processing

### Wishlist Enhancement
- Multiple wishlists per user
- Wishlist sharing with permissions
- Price change tracking
- Availability monitoring

### Search & Discovery
- Advanced search filters
- Search history tracking
- Autocomplete suggestions
- Saved search queries

## Database Indexes

All collections include optimized indexes for:
- Primary queries and lookups
- Search and filtering operations
- Analytics and reporting
- Performance optimization
- Unique constraints where needed

## Frontend Feature Coverage

This schema supports all React AutoBoy frontend features including:

### Shop Component
- Advanced product filtering
- Search with suggestions
- Category browsing
- Price range filtering
- Brand and memory filtering
- Stock status display
- Seller information

### Cart Component
- Promo code system
- Tax calculation
- Shipping costs
- Saved for later
- Recently viewed items

### Product Details
- Product reviews and ratings
- Q&A system
- Seller information
- Follow/unfollow sellers
- Wishlist functionality

### Dashboard Components
- Buyer dashboard with orders, wishlist, activity
- Premium buyer dashboard with analytics
- Seller dashboard with products, orders, earnings
- Premium seller dashboard with advanced analytics

### Premium Features
- Exclusive deals
- Priority listings
- Advanced analytics
- Price alerts
- Enhanced messaging
- Badge system

All database schemas are designed to support real-time updates, efficient querying, and scalable growth while maintaining data consistency and performance.