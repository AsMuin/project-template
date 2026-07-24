package response

import (
	"net/http"

	"projecttemp/internal/pkg/logger"

	"github.com/gin-gonic/gin"
)

// 基于 error 和 response 结构，捕获其中的 HTTP 状态码和响应结果（成功/失败），由 gin 序列化响应信息

func RespondOK(c *gin.Context, data any) {
	c.JSON(http.StatusOK, OK(data))
}

// RespondError 写出错误响应；非业务错误在 HTTP 边界记一次 Error（带 path/method）。
func RespondError(c *gin.Context, err error) {
	if err != nil && !IsBizError(err) {
		logger.Module("http").Error("unhandled system error",
			logger.FieldPurpose, logger.PurposeHTTP,
			logger.FieldEvent, "http.system_error",
			logger.FieldErr, err,
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
		)
	}
	c.JSON(HTTPCodeFromErr(err), Fail(err))
}

func RespondBindingError(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, FailWithCode(ParamsError, err.Error()))
}
