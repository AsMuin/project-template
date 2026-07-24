package httpapi

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// registerHealth mounts process liveness probes (no auth, outside /api).
func registerHealth(r *gin.Engine) {
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})
}
