package binding

import (
	"regexp"
	"sync"
	"unicode"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v5"
)

// Validator 将 go-playground/validator 接到 Echo#Validator。
//
// 这里只注册「通用机制」型 tag（如 regexp），不注册业务字段名
// （例如 account/password）。具体规则写在各 module 的 model 字段 tag 上。
type Validator struct {
	v *validator.Validate
}

// NewValidator 创建校验器并挂上通用扩展 tag。
func NewValidator() *Validator {
	v := validator.New()
	// regexp=<pattern>  — 官方默认无此 tag；pattern 不能含英文逗号（与 min/max 等 tag 冲突）
	_ = v.RegisterValidation("regexp", validateRegexp)
	// hasalpha / hasdigit — RE2 无前向断言，用通用 tag 表达「至少含字母/数字」
	_ = v.RegisterValidation("hasalpha", validateHasAlpha)
	_ = v.RegisterValidation("hasdigit", validateHasDigit)
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

var regexpCache sync.Map // string -> *regexp.Regexp

func validateRegexp(fl validator.FieldLevel) bool {
	pattern := fl.Param()
	if pattern == "" {
		return false
	}
	var re *regexp.Regexp
	if cached, ok := regexpCache.Load(pattern); ok {
		re = cached.(*regexp.Regexp)
	} else {
		compiled, err := regexp.Compile(pattern)
		if err != nil {
			return false
		}
		regexpCache.Store(pattern, compiled)
		re = compiled
	}
	return re.MatchString(fl.Field().String())
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
