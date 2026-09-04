package auth

import "projecttemp/internal/module/user"

// RegisterRequest 注册用例入参（HTTP 可直接 BindAndValidate）。
//
// 说明：go-playground 的 tag 以英文逗号分段，regexp 模式里不能写 {2,19} 这类逗号。
type RegisterRequest struct {
	Account  string      `json:"account" validate:"required,min=3,max=20,regexp=^[a-zA-Z][a-zA-Z0-9_]*$"`
	Nickname string      `json:"nickname" validate:"required,min=1,max=20"`
	Password string      `json:"password" validate:"required,min=6,max=20,hasalpha,hasdigit"`
	Email    *string     `json:"email" validate:"omitempty,email,max=128"`
	Avatar   *string     `json:"avatar" validate:"omitempty,url,max=512"`
	Age      *int        `json:"age" validate:"omitempty,gte=0,lte=150"`
	Gender   user.Gender `json:"gender" validate:"omitempty,oneof=unknown male female"`
}

// LoginRequest 登录用例入参。
type LoginRequest struct {
	Account  string `json:"account" validate:"required,min=3,max=20,regexp=^[a-zA-Z][a-zA-Z0-9_]*$"`
	Password string `json:"password" validate:"required,min=6,max=20"`
}
