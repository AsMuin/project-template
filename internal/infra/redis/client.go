package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

func NewClient() (*redis.Client, error) {
	config := loadConfig()

	addr := fmt.Sprintf("%s:%s",
		config.Host,
		config.Port,
	)

	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: config.Password,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("connect redis: %w", err)
	}

	return client, nil
}
