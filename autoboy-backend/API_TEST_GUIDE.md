# AutoBoy API Endpoint Testing Guide

## Overview
This guide provides comprehensive testing for all AutoBoy API endpoints to ensure they work correctly and are compatible with the React frontend.

## Running Tests

### Method 1: Using the built-in test function
```bash
# Build the application
go build .

# Start server in one terminal
./autoboy-backend.exe

# Run tests in another terminal
./autoboy-backend.exe test
```

### Method 2: Using the batch script (Windows)
```bash
# Run the automated test script
run_tests.bat
```

## Test Coverage

### 🔓 Public Endpoints (No Authentication Required)
- ✅ `GET /health` - Health check
- ✅ `GET /api/v1/products` - Get all products
- ✅ `GET /api/v1/categories` - Get all categories
- ✅ `GET /api/v1/search?q=phone` - Search products
- ✅ `POST /api/v1/search/advanced` - Advanced search
- ✅ `GET /api/v1/search/suggestions` - Search suggestions
- ✅ `GET /api/v1/products/:id/questions` - Get product questions
- ✅ `GET /api/v1/orders/:id/track` - Track order (public)

### 🔐 Authentication Endpoints
- ✅ `POST /api/v1/auth/register` - User registration
- ✅ `POST /api/v1/auth/login` - User login
- ✅ `POST /api/v1/auth/forgot-password` - Password reset request
- ✅ `POST /api/v1/auth/reset-password` - Password reset
- ✅ `GET /api/v1/auth/verify-email` - Email verification
- ✅ `POST /api/v1/auth/resend-verification` - Resend verification

### 👤 User Endpoints (Buyer Authentication Required)
- ✅ `GET /api/v1/user/profile` - Get user profile
- ✅ `PUT /api/v1/user/profile` - Update user profile
- ✅ `POST /api/v1/user/change-password` - Change password
- ✅ `DELETE /api/v1/user/account` - Delete account
- ✅ `GET /api/v1/user/addresses` - Get user addresses
- ✅ `POST /api/v1/user/addresses` - Create address
- ✅ `PUT /api/v1/user/addresses/:id` - Update address
- ✅ `DELETE /api/v1/user/addresses/:id` - Delete address
- ✅ `GET /api/v1/user/orders` - Get user orders
- ✅ `GET /api/v1/user/orders/:id` - Get specific order
- ✅ `POST /api/v1/user/orders/:id/cancel` - Cancel order
- ✅ `POST /api/v1/user/orders/:id/return` - Request return
- ✅ `POST /api/v1/user/orders/:id/refund` - Request refund
- ✅ `GET /api/v1/user/notifications` - Get notifications
- ✅ `PUT /api/v1/user/notifications/:id/read` - Mark notification read
- ✅ `PUT /api/v1/user/notifications/read-all` - Mark all read
- ✅ `GET /api/v1/user/activity` - Get user activity
- ✅ `GET /api/v1/user/premium/status` - Get premium status
- ✅ `GET /api/v1/user/premium/analytics` - Get premium analytics

### 🛒 Shopping Endpoints
- ✅ `GET /api/v1/wishlist` - Get wishlist
- ✅ `POST /api/v1/wishlist` - Add to wishlist
- ✅ `DELETE /api/v1/wishlist/:id` - Remove from wishlist
- ✅ `GET /api/v1/cart` - Get cart
- ✅ `POST /api/v1/cart/add` - Add to cart
- ✅ `PUT /api/v1/cart/update` - Update cart item
- ✅ `DELETE /api/v1/cart/remove/:id` - Remove from cart
- ✅ `DELETE /api/v1/cart/clear` - Clear cart
- ✅ `POST /api/v1/cart/save-later/:id` - Save for later
- ✅ `GET /api/v1/cart/saved-items` - Get saved items
- ✅ `POST /api/v1/cart/move-to-cart/:id` - Move to cart
- ✅ `GET /api/v1/cart/validate` - Validate cart
- ✅ `POST /api/v1/cart/promo` - Apply promo code

### 📦 Order Endpoints
- ✅ `POST /api/v1/orders` - Create order
- ✅ `GET /api/v1/orders/:id/track` - Track order

### 🔍 Search & Discovery
- ✅ `GET /api/v1/saved-searches` - Get saved searches
- ✅ `POST /api/v1/saved-searches` - Create saved search
- ✅ `DELETE /api/v1/saved-searches/:id` - Delete saved search
- ✅ `GET /api/v1/price-alerts` - Get price alerts
- ✅ `POST /api/v1/price-alerts` - Create price alert
- ✅ `DELETE /api/v1/price-alerts/:id` - Delete price alert

### 👥 Social Features
- ✅ `POST /api/v1/follow/:id` - Follow user
- ✅ `DELETE /api/v1/follow/:id` - Unfollow user
- ✅ `GET /api/v1/follow/followers` - Get followers
- ✅ `GET /api/v1/follow/following` - Get following

### ⭐ Reviews & Questions
- ✅ `POST /api/v1/reviews` - Create review
- ✅ `GET /api/v1/reviews/my-reviews` - Get user reviews
- ✅ `POST /api/v1/questions` - Create question
- ✅ `PUT /api/v1/questions/:id/answer` - Answer question

