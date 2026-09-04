package userapi

import (
	"net/http"
	"strconv"

	appuser "projecttemp/internal/app/user"
	"projecttemp/internal/httpapi/binding"
	"projecttemp/internal/httpapi/middleware"
	"projecttemp/internal/pkg/response"

	"github.com/labstack/echo/v5"
)

// Handler 用户资料 HTTP 传输层；只依赖 app/user。
type Handler struct {
	svc *appuser.Service
}

func NewHandler(svc *appuser.Service) *Handler {
	return &Handler{svc: svc}
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
// @Param        body body appuser.UpdateRequest true "更新字段"
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
	var req appuser.UpdateRequest
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
