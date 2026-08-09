package httpapi

import (
	"errors"
	"net/http"

	"projecttemp/internal/pkg/logger"
	"projecttemp/internal/pkg/response"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v5"
)

// HTTPErrorHandler 是 Echo 全局错误出口：将 BizError / 绑定校验错误 / HTTPError / 未知错误
// 统一写成 {code,data,message} JSON，并在非业务错误时打系统错误日志。
func HTTPErrorHandler(c *echo.Context, err error) {
	if err == nil {
		return
	}
	if resp, uErr := echo.UnwrapResponse(c.Response()); uErr == nil && resp != nil && resp.Committed {
		return
	}

	httpStatus, body := mapError(err)

	if !response.IsBizError(err) && httpStatus >= http.StatusInternalServerError {
		logger.Module("http").Error("unhandled system error",
			logger.FieldPurpose, logger.PurposeHTTP,
			logger.FieldEvent, "http.system_error",
			logger.FieldErr, err,
			"method", c.Request().Method,
			"path", c.Request().URL.Path,
		)
	}

	var writeErr error
	if c.Request().Method == http.MethodHead {
		writeErr = c.NoContent(httpStatus)
	} else {
		writeErr = c.JSON(httpStatus, body)
	}
	if writeErr != nil {
		c.Logger().Error("failed to write error response", "error", writeErr)
	}
}

func mapError(err error) (int, *response.Response) {
	// 1) 业务错误
	var bizErr *response.BizError
	if errors.As(err, &bizErr) {
		return bizErr.HTTPCode(), response.Fail(bizErr)
	}

	// 2) go-playground 校验错误
	var verrs validator.ValidationErrors
	if errors.As(err, &verrs) {
		return response.ParamsError.HTTP, response.FailWithCode(response.ParamsError, verrs.Error())
	}

	// 3) Echo 绑定错误
	var bindErr *echo.BindingError
	if errors.As(err, &bindErr) {
		msg := bindErr.Message
		if msg == "" {
			msg = bindErr.Error()
		}
		return response.ParamsError.HTTP, response.FailWithCode(response.ParamsError, msg)
	}

	// 4) Echo HTTPError（含由 sentinel.Wrap 产生的 *HTTPError）
	var he *echo.HTTPError
	if errors.As(err, &he) {
		code := he.Code
		if code == 0 {
			code = http.StatusInternalServerError
		}
		msg := he.Message
		switch code {
		case http.StatusBadRequest:
			return code, response.FailWithCode(response.ParamsError, msg)
		case http.StatusUnauthorized:
			return code, response.FailWithCode(response.NotLogin, msg)
		case http.StatusForbidden:
			return code, response.FailWithCode(response.NoAuth, msg)
		case http.StatusNotFound:
			return code, response.FailWithCode(response.NotFound, msg)
		default:
			if code >= 500 {
				return code, response.FailWithCode(response.SystemError, "")
			}
			return code, response.FailWithCode(response.ParamsError, msg)
		}
	}

	// 5) 仅实现了 HTTPStatusCoder 的 sentinel（如 echo.ErrNotFound）
	if sc := echo.StatusCode(err); sc != 0 {
		switch sc {
		case http.StatusBadRequest:
			return sc, response.FailWithCode(response.ParamsError, err.Error())
		case http.StatusUnauthorized:
			return sc, response.FailWithCode(response.NotLogin, "")
		case http.StatusForbidden:
			return sc, response.FailWithCode(response.NoAuth, "")
		case http.StatusNotFound:
			return sc, response.FailWithCode(response.NotFound, "")
		default:
			if sc >= 500 {
				return sc, response.FailWithCode(response.SystemError, "")
			}
			return sc, response.FailWithCode(response.ParamsError, err.Error())
		}
	}

	// 6) 未知错误：不暴露内部细节
	return response.SystemError.HTTP, response.Fail(err)
}
