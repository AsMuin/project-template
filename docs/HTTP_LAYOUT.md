# HTTP 布局：方案 C（传输层集中）

全部 HTTP 位于 `internal/httpapi`，`module` / `app` **不含** `http` 子包。  
在 httpapi **内部**再拆两层，避免路由与协议基建平铺混放。

## 目录

```text
internal/httpapi/
  binding/               # 请求绑定与校验
  middleware/            # 鉴权、访问日志等
  health.go              # 探活
  http_error.go          # 错误 → JSON
  router.go              # RouteRegistrar + RegisterRouter 总装
  api/                   # ★ 业务路由与 Handler（按资源/用例）
    doc.go
    user/                # package userapi      → module/user
    payment/             # package paymentapi   → module/payment
    membership/          # package membershipapi → app/membership
```

| 层级 | 放什么 | 何时改 |
|------|--------|--------|
| `httpapi` 根 + `binding` / `middleware` | 与具体业务无关的协议能力 | 换鉴权、统一错误体、校验器 |
| `httpapi/api/<area>` | 某资源/用例的路径、DTO 绑定、调 Service | 加/改业务 API |

## 请求路径

```text
HTTP
  → httpapi/api/<area>.Handler   （bind app.*Request / auth / status / swagger）
       → app.<area>.Service  exclusively
```

## 注册方式

```go
import (
    membershipapi "projecttemp/internal/httpapi/api/membership"
    paymentapi "projecttemp/internal/httpapi/api/payment"
    userapi "projecttemp/internal/httpapi/api/user"
)

httpapi.RegisterRouter(e,
    userapi.NewRegistrar(userSvc),
    paymentapi.NewRegistrar(paymentSvc),
    membershipapi.NewRegistrar(membershipSvc),
)
```

新增 API：

1. 用例与 `*Request` 在 `app/<area>/` 实现。  
2. 领域实体 / Repo 在 `module`（若已有则复用）。  
3. 在 `httpapi/api/<area>/` 增加 Handler + `Registrar`（只依赖 app）。  
4. `cmd/server` 装配 app 并注册 Registrar。

## 约定

1. Handler **禁止**直接依赖 `module/*/repo` 或 `infra`。  
2. Handler **只**依赖 `app.Service`，Bind 的是 `app.*Request`。  
3. URL 按资源/产品语义，不暴露内部包名。  
4. Swagger 注释写在 `httpapi/api/*` Handler 上。  
5. **不要**在 `httpapi` 根目录继续堆业务 Handler；只进 `api/`。
