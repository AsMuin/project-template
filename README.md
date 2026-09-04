# Go Web 后端工程模板

基于 **Echo + Ent + Postgres + Redis** 的标准 Go Web 服务骨架。  
本仓库**不含具体业务模块**，只保留可复用的工程分层、基础设施与协作约定，便于在此基础上接入自有领域。

---

## 1. 设计目标（为什么这样拆）

| 目标         | 做法                                                            |
| ------------ | --------------------------------------------------------------- |
| 业务可扩展   | 用例与 `*Request` 在 `app/`；领域+repo 在 `module/`                |
| 依赖清晰     | app/module 依赖 `port`；不直接依赖 Redis/DB 实现细节               |
| 改动半径可控 | HTTP 在 `httpapi/api`；用例在 app；持久化在 module                 |
| 跨域强一致   | app 内 `TxManager.WithinTx` + 多 Repository；`ClientFrom`          |
| 入口干净     | `cmd/*` 只做装配与生命周期，不写业务规则                           |
| 公共代码克制 | `pkg` 只放与具体业务无关的工具；业务逻辑不要下沉                   |

一句话：**用例与 Request 进 app，领域与 repo 进 module，HTTP 进 httpapi/api，能力进 port，实现进 infra，工具进 pkg，cmd 装配。**

---

## 2. 目录结构

```text
.
├── cmd/
│   └── server/          # HTTP API 入口（装配 DB/Redis/路由/定时任务）
├── docs/
│   └── api/swagger/     # OpenAPI 生成物（Swagger UI 读这里）
├── ent/
│   └── schema/          # 手写 ent schema（改表结构只动这里，再 generate）
├── internal/
│   ├── module/          # ★ 领域实体 + Repository + repo（无 Service/HTTP）
│   ├── app/             # ★ 全部应用用例 + *Request
│   ├── httpapi/         # ★ 协议基建 + api/* Handler（只依赖 app）
│   ├── port/            # 跨模块技术端口（Cache、Locker、TxManager）
│   ├── infra/           # 基础设施实现（DB/Tx、Redis、缓存、锁、定时器）
│   ├── pkg/             # 公共库（logger、分页、统一响应）
│   └── config/          # 环境变量加载
├── docker-compose.yml       # 公共底座：postgres / redis / app
├── docker-compose.dev.yml   # 开发叠加：暴露依赖端口，默认不起 app
├── Dockerfile
├── .env.example
└── test/                # 集成/连通类测试（可选）
```

### 各层职责

| 路径                | 职责                                  | 典型改动                       |
| ------------------- | ------------------------------------- | ------------------------------ |
| `cmd/server`        | 组装依赖、启停 HTTP/cron、`logger.Init` | 新模块/app 注入、新定时任务     |
| `internal/module/*` | 实体、领域工具、Repository、repo      | 无用例 Service                   |
| `internal/app/*`    | **全部**用例 + `*Request` + 跨域事务  | auth/user/payment/membership     |
| `internal/httpapi`  | middleware/binding；`api/*`→app only | Handler 不依赖 module.Service    |
| `internal/port`     | Cache / Locker / **TxManager** 等抽象 | 新增跨模块技术能力时扩接口       |
| `internal/infra`    | 上述端口的 Redis/DB/Tx/cron 实现      | 换客户端、调连接与中间件配置     |
| `internal/pkg`      | logger、分页、错误码与响应体          | 真正跨业务复用时才加            |
| `ent/schema`        | 表结构与字段约束（全局一份，同库）    | 加字段、改索引后 `go generate`   |

更细的模块约定见：[`internal/module/README.md`](internal/module/README.md)  
跨域用例约定见：[`internal/app/README.md`](internal/app/README.md)  
**HTTP 方案 C**见：[`docs/HTTP_LAYOUT.md`](docs/HTTP_LAYOUT.md)  
**事务与跨 module 一致性**见：[`docs/TRANSACTIONS.md`](docs/TRANSACTIONS.md)  
公共库约定见：[`internal/pkg/README.md`](internal/pkg/README.md)  
结构化日志见：[`internal/pkg/logger/README.md`](internal/pkg/logger/README.md)  
Redis / 缓存能力见：[`docs/REDIS_CACHE.md`](docs/REDIS_CACHE.md)  
Schema 约定见：[`ent/schema/README.md`](ent/schema/README.md)

---

## 3. 依赖方向（必读）

