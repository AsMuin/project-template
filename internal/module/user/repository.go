package user

import (
	"context"
	"errors"
)

// ErrAccountConflict 账号唯一约束冲突（并发注册等）。
var ErrAccountConflict = errors.New("account conflict")

// Repository 用户持久化端口。
type Repository interface {
	Create(ctx context.Context, in CreateRepoParams) (*User, error)
	FindByID(ctx context.Context, id int64) (*User, error)
	FindByAccount(ctx context.Context, account string) (*UserWithSecret, error)
	Update(ctx context.Context, id int64, in UpdateRepoParams) (*User, error)
	// SetVIP 设置会员标记；供跨域支付升会员等用例复用（可走外层事务 ctx）。
	SetVIP(ctx context.Context, id int64, vip bool) (*User, error)
	ExistsAccount(ctx context.Context, account string) (bool, error)
}

// CreateRepoParams 仓储创建参数（已哈希密码）。
type CreateRepoParams struct {
	Account      string
	Nickname     string
	PasswordHash string
	Email        *string
	Avatar       *string
	Age          *int
	Gender       Gender
}

// UpdateRepoParams 仓储更新参数。
type UpdateRepoParams struct {
	Nickname     *string
	PasswordHash *string
	Email        *string
	Avatar       *string
	Age          *int
	Gender       *Gender
	VIP          *bool
}

// UserWithSecret 含密码哈希，仅限 Service 校验登录使用，禁止直接作为 API 响应。
type UserWithSecret struct {
	User
	PasswordHash string
}
