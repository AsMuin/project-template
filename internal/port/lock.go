package port

import (
	"context"
	"errors"
	"time"
)

// ErrLockFailed 表示未能获取分布式锁（已被其他节点占用）。
var ErrLockFailed = errors.New("获取分布式锁失败")

// Locker 分布式锁端口：尝试获取锁并执行业务逻辑。
type Locker interface {
	// RunWithLock 尝试获取锁并执行 fn；获取不到锁时立即返回 ErrLockFailed，不阻塞。
	RunWithLock(ctx context.Context, key string, ttl time.Duration, fn func() error) error
}
