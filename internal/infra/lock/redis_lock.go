package lock

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"time"

	"projecttemp/internal/port"

	"github.com/redis/go-redis/v9"
)

var script = `
		if redis.call("get", KEYS[1]) == ARGV[1] then
			return redis.call("del", KEYS[1])
		else
			return 0
		end
	`

// RedisLocker Redis 分布式锁实现，满足 port.Locker。
type RedisLocker struct {
	client redis.UniversalClient
}

// New 实例化 Redis 锁组件。
func New(client redis.UniversalClient) *RedisLocker {
	return &RedisLocker{
		client: client,
	}
}

// RunWithLock 核心逻辑：获取锁 -> 执行函数 -> 安全释放锁。
func (l *RedisLocker) RunWithLock(ctx context.Context, key string, ttl time.Duration, fn func() error) error {
	// 1. 生成唯一的锁标识（防止误删别人加的锁）
	token := generateToken()

	// 2. 尝试抢锁 (SET key token EX ttl NX)
	ok, err := l.client.SetNX(ctx, key, token, ttl).Result()
	if err != nil {
		return err // Redis 故障
	}
	if !ok {
		return port.ErrLockFailed // 被其他节点抢走了
	}

	// 3. 无论业务执行成功与否，必须保证释放锁
	defer l.safeUnlock(ctx, key, token)

	// 4. 抢到锁，执行真正的业务逻辑
	return fn()
}

// safeUnlock 使用 Lua 脚本安全解锁。
func (l *RedisLocker) safeUnlock(ctx context.Context, key, token string) {
	// Lua 脚本语义：如果 Redis 里的值等于我的 token，才执行删除。保证原子性。
	_ = l.client.Eval(ctx, script, []string{key}, token).Err()
}

// generateToken 生成 16 字节的随机字符串作为锁的 value。
func generateToken() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
