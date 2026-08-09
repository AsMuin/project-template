# page — 标准列表分页

## 职责边界

| 层 | 职责 |
|----|------|
| **Handler** | `binding.BindAndValidate`（query）；调 Service；`return c.JSON(200, response.OK(...))` |
| **Service** | 权限/默认条件；`repo.ListPage`；`page.NewPageResponse` / `MapPage` |
| **Repo** | 同一 WHERE：`Count` + `Offset`/`Limit`；返回 `(items, total, error)` |

Repo **不要**返回 `*page.PageResponse`。

## 用法骨架

```go
// model
type QueryParams struct {
    page.PageRequest
    Name string `query:"name"`
}

// repository
ListPage(ctx context.Context, q QueryParams) ([]*Entity, int64, error)

// service
func (s *Service) ListPage(ctx context.Context, q QueryParams) (*page.PageResponse[*Entity], error) {
    rows, total, err := s.repo.ListPage(ctx, q)
    if err != nil {
        return nil, err
    }
    return page.NewPageResponse(rows, total, q.PageRequest), nil
}

// handler
func (h *Handler) List(c *echo.Context) error {
    var q QueryParams
    if err := binding.BindAndValidate(c, &q); err != nil {
        return err
    }
    out, err := h.svc.ListPage(c.Request().Context(), q)
    if err != nil {
        return err
    }
    return c.JSON(http.StatusOK, response.OK(out))
}
```

## 响应 data 形状

```json
{
  "records": [],
  "total": 0,
  "pageNum": 1,
  "pageSize": 10
}
```
