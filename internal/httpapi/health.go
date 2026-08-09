package httpapi

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

// registerHealth mounts process liveness probes (no auth, outside /api).
func registerHealth(e *echo.Echo) {
	e.GET("/health", func(c *echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "ok",
		})
	})
}
