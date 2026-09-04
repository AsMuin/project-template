package paymentapi

import (
	"net/http"
	"strconv"

	apppay "projecttemp/internal/app/payment"
	"projecttemp/internal/httpapi/binding"
	"projecttemp/internal/httpapi/middleware"
	"projecttemp/internal/pkg/response"

	"github.com/labstack/echo/v5"
)

// Handler 支付 HTTP 传输层；只依赖 app/payment。
type Handler struct {
	svc *apppay.Service
}

func NewHandler(svc *apppay.Service) *Handler {
	return &Handler{svc: svc}
}

// Create godoc
// @Summary      创建支付单
// @Tags         payments
// @Accept       json
// @Produce      json
// @Param        body body apppay.CreateRequest true "支付信息"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} map[string]interface{}
// @Failure      401 {object} map[string]interface{}
// @Security     SessionAuth
// @Router       /payments [post]
func (h *Handler) Create(c *echo.Context) error {
	uid, err := middleware.GetLoginUserID(c)
	if err != nil {
		return err
	}
	var req apppay.CreateRequest
	if err := binding.BindAndValidate(c, &req); err != nil {
		return err
	}
	p, err := h.svc.Create(c.Request().Context(), uid, req)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, response.OK(p))
}

// ListMine godoc
// @Summary      我的支付单列表
// @Tags         payments
// @Produce      json
// @Success      200 {object} map[string]interface{}
// @Failure      401 {object} map[string]interface{}
// @Security     SessionAuth
// @Router       /payments [get]
func (h *Handler) ListMine(c *echo.Context) error {
	uid, err := middleware.GetLoginUserID(c)
	if err != nil {
		return err
	}
	list, err := h.svc.ListMine(c.Request().Context(), uid)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, response.OK(list))
}

// GetByID godoc
// @Summary      支付单详情
// @Tags         payments
// @Produce      json
// @Param        id path int true "支付单 ID"
// @Success      200 {object} map[string]interface{}
// @Failure      401 {object} map[string]interface{}
// @Failure      403 {object} map[string]interface{}
// @Failure      404 {object} map[string]interface{}
// @Security     SessionAuth
// @Router       /payments/{id} [get]
func (h *Handler) GetByID(c *echo.Context) error {
	uid, err := middleware.GetLoginUserID(c)
	if err != nil {
		return err
	}
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.NewBizErrorWithDetail(response.ParamsError, "无效的支付单 ID")
	}
	p, err := h.svc.GetByID(c.Request().Context(), id, uid)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, response.OK(p))
}

// MarkPaid godoc
// @Summary      标记支付成功（仅支付域）
// @Description  仅 pending→paid，不开通 VIP。跨域履约请用 POST /membership/activate。
// @Tags         payments
// @Produce      json
// @Param        id path int true "支付单 ID"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} map[string]interface{}
// @Failure      401 {object} map[string]interface{}
// @Failure      403 {object} map[string]interface{}
// @Failure      404 {object} map[string]interface{}
// @Security     SessionAuth
// @Router       /payments/{id}/pay [post]
func (h *Handler) MarkPaid(c *echo.Context) error {
	uid, err := middleware.GetLoginUserID(c)
	if err != nil {
		return err
	}
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.NewBizErrorWithDetail(response.ParamsError, "无效的支付单 ID")
	}
	p, err := h.svc.MarkPaid(c.Request().Context(), id, uid)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, response.OK(p))
}
