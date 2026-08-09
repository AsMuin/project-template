# 内部公共库（pkg）

与具体业务模块无关、可被多处复用的代码。**不要**把业务逻辑放进这里。

| 包 | 说明 |
|----|------|
| `page` | 标准列表分页（Request/Response；Repo 返回 items+total，Service 组装） |
| `response` | 统一 API 响应体、业务错误码（`BizError`/`OK`/`Fail`）；HTTP 写出与错误映射在 `httpapi` |
| `logger` | 薄封装 `log/slog`：`Init` / `Module` + `purpose` / `event` 结构化字段 |
| `types`（可选） | 跨模块基础类型；有需要时再新增本目录下的包 |

业务模块代码在 `internal/module/`；基础设施在 `internal/infra/`；端口在 `internal/port/`。

## logger（简）

- 环境变量：`LOG_LEVEL`、`LOG_FORMAT`、`SERVICE_NAME`、`ENV`（prod 默认 json）。
- 约定：`module` + `purpose`（http/biz/audit/job/cache/infra/alert）+ 稳定 `event`。
- 业务用 `logger.Module("<name>")` 等；启动失败用 `Fatal`；cron 用 `NewCronLogger()`。

细则与 event 表见：**[logger/README.md](logger/README.md)**。分页约定见 [page/README.md](page/README.md)。
