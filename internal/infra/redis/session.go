package redis

import (
	"fmt"
	"net/http"

	"projecttemp/internal/config"

	"github.com/boj/redistore"
	"github.com/gorilla/sessions"
)

// NewSessionStore 创建基于 Redis 的 gorilla/sessions.Store，供 Echo session 中间件使用。
func NewSessionStore(redisCfg *config.RedisConfig, sessCfg config.SessionConfig) (sessions.Store, error) {
	sessCfg = sessCfg.Normalized()
	addr := fmt.Sprintf("%s:%d", redisCfg.Host, redisCfg.Port)

	store, err := redistore.NewRediStore(10, "tcp", addr, "", redisCfg.Password, []byte(sessCfg.Secret))
	if err != nil {
		return nil, fmt.Errorf("connect redis session store: %w", err)
	}

	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   sessCfg.MaxAge,
		HttpOnly: true,
		Secure:   sessCfg.Secure,
		SameSite: http.SameSiteLaxMode,
	}

	return store, nil
}
