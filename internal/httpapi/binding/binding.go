package binding

import (
	"unicode"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v5"
)

// Validator 将 go-playground/validator 接到 Echo#Validator。
//
// 这里只注册「通用机制」型 tag（如 hasalpha / hasdigit / hasspecial），
// 不注册业务字段名。具体规则写在各 module 的 model 字段 tag 上。
type Validator struct {
	v *validator.Validate
}

// NewValidator 创建校验器并挂上通用扩展 tag。
func NewValidator() *Validator {
	v := validator.New()

	_ = v.RegisterValidation("hasalpha", validateHasAlpha)
	_ = v.RegisterValidation("hasdigit", validateHasDigit)
	_ = v.RegisterValidation("hasspecial", validateHasSpecial)

	return &Validator{v: v}
}

func (cv *Validator) Validate(i any) error {
	return cv.v.Struct(i)
}

// BindAndValidate 先 Bind 再 Validate。
func BindAndValidate(c *echo.Context, dst any) error {
	if err := c.Bind(dst); err != nil {
		return err
	}
	return c.Validate(dst)
}

func validateHasAlpha(fl validator.FieldLevel) bool {
	for _, r := range fl.Field().String() {
		if unicode.IsLetter(r) {
			return true
		}
	}
	return false
}

func validateHasDigit(fl validator.FieldLevel) bool {
	for _, r := range fl.Field().String() {
		if unicode.IsDigit(r) {
			return true
		}
	}
	return false
}

// validateHasSpecial 判断字符串中是否至少包含一个“特殊字符”。
// 这里把标点符号（Punct）和符号（Symbol）都算作特殊字符。
func validateHasSpecial(fl validator.FieldLevel) bool {
	for _, r := range fl.Field().String() {
		if unicode.IsPunct(r) || unicode.IsSymbol(r) {
			return true
		}
	}
	return false
}
