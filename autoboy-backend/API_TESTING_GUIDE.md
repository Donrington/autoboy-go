# AutoBoy API Testing Guide

## Overview
This guide provides comprehensive instructions for testing the AutoBoy API using the provided Postman collection.

## Prerequisites
1. **MongoDB** running on localhost:27017 or configured connection string
2. **Redis** (optional) for caching and sessions
3. **Go 1.21+** installed
4. **Postman** for API testing

## Environment Setup

### 1. Environment Variables
Create a `.env` file in the `autoboy-backend` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/autoboy
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Email Service (Mailgun/SendGrid)
EMAIL_SERVICE_API_KEY=your-email-service-api-key
EMAIL_FROM=noreply@autoboy.ng

# SMS Service (Twilio/Termii)
SMS_SERVICE_API_KEY=your-sms-service-api-key
SMS_FROM=AutoBoy

# Payment (Paystack)
PAYSTACK_SECRET_KEY=sk_test_your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=pk_test_your-paystack-public-key

# Image Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Server
PORT=8080
GIN_MODE=debug
```

### 2. Start the Server
```bash
cd autoboy-backend
go mod tidy
go run main.go
```

The server should start on `http://localhost:8080`

## Testing Workflow

### Step 1: Health Check
Test the basic server functionality:
- **Endpoint**: `GET /health`
- **Expected**: Status 200 with server health information

### Step 2: User Registration
Create a new user account:
- **Endpoint**: `POST /api/v1/auth/register`
- **Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+2348123456789",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "buyer",
  "accept_terms": true
}
```
- **Expected**: Status 201 with user data and JWT token
- **Note**: The token will be automatically saved to collection variables

### Step 3: User Login
Test user authentication:
- **Endpoint**: `POST /api/v1/auth/login`
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```
- **Expected**: Status 200 with user data and JWT token

### Step 4: Categories
Test category endpoints:
- **Get Categories**: `GET /api/v1/categories/`
- **Expected**: List of default categories (Phones & Tablets, Laptops & Computers, etc.)

### Step 5: User Profile Management
Test profile operations (requires authentication):
- **Get Profile**: `GET /api/v1/user/profile`
- **Update Profile**: `PUT /api/v1/user/profile`
- **Change Password**: `POST /api/v1/user/change-password`

### Step 6: Address Management
Test address operations:
- **Get Addresses**: `GET /api/v1/user/addresses/`
- **Add Address**: `POST /api/v1/user/addresses/`

### Step 7: Product Management (Seller)
First, register as a seller or update user type to "seller":
- **Create Product**: `POST /api/v1/seller/products`
- **Get Seller Products**: `GET /api/v1/seller/products/`
- **Update Product**: `PUT /api/v1/seller/products/:id`

### Step 8: Cart Operations
Test shopping cart functionality:
- **Add to Cart**: `POST /api/v1/cart/add`
- **Get Cart**: `GET /api/v1/cart/`
- **Update Cart Item**: `PUT /api/v1/cart/update`
- **Remove from Cart**: `DELETE /api/v1/cart/remove/:id`

### Step 9: Order Management
Test order creation and management:
- **Create Order**: `POST /api/v1/orders/`
- **Get User Orders**: `GET /api/v1/user/orders/`
- **Track Order**: `GET /api/v1/orders/:id/track`

## Testing Scenarios

### Scenario 1: Complete Buyer Journey
1. Register as buyer
2. Browse categories and products
3. Add products to cart
4. Update cart quantities
5. Create order
6. Track order status

### Scenario 2: Complete Seller Journey
1. Register as seller
2. Create products
3. Manage product inventory
4. Receive and process orders
5. Update order status

### Scenario 3: Error Handling
Test various error conditions:
- Invalid authentication tokens
- Missing required fields
- Invalid data formats
- Non-existent resources
- Insufficient permissions

## Expected Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Database Collections

The API uses the following MongoDB collections:
- `users` - User accounts and profiles
- `products` - Product listings
- `categories` - Product categories
- `orders` - Order information
- `cart_items` - Shopping cart items
- `order_returns` - Return requests
- `order_tracking` - Order tracking events

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

The Postman collection automatically handles token management using collection variables.

## Rate Limiting

The API implements rate limiting:
- Auth endpoints: 5 requests per minute
- General API: 100 requests per minute
- File uploads: 10 requests per minute

## File Uploads

For endpoints that accept file uploads (product images, profile avatars):
- Use `multipart/form-data` content type
- Maximum file size: 5MB
- Supported formats: JPG, PNG, WebP

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MongoDB is running
   - Check connection string in environment variables

2. **Authentication Errors**
   - Verify JWT secret is set
   - Check token expiration

3. **Validation Errors**
   - Review request body format
   - Ensure all required fields are provided

4. **Permission Errors**
   - Verify user type (buyer/seller) for restricted endpoints
   - Check user authentication status

### Debug Mode
Set `GIN_MODE=debug` in environment variables for detailed logging.

## Production Considerations

Before deploying to production:
1. Set `GIN_MODE=release`
2. Use strong JWT secrets
3. Configure proper CORS settings
4. Set up SSL/TLS certificates
5. Configure production database connections
6. Set up monitoring and logging
7. Configure backup strategies

## Support

For issues or questions:
1. Check server logs for detailed error information
2. Verify environment configuration
3. Test with minimal request data
4. Check database connectivity and data integrity