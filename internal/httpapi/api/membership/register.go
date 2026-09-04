package membershipapi

import (
	"projecttemp/internal/app/membership"
	"projecttemp/internal/httpapi/middleware"

	"github.com/labstack/echo/v5"
)

// Registrar 会员跨域用例路由注册器。
type Registrar struct {
	h *Handler
}

func NewRegistrar(svc *membership.Service) *Registrar {
	return &Registrar{h: NewHandler(svc)}
}

func (r *Registrar) RegisterRoutes(api *echo.Group) {
	g := api.Group("/membership", middleware.AuthRequired())
	g.POST("/activate", r.h.Activate)
}
