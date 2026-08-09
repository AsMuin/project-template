package middleware

import (
	"projecttemp/internal/pkg/logger"
	"projecttemp/internal/pkg/response"

	"github.com/labstack/echo/v5"
	echomw "github.com/labstack/echo/v5/middleware"
)

// AccessLog 将 Echo RequestLogger 接到 pkg/logger，输出统一结构化 access 日志。
func AccessLog() echo.MiddlewareFunc {
	log := logger.Module("http")
	return echomw.RequestLoggerWithConfig(echomw.RequestLoggerConfig{
		HandleError:  true, // 将 handler error 交给全局 HTTPErrorHandler 决定状态码
		LogLatency:   true,
		LogMethod:    true,
		LogURIPath:   true,
		LogStatus:    true,
		LogRequestID: true,
		LogRemoteIP:  true,
		LogValuesFunc: func(c *echo.Context, v echomw.RequestLoggerValues) error {
			attrs := []any{
				logger.FieldPurpose, logger.PurposeHTTP,
				logger.FieldEvent, "http.access",
				"method", v.Method,
				"path", v.URIPath,
				"status", v.Status,
				"latency_ms", v.Latency.Milliseconds(),
				"request_id", v.RequestID,
				"remote_ip", v.RemoteIP,
			}
			// 可预期业务错误保持 Info；仅系统级失败抬升 Error
			if v.Error != nil && !response.IsBizError(v.Error) && v.Status >= 500 {
				attrs = append(attrs, logger.FieldErr, v.Error)
				log.Error("request", attrs...)
				return nil
			}
			log.Info("request", attrs...)
			return nil
		},
	})
}
