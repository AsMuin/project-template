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

// 用于处理未知的错误，如果识别为业务错误，则使用业务错误码，否则统一用系统错误码隐蔽内部细节
func Fail(err error) *Response {
	if IsBizError(err) {
		return &Response{
			Code:    err.(*BizError).BizCode(),
			Message: err.Error(),
		}
	}
	return &Response{
		Code:    SystemError.Biz,
		Message: SystemError.Message,
	}
}

// 用于指定已知的业务错误码以及相关的错误信息
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

// 用于从错误中获取HTTP状态码,同样也是尝试识别业务错误并使用其对应的 HTTP状态码，其他情况一律用系统错误 HTTP状态码
func HTTPCodeFromErr(err error) int {
	var bizErr *BizError
	if errors.As(err, &bizErr) {
		return bizErr.HTTPCode()
	}
	return SystemError.HTTP
}
