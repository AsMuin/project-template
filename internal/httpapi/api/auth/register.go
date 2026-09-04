package authapi

import (
	"projecttemp/internal/app/auth"
	"projecttemp/internal/httpapi/middleware"

	"github.com/labstack/echo/v5"
)

// Registrar 认证路由注册器。
type Registrar struct {
	h *Handler
}

func NewRegistrar(svc *auth.Service) *Registrar {
	return &Registrar{h: NewHandler(svc)}
}

func (r *Registrar) RegisterRoutes(api *echo.Group) {
	g := api.Group("/auth")
	g.POST("/register", r.h.Register)
	g.POST("/login", r.h.Login)
	g.POST("/logout", r.h.Logout, middleware.AuthRequired())
}
