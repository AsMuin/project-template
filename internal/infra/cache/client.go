package cache

import (
	"context"
	"math/rand"
	"time"

	"github.com/go-redis/cache/v9"
	"github.com/redis/go-redis/v9"
)

// RedisCache 基于 go-redis/cache 的两级缓存实现（进程内 TinyLFU + Redis）。
// 实现 port.Cache 接口。
type RedisCache struct {
	cache *cache.Cache
}

// New 创建 Redis 缓存客户端，并启用容量 1000、TTL 10 分钟的本地 L1 缓存。
func New(client redis.UniversalClient) *RedisCache {
	return &RedisCache{
		cache: cache.New(&cache.Options{
			Redis: client,
			// 在 redis 的基础上再加入内存缓存，允许 1000 个数据，过期时间十分钟
			LocalCache: cache.NewTinyLFU(1000, 10*time.Minute),
		}),
	}
}

// Once 缓存读穿写：命中直接反序列化到 dst，未命中执行 do 后写入（TTL 带抖动）。
func (c *RedisCache) Once(ctx context.Context, key string, ttl time.Duration, dst any, do func() (any, error)) error {
	return c.cache.Once(&cache.Item{
		Ctx:   ctx,
		Key:   key,
		Value: dst,
		TTL:   withJitter(ttl),
		Do: func(*cache.Item) (any, error) {
			return do()
		},
	})
}

// Delete 删除指定 key；忽略 cache miss。
func (c *RedisCache) Delete(ctx context.Context, keys ...string) error {
	for _, key := range keys {
		if err := c.cache.Delete(ctx, key); err != nil && err != cache.ErrCacheMiss {
			return err
		}
	}
	return nil
}

// withJitter 为 TTL 增加最多 20% 的随机缩短，避免大量 key 同时过期造成雪崩。
func withJitter(ttl time.Duration) time.Duration {
	if ttl <= 0 {
		return ttl
	}
	return ttl - time.Duration(rand.Int63n(int64(ttl/5)))
}
