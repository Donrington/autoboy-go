# AutoBoy API Makefile

.PHONY: help install dev build test clean init-db docker-up docker-down

# Default target
help:
	@echo "AutoBoy API Development Commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make init-db    - Initialize database with sample data"
	@echo "  make dev        - Run development server"
	@echo "  make build      - Build production binary"
	@echo "  make test       - Run tests"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make docker-up  - Start services with Docker"
	@echo "  make docker-down - Stop Docker services"

# Install dependencies
install:
	go mod download
	go mod tidy

# Initialize database
init-db:
	@echo "Initializing database..."
	go run scripts/init_db.go

# Run development server
dev:
	@echo "Starting development server..."
	go run main.go

# Build production binary
build:
	@echo "Building production binary..."
	CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o autoboy-api main.go

# Run tests
test:
	go test -v ./...

# Clean build artifacts
clean:
	go clean
	rm -f autoboy-api

# Start Docker services
docker-up:
	docker-compose up -d

# Stop Docker services
docker-down:
	docker-compose down

# Quick setup for new developers
setup: install init-db
	@echo "Setup complete! Run 'make dev' to start the server."