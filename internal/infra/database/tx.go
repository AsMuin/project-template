package database

import (
	"context"
	"fmt"

	"projecttemp/ent"
	"projecttemp/internal/port"
)

type txCtxKey struct{}

// txManager 基于 ent 的本地事务实现，满足 port.txManager。
type txManager struct {
	client *ent.Client
}

// NewTxManager 使用根 Client 创建事务管理器。
func NewTxManager(client *ent.Client) port.TxManager {
	return &txManager{client: client}
}

// ClientFrom 解析当前应使用的 ent Client：
// 若 ctx 由 WithinTx 注入了事务 Client 则用之，否则回退到 fallback（通常是进程级根 Client）。
// 所有 module/*/repo 写读均应经此函数取 Client，以便跨 module 共享事务。
func ClientFrom(ctx context.Context, fallback *ent.Client) *ent.Client {
	if c, ok := ctx.Value(txCtxKey{}).(*ent.Client); ok && c != nil {
		return c
	}
	return fallback
}

// WithinTx 实现 port.TxManager。
func (m *txManager) WithinTx(ctx context.Context, fn func(ctx context.Context) error) error {
	if m == nil || m.client == nil {
		return fmt.Errorf("database: nil tx manager")
	}
	// 已在事务中：复用，支持嵌套调用。
	if _, ok := ctx.Value(txCtxKey{}).(*ent.Client); ok {
		return fn(ctx)
	}

	tx, err := m.client.Tx(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}

	txCtx := context.WithValue(ctx, txCtxKey{}, tx.Client())
	if err := fn(txCtx); err != nil {
		if rbErr := tx.Rollback(); rbErr != nil {
			return fmt.Errorf("rollback after error: %v (original: %w)", rbErr, err)
		}
		return err
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit tx: %w", err)
	}
	return nil
}
