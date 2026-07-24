package port

import (
	"context"
	"time"
)

// Cache 通用缓存端口：读穿写与删除。由 infra 实现，业务只依赖本接口。
type Cache interface {
	// Once 若 key 存在则写入 dst；否则执行 do、缓存结果并写入 dst。同 key 并发只算一次。
	Once(ctx context.Context, key string, ttl time.Duration, dst any, do func() (any, error)) error
	// Delete 删除一个或多个缓存 key。
	Delete(ctx context.Context, keys ...string) error
}

// TryFetch 带类型的缓存读取封装：命中则反序列化返回，未命中则执行 do 并写入缓存。
// c 为 nil 时直接执行 do，便于测试或降级。
func TryFetch[T any](ctx context.Context, c Cache, key string, ttl time.Duration, do func() (T, error)) (T, error) {
	if c == nil {
		return do()
	}

	var dst T
	err := c.Once(ctx, key, ttl, &dst, func() (any, error) {
		return do()
	})
	return dst, err
}