```text
cmd/server
    │
    ▼
 httpapi  (RouteRegistrar…)
    │
    ├─ httpapi/api/auth        → app/auth
    ├─ httpapi/api/user        → app/user
    ├─ httpapi/api/payment     → app/payment
    └─ httpapi/api/membership   → app/membership
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
              module repos   port.TxManager
                    │           │
                    └──── ClientFrom(ctx) 同一 ent Tx
                    ▲
 infra 实现 port（TxManager / Cache / Locker …）
```

**规则：**

1. **HTTP 只在 `httpapi`**；Handler **只依赖 app**（方案 C）。  
2. **用例只在 `app`**；`*Request` 放 app，Handler 直接 Bind。  
3. **module 无 Service**：仅实体、领域工具、Repository、repo。  
4. `app` 依赖 module 接口与 `port`；**不要** import `infra` / `httpapi`。  
5. `module/*/repo` 用 `ClientFrom`；事务仅在 app `WithinTx`。  
6. `module` **不**依赖 `app`。

---

## 4. 请求怎么走（心智模型）

以接入一个业务接口为例：

```text
POST /api/payments
  → httpapi/api/payment.Handler
  → Bind app/payment.CreateRequest
  → app/payment.Service → module/payment.Repository

POST /api/membership/activate
  → Bind app/membership.ActivateRequest
  → app/membership.Service.WithinTx
       → payment.Repository + user.Repository
```

定时任务直接调 **app** 用例；HTTP 只在 httpapi。

---

## 5. 本地开发

### 5.1 依赖

- Go（版本见 `go.mod`）
- Docker（可选，用于 Postgres / Redis）

### 5.2 基础设施

```bash
# 本地默认即可跑：代码默认 localhost + postgres/postgres，与 compose 一致
# 仅启动 Postgres + Redis（本机 go run 使用；宿主端口固定 5432/6379）
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 可选：容器内全栈（app 也进 compose，需 --profile full）
# docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile full up -d --build

# 需要覆盖密钥 / 远端地址 / 日志时再复制（契约见 .env.example）
# cp .env.example .env
```

**环境变量分层：**

| 场景 | 需要什么 |
| ---- | -------- |
| 本机 `go run` + compose 依赖 | 通常 **不用** `.env`（默认 `DB_HOST/REDIS_HOST=localhost`） |
| compose 内 `app` | compose **写死** `DB_HOST=postgres`、`REDIS_HOST=redis`；账号等来自 env / `.env` |
| 生产 / 预发 | 注入 `.env.example` 中的运行时项（库账号、主机、Redis、日志等） |

开发期几乎不改的宿主端口映射已写死在 `docker-compose.dev.yml`，不再做成 `*_HOST_PORT` 配置项。

### 5.3 运行 API

```bash
# 生产/预发常见覆盖见 .env.example（LOG_LEVEL / ENV / SERVICE_NAME / DB_* / REDIS_* …）
go run ./cmd/server
# 默认 :8080
# 健康检查：http://localhost:8080/health
# Swagger UI：http://localhost:8080/swagger/index.html
# 生成物目录：docs/api/swagger（import: projecttemp/docs/api/swagger）
```

访问日志来自 **`httpapi/middleware.AccessLog`**（Echo RequestLogger → `pkg/logger`，event=`http.access`）；业务 / 任务 / 审计同样走 `internal/pkg/logger`（stderr）。HTTP 错误经 **`httpapi.HTTPErrorHandler`** 统一写 JSON。详见 [logger README](internal/pkg/logger/README.md)。

### 5.4 常用命令

```bash
go build ./...
go test ./...   # test/ 包需要本机 Postgres（见 5.2）

# 修改 ent/schema 后重新生成
go generate ./ent

# 业务 Handler 写好 Swagger 注释后重新生成文档
swag init -g cmd/server/main.go -o docs/api/swagger --parseDependency --parseInternal
```

---

## 6. 如何接入一个新功能

### A. 新增业务模块（单域，推荐路径）

1. `module/<name>/`：实体 + Repository + repo（`ClientFrom`）。  
2. `app/<name>/`：`*Request` + Service 用例。  
3. `httpapi/api/<name>/`：Handler + Registrar（只依赖 app）。  
4. `ent/schema` + `go generate`（如需新表）。  
5. `cmd` 注入 repo → app，注册 Registrar。  

### B. 在已有模块内加接口

1. `module/<name>`：模型 / Service 方法 / 如需则扩展 `Repository` 接口。  
2. `module/<name>/repo`：实现仓储方法（走 `ClientFrom`）。  
3. `httpapi/api/<name>`：Handler + Swagger + `Registrar.RegisterRoutes`。  
4. `cmd`：把新 Registrar 加入 `RegisterRouter`（注意是否需 `AuthRequired`）。  

