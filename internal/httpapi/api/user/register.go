package userapi

import (
	appuser "projecttemp/internal/app/user"
	"projecttemp/internal/httpapi/middleware"

	"github.com/labstack/echo/v5"
)

// Registrar 用户资料路由注册器。
type Registrar struct {
	h *Handler
}

func NewRegistrar(svc *appuser.Service) *Registrar {
	return &Registrar{h: NewHandler(svc)}
}

func (r *Registrar) RegisterRoutes(api *echo.Group) {
	users := api.Group("/users")
	users.GET("/:id", r.h.GetByID)
	users.PATCH("/:id", r.h.Update, middleware.AuthRequired())
}
