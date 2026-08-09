package database

import (
	"context"
	"fmt"

	"projecttemp/ent"
	"projecttemp/internal/config"

	_ "github.com/lib/pq"
)

type DB struct {
	Client *ent.Client
}

func New(config *config.DatabaseConfig) (*DB, error) {

	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		config.Host, config.Port, config.User, config.Password, config.DBName)

	client, err := ent.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}
	return &DB{Client: client}, nil
}

func (db *DB) Migrate(ctx context.Context) error {
	return db.Client.Schema.Create(ctx)
}

func (db *DB) Close() error {
	if db.Client != nil {
		return db.Client.Close()
	}
	return nil
}
