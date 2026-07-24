package redis

import (
	"fmt"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/redis"
)

const defaultSecret = "change-me-session-secret"

func NewSessionStore() (sessions.Store, error) {
	cfg := loadConfig()

	addr := fmt.Sprintf("%s:%s", cfg.Host, cfg.Port)

	store, err := redis.NewStore(10, "tcp", addr, "", cfg.Password, []byte(defaultSecret))
	if err != nil {
		return nil, fmt.Errorf("connect redis: %w", err)
	}

	return store, nil
}
