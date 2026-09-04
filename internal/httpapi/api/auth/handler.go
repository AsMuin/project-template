package authapi

import (
	"net/http"

	"projecttemp/internal/app/auth"
	"projecttemp/internal/httpapi/binding"
	"projecttemp/internal/httpapi/middleware"
	"projecttemp/internal/pkg/response"

	"github.com/labstack/echo/v5"
)

// Handler 认证 HTTP 传输层；只依赖 app/auth。
type Handler struct {
	svc *auth.Service
}

func NewHandler(svc *auth.Service) *Handler {
	return &Handler{svc: svc}
}

// Register godoc
// @Summary      注册
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body auth.RegisterRequest true "注册信息"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} map[string]interface{}
// @Router       /auth/register [post]
func (h *Handler) Register(c *echo.Context) error {
	var req auth.RegisterRequest
	if err := binding.BindAndValidate(c, &req); err != nil {
		return err
	}
	u, err := h.svc.Register(c.Request().Context(), req)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, response.OK(u))
}

// Login godoc
// @Summary      登录
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body auth.LoginRequest true "登录信息"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} map[string]interface{}
// @Router       /auth/login [post]
func (h *Handler) Login(c *echo.Context) error {
	var req auth.LoginRequest
	if err := binding.BindAndValidate(c, &req); err != nil {
		return err
	}
	u, err := h.svc.Login(c.Request().Context(), req)
	if err != nil {
		return err
	}
	if err := middleware.SaveLoginUserID(c, u.ID); err != nil {
		return err
	}
	return c.JSON(http.StatusOK, response.OK(u))
}

// Logout godoc
// @Summary      登出
// @Tags         auth
// @Produce      json
// @Success      200 {object} map[string]interface{}
// @Failure      401 {object} map[string]interface{}
// @Security     SessionAuth
// @Router       /auth/logout [post]
func (h *Handler) Logout(c *echo.Context) error {
	if err := middleware.ClearLoginSession(c); err != nil {
		return err
	}
	return c.JSON(http.StatusOK, response.OK(nil))
}
