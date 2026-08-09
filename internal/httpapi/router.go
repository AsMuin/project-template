package httpapi

import (
	"github.com/labstack/echo/v5"
)

// RegisterRouter 注册全部 HTTP 路由。
// 新增业务模块时：在此挂载路由，并在 cmd/server 中装配 Service 后传入。
func RegisterRouter(e *echo.Echo) {
	registerHealth(e)

	// api := e.Group("/api")
	// authed := api.Group("", middleware.AuthRequired())
	// registerXxx(api, authed, xxxSvc)
}
