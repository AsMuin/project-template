package response

import "errors"

type Response struct {
	Code    int    `json:"code"`
	Data    any    `json:"data"`
	Message string `json:"message"`
}

func OK(data any) *Response {
	return &Response{
		Code:    Success.Biz,
		Data:    data,
		Message: Success.Message,
	}
}

// Fail 将 error 转为统一失败响应体。业务错误暴露业务码与文案，其它错误统一为系统错误。
func Fail(err error) *Response {
	var bizErr *BizError
	if errors.As(err, &bizErr) {
		return &Response{
			Code:    bizErr.BizCode(),
			Message: bizErr.Error(),
		}
	}
	return &Response{
		Code:    SystemError.Biz,
		Message: SystemError.Message,
	}
}

// FailWithCode 用于指定已知业务错误码以及相关错误信息。
func FailWithCode(code Code, detail string) *Response {
	msg := code.Message
	if detail != "" {
		msg = detail
	}
	return &Response{
		Code:    code.Biz,
		Message: msg,
	}
}

// HTTPCodeFromErr 从错误中获取 HTTP 状态码；业务错误用其 HTTP 码，其它一律系统错误。
func HTTPCodeFromErr(err error) int {
	var bizErr *BizError
	if errors.As(err, &bizErr) {
		return bizErr.HTTPCode()
	}
	return SystemError.HTTP
}
