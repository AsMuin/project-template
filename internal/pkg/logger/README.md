# logger — 结构化日志

基于标准库 `log/slog` 的薄封装。业务与基础设施统一用本包打点，避免直接 `log.Printf`。

## 初始化与环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `SERVICE_NAME` | `projecttemp` | 每条日志附带的 `service` 字段 |
| `LOG_LEVEL` | `info` | `debug` / `info` / `warn` / `error` |
| `LOG_FORMAT` | 见右 | `text` 或 `json`；未设置时 `ENV=prod|production` → json，否则 text |
| `ENV` | — | 影响默认 format |

`cmd/server` 启动时调用 `logger.Init()`（读 `.env` / 环境变量）。未 Init 前也有默认 text/info logger。

输出到 **stderr**。

## 字段约定

| 字段常量 | JSON key | 含义 |
|----------|----------|------|
| `FieldModule` | `module` | 模块名：业务名 / `http` / `scheduler` 等 |
| `FieldPurpose` | `purpose` | 用途（与 Level 正交），见下表 |
| `FieldEvent` | `event` | 稳定事件名，便于检索与告警 |
| `FieldErr` | `err` | 错误对象 |

### Purpose

| 值 | 用途 |
|----|------|
| `http` | 请求边界、未处理的系统错误 |
| `biz` | 领域写操作结果、可观察的业务状态 |
| `audit` | 登录注册、权限变更等安全/审计相关 |
| `job` | 定时任务 / cron |
| `cache` | 缓存 miss / 失效失败等 |
| `infra` | 进程监听、依赖就绪类 |
| `alert` | 需关注的失败（可单独配告警规则） |

### 推荐写法

```go
var orderLog = logger.Module("order")

orderLog.Info("order created",
    logger.FieldPurpose, logger.PurposeBiz,
    logger.FieldEvent, "order.created",
    "order_id", id,
)
```

后台任务可预绑定 purpose：

```go
var jobLog = logger.Module("order").With(logger.FieldPurpose, logger.PurposeJob)
```

`logger.NewCronLogger()` 适配 `robfig/cron`（`module=scheduler`, `purpose=job`）。

## 插入原则（与实现一致）

1. **横切**：HTTP access 使用 `httpapi/middleware.AccessLog`（`event=http.access`）；**非 `BizError` 的 5xx** 在 `httpapi.HTTPErrorHandler` 记一次 `http.system_error`。
2. **Service**：关键写操作成功 / 审计点打 `biz` 或 `audit`；可预期业务拒绝一般只返回 `BizError`，不 Error。
3. **Job**：生命周期与失败打 `job`（严重失败可把 purpose 提到 `alert`）。
4. **Cache**：miss 用 `Debug`；失效失败用 `Warn` + `purpose=cache`。
5. **Repo**：默认不打业务日志；错误向上返回，由边界记一次。
6. **不要**在热循环里刷 Info；批量任务按汇总（count、duration_ms）记录。
7. **敏感字段**：密码、完整 token 等禁止入日志。

## 框架内主要 event（速查）

| event | module | purpose | 说明 |
|-------|--------|---------|------|
| `http.listen` | — | infra | 服务监听 |
| `http.access` | http | http | 每个请求的 access 日志 |
| `http.system_error` | http | http | 非业务错误写出响应时 |
| `cron.registered` / `cron.started` / `cron.stop_error` | scheduler | job | 调度器 |

业务 event 由各 module 自行命名，建议保持 `领域.动作` 风格（如 `order.created`）。完整列表以代码中 `FieldEvent` 为准。

## 相关代码

| 路径 | 内容 |
|------|------|
| `logger.go` | Init、Level/Format/Purpose、Module/With、Debug～Fatal |
| `cron.go` | Cron Logger 适配 |
| `internal/httpapi/middleware/access_log.go` | access 日志 |
| `internal/httpapi/http_error.go` | 系统错误边界日志（HTTPErrorHandler） |
| `cmd/server/main.go` | Init + 启动/Fatal |
