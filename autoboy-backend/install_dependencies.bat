@echo off
echo AutoBoy Backend Dependency Installation
echo =====================================
echo.

:: Check if Go is installed
go version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Go is not installed or not in PATH
    echo Please install Go from: https://golang.org/dl/
    echo Or add Go to your PATH environment variable
    pause
    exit /b 1
)

echo ✅ Go is installed
go version
echo.

:: Navigate to backend directory
cd /d "%~dp0"
echo Current directory: %cd%
echo.

:: Initialize Go module if not exists
if not exist "go.mod" (
    echo Initializing Go module...
    go mod init autoboy-backend
)

:: Download dependencies
echo Installing Go dependencies...
go mod tidy

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

:: Create .env file if not exists
if not exist ".env" (
    echo Creating .env file from template...
    copy ".env.example" ".env"
    echo ⚠️  Please edit .env file with your configuration
    echo.
)

:: Create logs directory
if not exist "logs" (
    echo Creating logs directory...
    mkdir logs
)

:: Create uploads directory
if not exist "uploads" (
    echo Creating uploads directory...
    mkdir uploads
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Install and start MongoDB
echo 2. Edit .env file if needed
echo 3. Run: go run scripts/init_db.go
echo 4. Run: go run scripts/verify_setup.go
echo.
pause