### 💳 Subscription & Premium
- ✅ `GET /api/v1/subscription/plans` - Get subscription plans
- ✅ `GET /api/v1/subscription/features` - Get premium features
- ✅ `GET /api/v1/subscription/status` - Get subscription status
- ✅ `POST /api/v1/subscription/create` - Create subscription
- ✅ `POST /api/v1/subscription/subscribe` - Subscribe
- ✅ `POST /api/v1/subscription/cancel` - Cancel subscription
- ✅ `POST /api/v1/subscription/upgrade` - Upgrade subscription
- ✅ `GET /api/v1/subscription/billing-history` - Get billing history

### 📊 Analytics (Premium Only)
- ✅ `GET /api/v1/analytics/seller` - Get seller analytics
- ✅ `GET /api/v1/analytics/buyer` - Get buyer analytics
- ✅ `GET /api/v1/analytics/dashboard` - Get dashboard analytics
- ✅ `GET /api/v1/analytics/sales` - Get sales analytics

### 🏪 Seller Endpoints (Seller Authentication Required)
- ✅ `GET /api/v1/seller/products` - Get seller products
- ✅ `POST /api/v1/seller/products` - Create product
- ✅ `GET /api/v1/seller/products/:id` - Get product
- ✅ `PUT /api/v1/seller/products/:id` - Update product
- ✅ `DELETE /api/v1/seller/products/:id` - Delete product
- ✅ `GET /api/v1/seller/orders` - Get seller orders
- ✅ `GET /api/v1/seller/orders/:id` - Get seller order
- ✅ `PUT /api/v1/seller/orders/:id/status` - Update order status
- ✅ `POST /api/v1/seller/orders/:id/ship` - Ship order
- ✅ `POST /api/v1/seller/tracking` - Add tracking event
- ✅ `GET /api/v1/seller/dashboard` - Get seller dashboard
- ✅ `GET /api/v1/seller/analytics/sales` - Get seller sales analytics
- ✅ `GET /api/v1/seller/analytics/products` - Get seller product analytics
- ✅ `GET /api/v1/seller/analytics/revenue` - Get seller revenue analytics
- ✅ `GET /api/v1/seller/profile` - Get seller profile
- ✅ `PUT /api/v1/seller/profile` - Update seller profile

### 👑 Admin Endpoints (Admin Authentication Required)
- ✅ `GET /api/v1/admin/dashboard` - Get admin dashboard
- ✅ `GET /api/v1/admin/users` - Get all users
- ✅ `GET /api/v1/admin/users/:id` - Get specific user
- ✅ `PUT /api/v1/admin/users/:id/status` - Update user status
- ✅ `GET /api/v1/admin/products` - Get all products
- ✅ `PUT /api/v1/admin/products/:id/approve` - Approve product
- ✅ `PUT /api/v1/admin/products/:id/reject` - Reject product
- ✅ `GET /api/v1/admin/orders` - Get all orders
- ✅ `GET /api/v1/admin/orders/:id` - Get specific order
- ✅ `GET /api/v1/admin/analytics` - Get system analytics

### 🔄 Additional Features
- ✅ `GET /api/v1/notifications` - Get notifications
- ✅ `PUT /api/v1/notifications/:id/read` - Mark notification read
- ✅ `DELETE /api/v1/notifications/:id` - Delete notification
- ✅ `POST /api/v1/notifications/preferences` - Update preferences
- ✅ `GET /api/v1/notifications/preferences` - Get preferences
- ✅ `POST /api/v1/reports/product` - Report product
- ✅ `POST /api/v1/reports/user` - Report user
- ✅ `GET /api/v1/disputes` - Get disputes
- ✅ `POST /api/v1/disputes/create` - Create dispute
- ✅ `GET /api/v1/disputes/:id` - Get dispute
- ✅ `GET /api/v1/wallet/balance` - Get wallet balance
- ✅ `GET /api/v1/wallet/transactions` - Get wallet transactions
- ✅ `POST /api/v1/wallet/withdraw` - Request withdrawal
- ✅ `GET /api/v1/badges` - Get user badges
- ✅ `GET /api/v1/badges/available` - Get available badges

## Test Results Interpretation

### ✅ Success Indicators
- **Status 200**: Successful GET requests
- **Status 201**: Successful POST requests (creation)
- **Status 204**: Successful DELETE requests
- **Status 400**: Expected validation errors
- **Status 401**: Expected authentication errors
- **Status 403**: Expected authorization errors
- **Status 404**: Expected not found errors

### 🔧 Authentication Flow
1. **Admin Login**: Uses default admin credentials (`admin@autoboy.ng` / `Admin123!`)
2. **Token Extraction**: Extracts JWT tokens from login responses
3. **Protected Requests**: Uses Bearer token authentication
4. **Role Validation**: Tests role-based access control

### 📱 React Frontend Compatibility
All endpoints are designed to work seamlessly with the React frontend:
- **CORS Enabled**: Allows requests from frontend domains
- **JSON Responses**: Consistent JSON response format
- **Error Handling**: Proper HTTP status codes and error messages
- **Authentication**: JWT token-based authentication
- **Pagination**: Consistent pagination format
- **Filtering**: Query parameter support for filtering

## Expected Test Results
- **Public Endpoints**: Should return 200 status
- **Authentication**: Should return 200 with valid tokens
- **Protected Endpoints**: Should return 200 with valid tokens, 401 without
- **Role-based Access**: Should return 403 for insufficient permissions
- **Validation Errors**: Should return 400 for invalid data

## Troubleshooting
If tests fail:
1. Ensure database is running and initialized
2. Check environment variables are set correctly
3. Verify server is running on correct port (8080)
4. Check logs for specific error messages
5. Ensure all required collections exist in database