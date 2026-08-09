package userhttp

import (
	"net/http"
	"strconv"

	"projecttemp/internal/httpapi/binding"
	"projecttemp/internal/httpapi/middleware"
	"projecttemp/internal/module/user"
	"projecttemp/internal/pkg/response"

	"github.com/labstack/echo/v5"
)

// Handler 用户 HTTP 传输层。
type Handler struct {
	svc *user.Service
}

func NewHandler(svc *user.Service) *Handler {
	return &Handler{svc: svc}
}

// Register godoc
// @Summary      注册
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body user.RegisterParams true "注册信息"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} map[string]interface{}
// @Router       /auth/register [post]
func (h *Handler) Register(c *echo.Context) error {
	var req user.RegisterParams
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
// @Param        body body user.LoginParams true "登录信息"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} map[string]interface{}
// @Router       /auth/login [post]
func (h *Handler) Login(c *echo.Context) error {
	var req user.LoginParams
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

// GetByID godoc
// @Summary      按 ID 查询用户
// @Tags         users
// @Produce      json
// @Param        id path int true "用户 ID"
// @Success      200 {object} map[string]interface{}
// @Failure      404 {object} map[string]interface{}
// @Router       /users/{id} [get]
func (h *Handler) GetByID(c *echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.NewBizErrorWithDetail(response.ParamsError, "无效的用户 ID")
	}
	u, err := h.svc.GetByID(c.Request().Context(), id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, response.OK(u))
}

// Update godoc
// @Summary      部分更新用户（仅本人）
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id path int true "用户 ID"
// @Param        body body user.UpdateParams true "更新字段"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} map[string]interface{}
// @Failure      401 {object} map[string]interface{}
// @Failure      403 {object} map[string]interface{}
// @Security     SessionAuth
// @Router       /users/{id} [patch]
func (h *Handler) Update(c *echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.NewBizErrorWithDetail(response.ParamsError, "无效的用户 ID")
	}
	actorID, err := middleware.GetLoginUserID(c)
	if err != nil {
		return err
	}
	var req user.UpdateParams
	if err := binding.BindAndValidate(c, &req); err != nil {
		return err
	}
	if !req.HasUpdates() {
		return response.NewBizErrorWithDetail(response.ParamsError, "请至少提供一个更新字段")
	}
	u, err := h.svc.Update(c.Request().Context(), actorID, id, req)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, response.OK(u))
}
