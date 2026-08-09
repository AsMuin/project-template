# 业务模块（module）

所有业务能力放在本目录下，避免在 `internal/` 顶层平铺过多包。

> 已内置基础 `user` 模块（auth 相关）。新增其它业务仍按下方约定扩展。

## 约定

```text
internal/module/<name>/
  model.go / service.go / repository.go   # 领域与用例
  http/                                   # 传输层 Handler（package <name>http）
  repo/                                   # 持久化实现（package repo）
  …                                       # 可选：任务、缓存策略文档等
```

### 已有模块

| 模块 | 说明 |
|------|------|
| `user` | 注册 / 登录 / 登出 / 查询 / 部分更新 |

新增业务时：

1. 新建 `internal/module/<name>/`，按上表拆分。
2. 在 `ent/schema` 定义表结构并 `go generate ./ent`。
3. 在 `internal/httpapi` 注册路由。
4. 在 `cmd/server` 装配依赖（repo / cache / lock 等）。

## 依赖方向

```text
cmd → httpapi → module/*/http → module/*
module/* → port、pkg/*
infra → 实现 port（不反向依赖 module）
```

跨模块调用优先通过对方的 `Service` 公开方法，不要直接依赖对方的 `repo` 实现。

## 日志（与 module 的关系）

- 使用 `internal/pkg/logger`（`Module("<name>")` + `purpose` / `event`），不要在 module 里直接依赖 `infra` 或 `log` 标准库刷屏。
- **Service** 打关键写操作与审计点；可预期业务错误返回 `response.BizError` 即可。
- **Job / 预热** 打任务生命周期；缓存细节可用 `Debug`。
- **Handler** 成功 `return c.JSON(..., response.OK(data))`，失败 `return err`；无 Service 落点的操作可在 Handler 记 audit。
- 细则见 [pkg/logger/README.md](../pkg/logger/README.md)。


## Session 登录（模板能力）

鉴权与会话写在 `internal/httpapi/middleware`，业务 module 的 http 层直接调用即可：

```go
// 登录成功后
if err := middleware.SaveLoginUserID(c, userID); err != nil {
    return err
}
return c.JSON(http.StatusOK, response.OK(nil))

// 需要登录的路由
authed := api.Group("", middleware.AuthRequired())
authed.GET("/me", h.Me)

// Handler 内
uid, err := middleware.GetLoginUserID(c)

// 登出
if err := middleware.ClearLoginSession(c); err != nil {
    return err
}
```

不要在 module 内直接操作 gorilla session；统一走上述封装，便于后续换 JWT 等策略时只改 httpapi。
