# objectstore（infra）

实现 `port.ObjectStore`。当前 Provider：Cloudflare R2（S3 兼容 API）。

## 分层

| 位置 | 内容 |
|------|------|
| `port.ObjectStore` / `ObjectPutInput` | 仅上传端口（薄接口） |
| `infra/objectstore` | R2 实现、`New` / `NewFromConfig` |
| 同包 `PutBytes` / `PublishSource` | 转存编排（下载 data/http → Put）；**非** R2 原生 API |

## 用法

```go
// cmd 装配
store := objectstore.NewFromConfig(cfg.R2) // 未配齐返回 nil
imgGen := image.NewGenerator(cfg, chatModel, store)

// 转存 / 上传辅助（infra 包函数，依赖 port 接口）
url, err := objectstore.PutBytes(ctx, store, "avatars", "image/png", pngBytes)
url, err = objectstore.PublishSource(ctx, store, sourceURL, "pexels", 0)
```

未配置时 `New` 返回 `nil`，`PublishSource(nil, …)` 原样返回源 URL。
