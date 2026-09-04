package user

import moduser "projecttemp/internal/module/user"

// UpdateRequest 资料部分更新；指针 nil 表示不修改。VIP 不开放给本接口。
type UpdateRequest struct {
	Nickname *string         `json:"nickname" validate:"omitempty,min=1,max=20"`
	Password *string         `json:"password" validate:"omitempty,min=6,max=20,hasalpha,hasdigit"`
	Email    *string         `json:"email" validate:"omitempty,email,max=128"`
	Avatar   *string         `json:"avatar" validate:"omitempty,url,max=512"`
	Age      *int            `json:"age" validate:"omitempty,gte=0,lte=150"`
	Gender   *moduser.Gender `json:"gender" validate:"omitempty,oneof=unknown male female"`
}

// HasUpdates 是否至少带了一个可更新字段。
func (in UpdateRequest) HasUpdates() bool {
	return in.Nickname != nil || in.Password != nil || in.Email != nil ||
		in.Avatar != nil || in.Age != nil || in.Gender != nil
}