### C. 跨 module 原子用例（强一致写）

1. 在 `internal/app/<usecase>/` 编写应用服务，注入 `port.TxManager` + 各 module 的 **Repository 接口**。  
2. 入口方法内 `tx.WithinTx(ctx, func(ctx) error { ... })`。  
3. 在 `internal/httpapi/api/<usecase>/` 写 Handler，**只依赖 app.Service**。  
4. `cmd` 装配 TxManager / repos / app.Service，并注册对应 Registrar。  
5. 详见 [docs/TRANSACTIONS.md](docs/TRANSACTIONS.md)、[docs/HTTP_LAYOUT.md](docs/HTTP_LAYOUT.md)。

### D. 需要缓存 / 分布式锁 / 事务

- 缓存 / 锁：业务侧 `port.Cache` / `port.Locker`；实现在 `infra/cache`、`infra/lock`。  
- 事务：业务/app 侧 `port.TxManager`；实现在 `infra/database`（`NewTxManager`）。  
- Service / app **不要** import infra；仅 `repo` 为参与事务可使用 `database.ClientFrom`。

---

## 7. 放哪里？快速判定

| 你要加的内容                         | 放哪里                           |
| ------------------------------------ | -------------------------------- |
| 领域实体、Repo、领域工具             | `module/<name>/`                 |
| 用例 Service 与 `*Request`           | `app/<name>/`                    |
| HTTP Handler / 路由                  | `httpapi/api/<name>/`            |
| 全局 RegisterRouter、鉴权中间件      | `httpapi`                        |
| 「我需要锁/缓存/事务，不关心实现」   | `port` 接口 + `infra` 实现       |
| 分页、统一 JSON 响应、跨模块基础类型 | `pkg`                            |
| 结构化业务/任务/审计日志             | `pkg/logger`（Service/Job 打点） |
| 仅某一业务用的算法                   | 留在该 `module`，不要进 `pkg`    |
| 表结构（同库共享）                   | `ent/schema`                     |
| 进程启动参数、组装顺序               | `cmd/*`                          |

---

## 8. 协作约定（简）

1. **优先在对应 module 内闭环**；跨模块只读/非原子走 Service；跨模块强一致写走 **app + TxManager**。  
2. **生成代码**（`ent/*` 非 schema、`docs/api/swagger`）不要手改业务逻辑；改源再生成。  
3. **PR 粒度**：一个业务能力尽量带齐 service + handler + repo（及必要测试），便于评审。  
4. **命名**：新 module / app 用例用小写业务名；HTTP 子包可用 `userhttp` 这类包名，避免与 `net/http` 冲突。  
5. **日志**：新写路径用 `logger.Module` + `purpose` + 稳定 `event`；可预期 `BizError` 不打 Error；系统错误由 `httpapi.HTTPErrorHandler` 边界记一次（见 [logger README](internal/pkg/logger/README.md)）。  
6. **HTTP**：Handler 成功 `return c.JSON(http.StatusOK, response.OK(data))`；失败 `return err`（`BizError` / bind / validate），由全局错误处理写成统一响应体。  
7. **事务**：repo 必须 `ClientFrom`；只在用例入口 `WithinTx`；事务内不做远程 IO（见 [TRANSACTIONS](docs/TRANSACTIONS.md)）。

---

## 9. 相关文档索引

| 文档                                                           | 内容                                |
| -------------------------------------------------------------- | ----------------------------------- |
| [internal/module/README.md](internal/module/README.md)         | 业务模块目录约定                      |
| [internal/app/README.md](internal/app/README.md)               | 跨 module 应用层约定                  |
| [docs/HTTP_LAYOUT.md](docs/HTTP_LAYOUT.md)                     | **HTTP 方案 C（传输层集中）**         |
| [docs/TRANSACTIONS.md](docs/TRANSACTIONS.md)                   | **本地事务与跨 module 一致性**        |
| [internal/pkg/README.md](internal/pkg/README.md)               | 公共库边界                            |
| [internal/pkg/logger/README.md](internal/pkg/logger/README.md) | **结构化日志约定与 event 表**         |
| [docs/REDIS_CACHE.md](docs/REDIS_CACHE.md)                     | **项目级 Redis / 缓存策略**（总览）   |
| [ent/schema/README.md](ent/schema/README.md)                   | Schema 与 generate 约定               |

有疑问时：先看依赖图（第 3 节）和「放哪里」（第 7 节），再按第 6 节接入 module 或跨域 app 用例。
