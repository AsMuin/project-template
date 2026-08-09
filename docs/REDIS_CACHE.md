# Redis 缓存策略说明

本文描述模板中 **已落地** 的 Redis 使用方式与缓存能力，供协作与排障对照。  
具体业务 key / TTL 由各 `module` 自行约定（可在模块内另写 `CACHE.md`）。

---

## 1. 总览：Redis 在本项目中的三种角色

| 角色             | 用途                       | 主要代码                     | 说明                         |
| ---------------- | -------------------------- | ---------------------------- | ---------------------------- |
| **业务缓存**     | 读穿写缓存、防击穿         | `infra/cache` + `port.Cache` | 业务按需注入使用             |
| **Session 存储** | 登录态                     | `infra/redis/session.go`     | Echo + gorilla/sessions + Redis store |
| **分布式锁**     | 跨实例互斥                 | `infra/lock` + `port.Locker` | SetNX / Lua 释放             |

```text
                    ┌─────────────────────────────────────┐
                    │              Redis 实例              │
                    │  (同一 Host/Port，见环境变量)        │
                    └─────────────────────────────────────┘
                       ▲              ▲              ▲
                       │              │              │
              ┌────────┴───┐   ┌──────┴──────┐  ┌───┴────────┐
              │ 业务 Client │   │ Session 池  │  │ 同上 Client │
              │ go-redis    │   │ redistore   │  │ (锁复用)    │
              └────────┬───┘   └──────┬──────┘  └─────┬──────┘
                       │              │                │
              ┌────────┴───┐   ┌──────┴──────┐  ┌─────┴──────┐
              │ port.Cache │   │ Echo Session│  │ port.Locker│
              │ + L1 TinyLFU│   │ cookie 会话 │  │ SetNX/Lua  │
              └────────────┘   └─────────────┘  └────────────┘
```

要点：

- **业务缓存与锁**共用 `cmd/server` 里创建的同一个 `redis.Client`。
- **Session** 通过 `redis.NewSessionStore` **另开连接池**，不是同一 Client 对象。
- 业务层只依赖 `port.Cache` / `port.Locker`，不直接 import Redis 实现细节。

---

## 2. 连接与客户端

### 2.1 业务客户端

| 项       | 当前实现                                                               |
| -------- | ---------------------------------------------------------------------- |
| 创建     | `internal/infra/redis.NewClient`                                       |
| 配置来源 | `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD`                         |
| 显式配置 | 仅 `Addr`、`Password`                                                  |
| 连接池等 | **未自定义**，使用 go-redis 默认                                       |
| 启动探测 | `Ping`，超时 5s                                                        |

### 2.2 Session 客户端

| 项        | 当前实现                                                            |
| --------- | ------------------------------------------------------------------- |
| 创建      | `redis.NewSessionStore(redisCfg, sessionCfg)` → `redistore.NewRediStore`（gorilla Store） |
| Secret    | `session.secret` / `APP_SESSION_SECRET`                               |
| MaxAge    | `session.max_age`（秒）/ `APP_SESSION_MAX_AGE`                        |
| Secure    | `session.secure` / `APP_SESSION_SECURE`                               |
| Cookie 名 | `session`（`middleware.SessionName`，经 echo-contrib session 中间件） |

---

## 3. 业务缓存（port.Cache）

| 能力 | 说明 |
| ---- | ---- |
| `Once` | key 存在则填充 `dst`；否则执行 `do`、缓存结果（同 key 并发只算一次） |
| `Delete` | 删除一个或多个 key |
| `port.TryFetch[T]` | 带类型的读穿写封装；`c == nil` 时直接执行 `do` |

实现位于 `infra/cache`：Redis 二级 + 进程内 L1（TinyLFU）。  
**Key 前缀、TTL、失效时机由业务 module 定义**，模板不预设业务 key。

---

## 4. 分布式锁（port.Locker）

| 能力 | 说明 |
| ---- | ---- |
| `RunWithLock` | 尝试获取锁并执行 `fn`；获取失败立即返回 `port.ErrLockFailed`（不阻塞） |

实现位于 `infra/lock`（Redis SetNX + 持有 token 的 Lua 释放）。  
典型场景：定时任务互斥、热点写路径串行化。

---

## 5. 业务接入建议

1. 在 `cmd/server` 创建 `cache.New` / `lock.New`，注入到 `module` 的 `NewService`。  
2. **不要**在 module 内 import `infra/redis`。  
3. key 命名建议带业务前缀，例如 `app:<domain>:<id>`，并设合理 TTL。  
4. 在线路径与预热 / 异步路径若共用同一缓存语义，请保证候选集 / 写入条件一致。  
5. 复杂缓存策略可在对应 module 下新增 `CACHE.md` 说明。

---

## 6. 相关代码

| 路径 | 内容 |
|------|------|
| `internal/port/cache.go` | Cache 接口与 `TryFetch` |
| `internal/port/lock.go` | Locker 接口 |
| `internal/infra/cache` | 缓存实现 |
| `internal/infra/lock` | 分布式锁实现 |
| `internal/infra/redis` | Client / Session store |
