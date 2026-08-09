# Go Web 后端工程模板

基于 **Echo + Ent + Postgres + Redis** 的标准 Go Web 服务骨架。  
本仓库**不含具体业务模块**，只保留可复用的工程分层、基础设施与协作约定，便于在此基础上接入自有领域。

---

## 1. 设计目标（为什么这样拆）

| 目标         | 做法                                                            |
| ------------ | --------------------------------------------------------------- |
| 业务可扩展   | 业务只放在 `internal/module/<name>/`，不在 `internal/` 顶层平铺 |
| 依赖清晰     | 业务依赖 `port` 接口，不直接依赖 Redis/DB 实现细节              |
| 改动半径可控 | 同一领域的 Handler / Service / Repo 集中在对应 module           |
| 入口干净     | `cmd/*` 只做装配与生命周期，不写业务规则                        |
| 公共代码克制 | `pkg` 只放与具体业务无关的工具；业务逻辑不要下沉                |

一句话：**业务进 module，协议进 httpapi，能力抽象进 port，技术细节进 infra，公共工具进 pkg，进程在 cmd 拧在一起。**

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
│   ├── module/          # ★ 业务模块（按领域垂直切片；模板默认为空）
│   ├── httpapi/         # 路由注册、鉴权中间件、健康检查
│   ├── port/            # 跨模块技术端口（Cache、Locker）
│   ├── infra/           # 基础设施实现（DB、Redis、缓存、锁、定时器）
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
| `cmd/server`        | 组装依赖、启停 HTTP/cron、`logger.Init` | 新模块注入、新定时任务       |
| `internal/module/*` | 领域模型、用例、该业务的 API 与持久化 | **日常业务开发主战场**         |
| `internal/httpapi`  | 挂路由、全局鉴权、健康检查            | 注册新 module 的路由           |
| `internal/port`     | Cache / Locker 等抽象                 | 新增跨模块技术能力时扩接口     |
| `internal/infra`    | 上述端口的 Redis/DB/cron 实现         | 换客户端、调连接与中间件配置   |
| `internal/pkg`      | logger、分页、错误码与响应体          | 真正跨业务复用时才加          |
| `ent/schema`        | 表结构与字段约束                      | 加字段、改索引后 `go generate` |

更细的模块约定见：[`internal/module/README.md`](internal/module/README.md)  
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
 httpapi  ──────────────────►  module/*/http
    │                               │
    │                               ▼
    │                          module/* (Service)
    │                               │
    │                    ┌──────────┼──────────┐
    │                    ▼          ▼          ▼
    │                  port        pkg     （其他 module 的 Service）
    │                    ▲
    │                    │ 实现
    └──────────────►  infra
```

**规则：**

1. `module` **不要** import `infra` 具体实现，只依赖 `port`（及 `pkg`）。
2. `infra` 实现 `port`；可依赖 `ent`、Redis 客户端等。
3. 跨业务模块：只调用对方 **Service 公开方法**，不要直接依赖对方 `repo`。
4. 避免循环依赖：鉴权在 `httpapi/middleware`，供 `module/*/http` 使用；路由装配在 `httpapi` 引用各模块 Handler。

---

## 4. 请求怎么走（心智模型）

以接入一个业务接口为例：

```text
POST /api/<resource>
  → httpapi 路由（可选 AuthRequired session）
  → module/<name>/http.Handler
  → <name>.Service.Xxx
       → Repository / port.Cache / port.Locker
  → infra 实际读写 DB / Redis
```

定时任务在 `cmd/server` 用 `infra/scheduler` 注册，**业务逻辑仍写在对应 module**。

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

### A. 新增业务模块（推荐路径）

1. 创建 `internal/module/<name>/`（建议拆 `http/`、`repo/`）。  
2. 在 `ent/schema` 增加表定义 → `go generate ./ent`（若仍保留占位实体，请先删除 `placeholder.go`）。  
3. 实现 Service / Repository / Handler。  
4. 在 `httpapi` 增加路由注册。  
5. 在 `cmd/server` 构造 Service 并注入（cache / lock 等按需）。  
6. 不要把该业务逻辑写进其他 module 或 `pkg`。

### B. 在已有模块内加接口

1. `module/<name>`：模型 / Service 方法 / 如需则扩展 `Repository` 接口。  
2. `module/<name>/repo`：实现仓储方法。  
3. `module/<name>/http`：Handler + Swagger 注释。  
4. `httpapi`：注册路由（注意是否需 `AuthRequired`）。  

### C. 需要缓存 / 分布式锁

- 业务侧使用 `port.Cache` / `port.Locker`。  
- 实现已在 `infra/cache`、`infra/lock`；一般只需在 `NewService` 注入，无需业务包 import infra。

---

## 7. 放哪里？快速判定

| 你要加的内容                         | 放哪里                        |
| ------------------------------------ | ----------------------------- |
| 某业务的用例、模型、该业务 API       | `module/<name>/`              |
| 全局路由挂载、登录态中间件           | `httpapi`                     |
| 「我需要锁/缓存，不关心 Redis」      | `port` 接口 + `infra` 实现    |
| 分页、统一 JSON 响应、跨模块基础类型 | `pkg`                         |
| 结构化业务/任务/审计日志             | `pkg/logger`（Service/Job 打点） |
| 仅某一业务用的算法                   | 留在该 `module`，不要进 `pkg` |
| 表结构                               | `ent/schema`                  |
| 进程启动参数、组装顺序               | `cmd/*`                       |

---

## 8. 协作约定（简）

1. **优先在对应 module 内闭环**；跨模块先谈 Service 接口，避免双向 import 实现细节。  
2. **生成代码**（`ent/*` 非 schema、`docs/api/swagger`）不要手改业务逻辑；改源再生成。  
3. **PR 粒度**：一个业务能力尽量带齐 service + handler + repo（及必要测试），便于评审。  
4. **命名**：新 module 用小写业务名；HTTP 子包可用 `userhttp` 这类包名，避免与 `net/http` 冲突。  
5. **日志**：新写路径用 `logger.Module` + `purpose` + 稳定 `event`；可预期 `BizError` 不打 Error；系统错误由 `httpapi.HTTPErrorHandler` 边界记一次（见 [logger README](internal/pkg/logger/README.md)）。
6. **HTTP**：Handler 成功 `return c.JSON(http.StatusOK, response.OK(data))`；失败 `return err`（`BizError` / bind / validate），由全局错误处理写成统一响应体。

---

## 9. 相关文档索引

| 文档                                                           | 内容                                |
| -------------------------------------------------------------- | ----------------------------------- |
| [internal/module/README.md](internal/module/README.md)         | 业务模块目录约定                    |
| [internal/pkg/README.md](internal/pkg/README.md)               | 公共库边界                          |
| [internal/pkg/logger/README.md](internal/pkg/logger/README.md) | **结构化日志约定与 event 表**       |
| [docs/REDIS_CACHE.md](docs/REDIS_CACHE.md)                     | **项目级 Redis / 缓存策略**（总览） |
| [ent/schema/README.md](ent/schema/README.md)                   | Schema 与 generate 约定             |

有疑问时：先看依赖图（第 3 节）和「放哪里」（第 7 节），再按第 6 节接入第一个 module。
