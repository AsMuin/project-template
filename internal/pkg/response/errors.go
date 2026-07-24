package response

import (
	"errors"
	"fmt"
)

type Code struct {
	HTTP    int
	Biz     int
	Message string
}

// IsBizError 判断是否为可预期业务错误（参数/鉴权/未找到等）。
func IsBizError(err error) bool {
	var biz *BizError
	return errors.As(err, &biz)
}

var (
	Success     = Code{HTTP: 200, Biz: 0, Message: "ok"}
	ParamsError = Code{HTTP: 400, Biz: 40000, Message: "请求参数错误"}
	NotFound    = Code{HTTP: 404, Biz: 40001, Message: "数据不存在"}
	NotLogin    = Code{HTTP: 401, Biz: 40100, Message: "未登录"}
	NoAuth      = Code{HTTP: 403, Biz: 40101, Message: "无权限"}
	Forbidden   = Code{HTTP: 403, Biz: 40301, Message: "禁止操作"}
	SystemError = Code{HTTP: 500, Biz: 50000, Message: "系统内部异常"}
)

type BizError struct {
	code   Code
	detail string
}

func (e *BizError) Error() string {
	if e.detail != "" {
		return e.detail
	}
	return e.code.Message
}

func (e *BizError) BizCode() int  { return e.code.Biz }
func (e *BizError) HTTPCode() int { return e.code.HTTP }

func NewBizError(code Code) *BizError {
	return &BizError{code: code}
}

func NewBizErrorWithDetail(code Code, detail string) *BizError {
	return &BizError{code: code, detail: detail}
}

func NewBizErrorf(code Code, format string, args ...any) *BizError {
	return &BizError{code: code, detail: fmt.Sprintf(format, args...)}
}
