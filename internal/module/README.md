# 业务模块（module）

**领域层 + 持久化**：实体、枚举、领域工具、`Repository` 接口、`repo` 实现。  
**不含** 应用 Service、**不含** HTTP、**不含** `*Request`（用例入参在 `app`）。

## 约定

```text
internal/module/<name>/
  model.go          # 实体
  repository.go     # Repository + *RepoParams
  password.go 等    # 可选领域工具
  repo/             # ent 适配器（ClientFrom）
```

| 模块 | 内容 |
|------|------|
| `user` | User、Gender、密码工具、Repository |
| `payment` | Payment、Method/Status、Repository |

用例见 [`internal/app`](../app/README.md)。HTTP 见 [`docs/HTTP_LAYOUT.md`](../../docs/HTTP_LAYOUT.md)。
