# AutoBoy System Management Endpoints

## Overview
System management endpoints for database initialization and comprehensive API testing. These endpoints are available as REST APIs that can be called from Postman or any HTTP client.

## 🔐 Authentication Required
All system endpoints require **Admin authentication**. Use the admin login endpoint first to get a JWT token.

### Admin Credentials
- **Email**: `admin@autoboy.ng`
- **Password**: `Admin123!`

## 📋 Available Endpoints

### 1. Database Initialization
**POST** `/api/v1/admin/system/init-database`

Initializes the database with default data including:
- 6 product categories (Phones & Tablets, Laptops & Computers, Gaming, etc.)
- Admin user account
- System settings (commission rates, currency, etc.)

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Database initialized successfully",
  "data": {
    "categories_created": 6,
    "admin_created": true,
    "settings_created": 4,
    "errors": []
  }
}
```

**Features:**
- ✅ **Idempotent** - Safe to run multiple times
- ✅ **Smart Detection** - Skips if already initialized
- ✅ **Error Handling** - Reports partial success with errors
- ✅ **Production Ready** - No mock or sample data

---

### 2. Comprehensive Endpoint Testing
**GET** `/api/v1/admin/system/test-endpoints`

Runs comprehensive tests on all API endpoints and returns detailed results.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "All tests passed",
  "data": {
    "base_url": "https://autoboy-go.onrender.com/api/v1",
    "timestamp": "2024-01-15T10:30:00Z",
    "tests": [
      {
        "endpoint": "/products",
        "method": "GET",
        "expected_status": 200,
        "actual_status": 200,
        "success": true,
        "duration": "50ms"
      }
    ],
    "summary": {
      "total": 15,
      "passed": 15,
      "failed": 0
    }
  }
}
```

**Tests Include:**
- ✅ Public endpoints (products, categories, search)
- ✅ Authentication endpoints (login, register)
- ✅ Protected endpoints (admin, user, seller)
- ✅ Role-based access control validation
- ✅ Response time monitoring

---

### 3. System Status Check
**GET** `/api/v1/admin/system/status`

Returns comprehensive system health and status information.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "System status retrieved",
  "data": {
    "timestamp": "2024-01-15T10:30:00Z",
    "database": {
      "connected": true,
      "collections": {
        "users": 1,
        "products": 0,
        "categories": 6,
        "orders": 0
      }
    },
    "environment": {
      "gin_mode": "release",
      "port": "8080"
    }
  }
}
```

**Information Provided:**
- ✅ Database connection status
- ✅ Collection document counts
- ✅ Environment configuration
- ✅ System timestamp

---

## 🚀 Usage Instructions

### Step 1: Import Postman Collection
1. Download `AutoBoy_System_Endpoints.postman_collection.json`
2. Import into Postman
3. Set environment variables:
   - `base_url`: `https://autoboy-go.onrender.com/api/v1` (Production)
   - `base_url`: `http://localhost:8080/api/v1` (Local)

### Step 2: Authenticate
1. Run **"Admin Login"** request
2. Token will be automatically saved to `{{admin_token}}` variable
3. All subsequent requests will use this token

### Step 3: Initialize Database (First Time Only)
1. Run **"Initialize Database"** request
2. Verify response shows successful creation of categories, admin user, and settings
3. This only needs to be done once per deployment

### Step 4: Test All Endpoints
1. Run **"Test All Endpoints"** request
2. Review the comprehensive test results
3. Check that all tests pass (success: true)

### Step 5: Monitor System Status
1. Run **"Get System Status"** request anytime
2. Check database connection and collection counts
3. Monitor system health

---

## 🔧 Troubleshooting

### Database Already Initialized
```json
{
  "success": true,
  "message": "Database already initialized",
  "data": {
    "status": "already_initialized",
    "admin_users": 1
  }
}
```
**Solution**: This is normal. Database is already set up.

### Authentication Failed
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```
**Solution**: Run the "Admin Login" request again to get a fresh token.

### Partial Database Initialization
```json
{
  "success": true,
  "message": "Database partially initialized with some errors",
  "data": {
    "categories_created": 6,
    "admin_created": true,
    "settings_created": 0,
    "errors": ["Settings: duplicate key error"]
  }
}
```
**Solution**: Check the errors array for specific issues. Usually safe to ignore if core data was created.

---

## 🎯 Benefits of System Endpoints

### 1. **No Manual Database Setup**
- Initialize database with one API call
- No need to run separate scripts or commands
- Works on any deployment (local, Render, etc.)

### 2. **Comprehensive Testing**
- Test all 80+ endpoints automatically
- Validate authentication and authorization
- Monitor response times and performance

### 3. **Production Monitoring**
- Check system health anytime
- Monitor database connection status
- Track collection document counts

### 4. **Postman Integration**
- Easy to use from Postman
- Automated token management
- Environment switching (local/production)

### 5. **DevOps Friendly**
- Can be integrated into CI/CD pipelines
- Automated health checks
- API-based system management

---

## 🌐 Live Endpoints

**Production Base URL**: `https://autoboy-go.onrender.com/api/v1`

**Quick Test Commands:**
```bash
# Health Check (No auth required)
curl https://autoboy-go.onrender.com/health

# Admin Login
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@autoboy.ng","password":"Admin123!"}' \
  https://autoboy-go.onrender.com/api/v1/auth/login

# Initialize Database (Replace {token} with actual token)
curl -X POST -H "Authorization: Bearer {token}" \
  https://autoboy-go.onrender.com/api/v1/admin/system/init-database

# Test All Endpoints
curl -H "Authorization: Bearer {token}" \
  https://autoboy-go.onrender.com/api/v1/admin/system/test-endpoints

# System Status
curl -H "Authorization: Bearer {token}" \
  https://autoboy-go.onrender.com/api/v1/admin/system/status
```

---

## ✅ Production Ready Features

- 🔒 **Secure** - Admin authentication required
- 🔄 **Idempotent** - Safe to run multiple times
- 📊 **Comprehensive** - Tests all endpoints
- 🚀 **Fast** - Optimized for quick execution
- 📱 **Postman Ready** - Complete collection provided
- 🌐 **Environment Agnostic** - Works local and production
- 📈 **Monitoring** - System health and status
- 🛡️ **Error Handling** - Graceful error reporting

The system endpoints provide a complete solution for managing and testing the AutoBoy API without requiring direct server access or manual database setup.