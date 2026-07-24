package config

import (
	"os"
	"sync"

	"github.com/joho/godotenv"
)

var loadOnce sync.Once

func LoadEnv() {
	loadOnce.Do(func() {
		_ = godotenv.Load()
	})
}

func GetEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}

	return fallback
}
