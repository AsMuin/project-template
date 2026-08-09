package httpapi

import (
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v5"
)

// CustomValidator 将 go-playground/validator 接到 Echo 的 Validator 接口。
// Echo 不内置校验实现；Handler 中 c.Bind 后调用 c.Validate 即可走 struct 的 validate tag。
type CustomValidator struct {
	validator *validator.Validate
}

// NewValidator 创建默认校验器并注册到 Echo：e.Validator = httpapi.NewValidator()
func NewValidator() *CustomValidator {
	return &CustomValidator{validator: validator.New()}
}

func (cv *CustomValidator) Validate(i any) error {
	if err := cv.validator.Struct(i); err != nil {
		return err
	}
	return nil
}

// BindAndValidate 先 Bind 再 Validate，供 Handler 使用的薄封装（非第二套校验框架）。
func BindAndValidate(c *echo.Context, dst any) error {
	if err := c.Bind(dst); err != nil {
		return err
	}
	return c.Validate(dst)
}
