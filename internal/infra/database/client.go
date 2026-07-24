package database

import (
	"context"
	"fmt"

	"projecttemp/ent"

	_ "github.com/lib/pq"
)

type DB struct {
	Client *ent.Client
}

func New() (*DB, error) {
	cfg, err := loadConfig()
	if err != nil {
		return nil, err
	}
	client, err := ent.Open("postgres", cfg.DSN())
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
