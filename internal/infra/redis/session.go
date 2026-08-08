package redis

import (
	"fmt"
	"projecttemp/internal/config"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/redis"
)

const defaultSecret = "change-me-session-secret"

func NewSessionStore(config *config.RedisConfig) (sessions.Store, error) {
	addr := fmt.Sprintf("%s:%v", config.Host, config.Port)

	store, err := redis.NewStore(10, "tcp", addr, "", config.Password, []byte(defaultSecret))
	if err != nil {
		return nil, fmt.Errorf("connect redis: %w", err)
	}

	return store, nil
}
