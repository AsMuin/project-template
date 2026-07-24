package redis

import "projecttemp/internal/config"

type redisConfig struct {
	Host     string
	Port     string
	Password string
}

func loadConfig() *redisConfig {
	config.LoadEnv()

	return &redisConfig{
		Host:     config.GetEnv("REDIS_HOST", "localhost"),
		Port:     config.GetEnv("REDIS_PORT", "6379"),
		Password: config.GetEnv("REDIS_PASSWORD", ""),
	}
}
