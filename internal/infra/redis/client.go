package redis

import (
	"context"
	"fmt"
	"projecttemp/internal/config"
	"time"

	"github.com/redis/go-redis/v9"
)

func NewClient(config *config.RedisConfig) (*redis.Client, error) {
	addr := fmt.Sprintf("%s:%v",
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
