package payment

import (
	"context"
	"errors"
)

// ErrInvalidTransition 非法状态流转（如非 pending 再 MarkPaid）。
var ErrInvalidTransition = errors.New("invalid payment status transition")

// Repository 支付单持久化端口。
type Repository interface {
	Create(ctx context.Context, in CreateRepoParams) (*Payment, error)
	FindByID(ctx context.Context, id int64) (*Payment, error)
	// MarkPaid 将 pending → paid；幂等：已是 paid 则返回当前单；其它状态返回 ErrInvalidTransition。
	MarkPaid(ctx context.Context, id int64) (*Payment, error)
	ListByUser(ctx context.Context, userID int64, limit int) ([]*Payment, error)
}

// CreateRepoParams 仓储创建参数。
type CreateRepoParams struct {
	UserID     int64
	Method     Method
	AmountCent int64
	Subject    string
}
