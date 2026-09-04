# 应用层（app）

**全部用例**与 **`*Request` 入参**放在本目录。  
`module` 只保留领域实体、领域工具、`Repository` 与 `repo` 实现。  
HTTP 在 `httpapi/api`，**只依赖 app**（方案 C）。

## 包一览

| 包 | 用例 | Request |
|----|------|---------|
| `auth` | Register / Login | `RegisterRequest` `LoginRequest` |
| `user` | GetByID / Update | `UpdateRequest` |
| `payment` | Create / Get / List / MarkPaid | `CreateRequest` |
| `membership` | ActivateByPayment（跨域+事务） | `ActivateRequest` |

## 依赖

```text
httpapi/api/*  →  app/*  →  module（实体 + Repository 接口）
                          →  port.TxManager（需要时）
cmd            →  注入 repo 实现到 app；RegisterRouter(app registrars)
```

- `*Request`：用例入参，允许 `json`/`validate`，Handler 直接 `BindAndValidate`。  
- `*RepoParams`：只在 module，**禁止** HTTP bind。  
- 会话写入仍在 httpapi（Login 成功后 SaveLoginUserID）。

## 新增用例

1. 在 `app/<name>/` 增加 `request.go` + `service.go`。  
2. `httpapi/api/<name>/` Handler + Registrar。  
3. `cmd` 装配并注册。
