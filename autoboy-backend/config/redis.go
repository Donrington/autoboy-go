package config

import (
	"context"
	"fmt"
	"log"
	"time"

	"autoboy-backend/utils"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

// InitializeRedis initializes Redis connection
func InitializeRedis() error {
	redisURL := utils.GetEnv("REDIS_URL", "redis://localhost:6379")
	
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		return fmt.Errorf("failed to parse Redis URL: %w", err)
	}

	RedisClient = redis.NewClient(opt)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = RedisClient.Ping(ctx).Result()
	if err != nil {
		log.Printf("Warning: Redis connection failed: %v", err)
		return err
	}

	log.Println("Successfully connected to Redis")
	return nil
}

// CloseRedis closes Redis connection
func CloseRedis() error {
	if RedisClient != nil {
		return RedisClient.Close()
	}
	return nil
}