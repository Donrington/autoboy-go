package services

import (
	"context"
	"encoding/json"
	"time"

	"autoboy-backend/config"
)

type CacheService struct{}

func NewCacheService() *CacheService {
	return &CacheService{}
}

func (s *CacheService) Set(key string, value interface{}, expiration time.Duration) error {
	if config.RedisClient == nil {
		return nil // Skip if Redis not available
	}

	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return config.RedisClient.Set(context.Background(), key, data, expiration).Err()
}

func (s *CacheService) Get(key string, dest interface{}) error {
	if config.RedisClient == nil {
		return nil // Skip if Redis not available
	}

	data, err := config.RedisClient.Get(context.Background(), key).Result()
	if err != nil {
		return err
	}

	return json.Unmarshal([]byte(data), dest)
}

func (s *CacheService) Delete(key string) error {
	if config.RedisClient == nil {
		return nil // Skip if Redis not available
	}

	return config.RedisClient.Del(context.Background(), key).Err()
}