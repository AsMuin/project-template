package httpapi

import (
	"projecttemp/internal/module/user"
	userhttp "projecttemp/internal/module/user/http"

	"github.com/labstack/echo/v5"
)

// RegisterRouter 注册全部 HTTP 路由。
func RegisterRouter(e *echo.Echo, userSvc *user.Service) {
	registerHealth(e)

	api := e.Group("/api")
	userhttp.Register(api, userSvc)
}
