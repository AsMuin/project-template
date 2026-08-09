package userhttp

import (
	"projecttemp/internal/httpapi/middleware"
	"projecttemp/internal/module/user"

	"github.com/labstack/echo/v5"
)

// Register 挂载用户/认证相关路由到 /api 组。
func Register(api *echo.Group, svc *user.Service) {
	h := NewHandler(svc)

	auth := api.Group("/auth")
	auth.POST("/register", h.Register)
	auth.POST("/login", h.Login)
	auth.POST("/logout", h.Logout, middleware.AuthRequired())

	users := api.Group("/users")
	users.GET("/:id", h.GetByID)
	users.PATCH("/:id", h.Update, middleware.AuthRequired())
}
