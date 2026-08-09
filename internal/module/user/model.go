package user

import "time"

// Gender 与 ent schema / API 对齐。
type Gender string

const (
	GenderUnknown Gender = "unknown"
	GenderMale    Gender = "male"
	GenderFemale  Gender = "female"
)

// User 对外可见的用户信息（过滤 password_hash 等敏感字段）。
type User struct {
	ID        int64     `json:"id"`
	Account   string    `json:"account"`
	Nickname  string    `json:"nickname"`
	Email     *string   `json:"email,omitempty"`
	Avatar    *string   `json:"avatar,omitempty"`
	Age       *int      `json:"age,omitempty"`
	Gender    Gender    `json:"gender"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// ---------- API 入参（Handler 直接 BindAndValidate 到这些类型）----------
//
// 说明：go-playground 的 tag 以英文逗号分段，regexp 模式里不能写 {2,19} 这类逗号。
// 长度用 min/max；字符形态用 regexp（或 hasalpha/hasdigit）。

// RegisterParams 注册入参。
type RegisterParams struct {
	// 字母开头，后仅字母数字下划线；长度 3–20
	Account  string  `json:"account" validate:"required,min=3,max=20,regexp=^[a-zA-Z][a-zA-Z0-9_]*$"`
	Nickname string  `json:"nickname" validate:"required,min=1,max=20"`
	Password string  `json:"password" validate:"required,min=6,max=20,hasalpha,hasdigit"`
	Email    *string `json:"email" validate:"omitempty,email,max=128"`
	Avatar   *string `json:"avatar" validate:"omitempty,url,max=512"`
	Age      *int    `json:"age" validate:"omitempty,gte=0,lte=150"`
	Gender   Gender  `json:"gender" validate:"omitempty,oneof=unknown male female"`
}

// LoginParams 登录入参（密码不做复杂度校验，避免策略变更导致无法登录）。
type LoginParams struct {
	Account  string `json:"account" validate:"required,min=3,max=20,regexp=^[a-zA-Z][a-zA-Z0-9_]*$"`
	Password string `json:"password" validate:"required,min=6,max=20"`
}

// UpdateParams 部分更新；指针 nil 表示不修改该字段。
type UpdateParams struct {
	Nickname *string `json:"nickname" validate:"omitempty,min=1,max=20"`
	Password *string `json:"password" validate:"omitempty,min=6,max=20,hasalpha,hasdigit"`
	Email    *string `json:"email" validate:"omitempty,email,max=128"`
	Avatar   *string `json:"avatar" validate:"omitempty,url,max=512"`
	Age      *int    `json:"age" validate:"omitempty,gte=0,lte=150"`
	Gender   *Gender `json:"gender" validate:"omitempty,oneof=unknown male female"`
}

// HasUpdates 是否至少带了一个可更新字段。
func (in UpdateParams) HasUpdates() bool {
	return in.Nickname != nil || in.Password != nil || in.Email != nil ||
		in.Avatar != nil || in.Age != nil || in.Gender != nil
}
