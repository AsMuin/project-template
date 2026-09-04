package membershipapi

import (
	"net/http"

	"projecttemp/internal/app/membership"
	"projecttemp/internal/httpapi/binding"
	"projecttemp/internal/httpapi/middleware"
	"projecttemp/internal/pkg/response"

	"github.com/labstack/echo/v5"
)

// Handler 会员履约 HTTP 传输层；只依赖 app/membership。
type Handler struct {
	svc *membership.Service
}

func NewHandler(svc *membership.Service) *Handler {
	return &Handler{svc: svc}
}

// Activate godoc
// @Summary      支付履约并开通 VIP
// @Description  同一本地事务：支付单 MarkPaid + user.SetVIP(true)。*Request 定义在 app。
// @Tags         membership
// @Accept       json
// @Produce      json
// @Param        body body membership.ActivateRequest true "支付单"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} map[string]interface{}
// @Failure      401 {object} map[string]interface{}
// @Failure      403 {object} map[string]interface{}
// @Failure      404 {object} map[string]interface{}
// @Security     SessionAuth
// @Router       /membership/activate [post]
func (h *Handler) Activate(c *echo.Context) error {
	uid, err := middleware.GetLoginUserID(c)
	if err != nil {
		return err
	}
	var req membership.ActivateRequest
	if err := binding.BindAndValidate(c, &req); err != nil {
		return err
	}
	res, err := h.svc.ActivateByPayment(c.Request().Context(), uid, req.PaymentID)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, response.OK(res))
}
