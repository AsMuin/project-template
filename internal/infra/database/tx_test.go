package database

import (
	"context"
	"testing"

	"projecttemp/ent"
)

func TestClientFrom_FallbackAndOverride(t *testing.T) {
	t.Parallel()

	var fallback ent.Client
	var txClient ent.Client

	if got := ClientFrom(context.Background(), &fallback); got != &fallback {
		t.Fatalf("expected fallback client")
	}

	ctx := context.WithValue(context.Background(), txCtxKey{}, &txClient)
	if got := ClientFrom(ctx, &fallback); got != &txClient {
		t.Fatalf("expected tx client from context")
	}
}

func TestWithinTx_NilManager(t *testing.T) {
	t.Parallel()

	var m *txManager
	err := m.WithinTx(context.Background(), func(context.Context) error { return nil })
	if err == nil {
		t.Fatal("expected error for nil manager")
	}
}
