# AutoBoy Local Development Setup

## Prerequisites

### 1. Install MongoDB
**Windows:**
```bash
# Download MongoDB Community Server from https://www.mongodb.com/try/download/community
# Install and start MongoDB service
# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 2. Install Redis (Optional)
**Windows:**
```bash
# Download Redis from https://github.com/microsoftarchive/redis/releases
# Or use Docker:
docker run -d -p 6379:6379 --name redis redis:alpine
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### 3. Install Go 1.21+
Download from https://golang.org/dl/

## Quick Start

### 1. Clone and Setup
```bash
cd autoboy-go/autoboy-backend
go mod tidy
```

### 2. Environment Configuration
Create `.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/autoboy
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Server
PORT=8080
GIN_MODE=debug

# Optional Services (can be empty for testing)
EMAIL_SERVICE_API_KEY=
SMS_SERVICE_API_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Initialize Database
```bash
go run scripts/init_db.go
```

### 4. Start Server
```bash
go run main.go
```

Server will start at `http://localhost:8080`

## Test Accounts

After running `init_db.go`, you'll have:

**Admin Account:**
- Email: `admin@autoboy.ng`
- Password: `Admin123!`
- Type: Admin

**Sample Seller:**
- Email: `seller@autoboy.ng`
- Password: (auto-generated, create new via registration)
- Type: Seller

## API Testing

### 1. Health Check
```bash
curl http://localhost:8080/health
```

### 2. Register New User
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "phone": "+2348123456789",
    "first_name": "Test",
    "last_name": "User",
    "user_type": "buyer",
    "accept_terms": true
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### 4. Get Categories
```bash
curl http://localhost:8080/api/v1/categories/
```

### 5. Get Products
```bash
curl http://localhost:8080/api/v1/products/
```

## Database Collections

After initialization, you'll have:
- **categories**: 5 default categories
- **products**: 2 sample products
- **users**: 1 admin user + 1 sample seller

## Development Workflow

### 1. Make Changes
Edit Go files in the project

### 2. Restart Server
```bash
# Stop with Ctrl+C, then:
go run main.go
```

### 3. Test with Postman
Import the `AutoBoy_API_Collection.postman_collection.json` file

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongo --eval "db.adminCommand('ismaster')"

# Or with mongosh (newer versions)
mongosh --eval "db.adminCommand('ismaster')"
```

### Port Already in Use
```bash
# Kill process on port 8080
# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8080 | xargs kill -9
```

### Go Module Issues
```bash
go clean -modcache
go mod download
go mod tidy
```

## Production Deployment

### Environment Variables
Set these for production:
```env
GIN_MODE=release
JWT_SECRET=very-long-random-secret-key
MONGODB_URI=mongodb://production-server:27017/autoboy
PAYSTACK_SECRET_KEY=sk_live_your_live_key
CLOUDINARY_CLOUD_NAME=your_production_cloud
```

### Build Binary
```bash
go build -o autoboy-api main.go
./autoboy-api
```

## Docker Setup (Alternative)

### docker-compose.yml
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
  
  api:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - mongodb
      - redis
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/autoboy
      - REDIS_URL=redis://redis:6379

volumes:
  mongodb_data:
```

### Run with Docker
```bash
docker-compose up -d
```

## Monitoring

### View Logs
```bash
# In development
tail -f logs/app.log

# With Docker
docker-compose logs -f api
```

### Database Queries
```bash
# Connect to MongoDB
mongosh autoboy

# View collections
show collections

# Count documents
db.users.countDocuments()
db.products.countDocuments()
db.categories.countDocuments()
```