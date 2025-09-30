# AutoBoy Backend Setup Guide

## Prerequisites Installation

### 1. MongoDB Installation (Windows)

#### Option A: MongoDB Community Edition
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Choose "Windows x64" and download the MSI installer
3. Run the installer with these options:
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service
   - Install MongoDB Compass (GUI tool)
4. Add MongoDB to PATH:
   - Open System Environment Variables
   - Add `C:\Program Files\MongoDB\Server\7.0\bin` to PATH
   - Restart command prompt/PowerShell

#### Option B: Using Chocolatey (If you have Chocolatey)
```powershell
choco install mongodb
```

#### Option C: Using Docker (Alternative)
```powershell
docker run --name autoboy-mongo -p 27017:27017 -d mongo:latest
```

### 2. Go Installation Verification

Since you mentioned Go 1.25.1 is installed globally, let's verify the PATH:

1. Open PowerShell as Administrator
2. Run: `go version`
3. If not found, add Go to PATH:
   - Find Go installation (usually `C:\Program Files\Go\bin`)
   - Add to System PATH environment variable
   - Restart PowerShell

### 3. Environment Setup

Create a `.env` file in the backend directory with:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=autoboy
MONGODB_MAX_POOL_SIZE=100
MONGODB_MIN_POOL_SIZE=5
JWT_SECRET=your-super-secret-jwt-key-here
BCRYPT_COST=12
SESSION_SECRET=your-session-secret-here
```

## Quick Setup Commands

After installing MongoDB and verifying Go is in PATH:

```powershell
# Navigate to backend directory
cd "C:\Users\Windows\Desktop\MyProjects\autoboy_react\autoboy-backend"

# Install Go dependencies
go mod tidy

# Start MongoDB (if not running as service)
# mongod --dbpath C:\data\db

# Initialize database
go run scripts/init_db.go

# Verify setup
go run scripts/verify_setup.go
```

## Verification Steps

1. **MongoDB Connection**: Run `mongo` or `mongosh` to connect
2. **Go Modules**: Run `go mod tidy` without errors
3. **Database**: Collections should be created after running init script
4. **Admin User**: Login with admin@autoboy.com / admin123

## Troubleshooting

### MongoDB Issues
- **Service not starting**: Check Windows Services for "MongoDB"
- **Connection refused**: Ensure MongoDB is running on port 27017
- **Permission errors**: Run as Administrator

### Go Issues
- **Command not found**: Verify Go is in PATH
- **Module errors**: Ensure you're in the correct directory
- **Build fails**: Check Go version compatibility

### Database Issues
- **Collections not created**: Check MongoDB connection string
- **Admin user exists**: Script skips creation if already exists
- **Index errors**: Ensure MongoDB is running before creating indexes

## Next Steps

After successful setup:
1. Run the initialization script
2. Start the backend server
3. Test API endpoints
4. Connect to React frontend

## Support

If you encounter issues:
1. Check the logs in `logs/` directory
2. Verify all prerequisites are installed
3. Ensure MongoDB is running
4. Check environment variables are set correctly