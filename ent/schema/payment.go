package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Payment 支付单（模板 POC：方式 / 状态 / 时间；后续可与 user.vip 做跨 module 事务演示）。
type Payment struct {
	ent.Schema
}

func (Payment) Fields() []ent.Field {
	return []ent.Field{
		field.Int64("id").
			Positive().
			Immutable().
			Comment("主键"),
		field.Int64("user_id").
			Positive().
			Comment("下单用户 ID"),
		field.Enum("method").
			Values("wechat", "alipay", "card", "mock").
			Comment("支付方式"),
		field.Enum("status").
			Values("pending", "paid", "failed", "cancelled").
			Default("pending").
			Comment("支付状态"),
		field.Int64("amount_cent").
			NonNegative().
			Comment("金额（分）"),
		field.String("subject").
			MaxLen(128).
			Default("VIP membership").
			Comment("商品/事由摘要"),
		field.Time("paid_at").
			Optional().
			Nillable().
			Comment("支付成功时间"),
		field.Time("created_at").
			Default(time.Now).
			Immutable().
			Comment("创建时间"),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now).
			Comment("更新时间"),
	}
}

func (Payment) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("user_id"),
		index.Fields("status"),
		index.Fields("user_id", "status"),
	}
}
