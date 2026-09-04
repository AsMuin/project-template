package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// User 基础用户实体（登录账号 + 资料）。
type User struct {
	ent.Schema
}

func (User) Fields() []ent.Field {
	return []ent.Field{
		field.Int64("id").
			Positive().
			Immutable().
			Comment("主键"),
		field.String("account").
			MaxLen(20).
			NotEmpty().
			Unique().
			Comment("登录账号，唯一"),
		field.String("nickname").
			MaxLen(20).
			NotEmpty().
			Comment("昵称"),
		field.String("password_hash").
			NotEmpty().
			Sensitive().
			Comment("密码哈希（bcrypt），非明文"),
		field.String("email").
			MaxLen(128).
			Optional().
			Nillable().
			Comment("邮箱"),
		field.String("avatar").
			MaxLen(512).
			Optional().
			Nillable().
			Comment("头像 URL"),
		field.Int("age").
			Optional().
			Nillable().
			NonNegative().
			Max(150).
			Comment("年龄"),
		field.Enum("gender").
			Values("unknown", "male", "female").
			Default("unknown").
			Comment("性别"),
		field.Bool("vip").
			Default(false).
			Comment("是否会员；跨域支付升会员 POC 用"),
		field.Time("created_at").
			Default(time.Now).
			Immutable().
			Comment("创建时间"),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now).
			Comment("更新时间"),
		field.Time("deleted_at").
			Optional().
			Nillable().
			Comment("软删除时间，非空表示已删除"),
	}
}

func (User) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("deleted_at"),
	}
}
