package database

import (
	"fmt"
	"projecttemp/internal/config"
)

type Config struct {
	Host     string
	Port     string
	Username string
	Password string
	DBName   string
}

func (c *Config) DSN() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		c.Host, c.Port, c.Username, c.Password, c.DBName)
}

func loadConfig() (*Config, error) {
	config.LoadEnv()

	return &Config{
		Host:     config.GetEnv("DB_HOST", "localhost"),
		Port:     config.GetEnv("POSTGRES_PORT", "5432"),
		Username: config.GetEnv("POSTGRES_USER", "postgres"),
		Password: config.GetEnv("POSTGRES_PASSWORD", "postgres"),
		DBName:   config.GetEnv("POSTGRES_DB", "projecttemp_db"),
	}, nil
}
