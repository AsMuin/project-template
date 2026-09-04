package paymentapi

import (
	apppay "projecttemp/internal/app/payment"
	"projecttemp/internal/httpapi/middleware"

	"github.com/labstack/echo/v5"
)

// Registrar 支付路由注册器。
type Registrar struct {
	h *Handler
}

func NewRegistrar(svc *apppay.Service) *Registrar {
	return &Registrar{h: NewHandler(svc)}
}

func (r *Registrar) RegisterRoutes(api *echo.Group) {
	payments := api.Group("/payments", middleware.AuthRequired())
	payments.POST("", r.h.Create)
	payments.GET("", r.h.ListMine)
	payments.GET("/:id", r.h.GetByID)
	payments.POST("/:id/pay", r.h.MarkPaid)
}
