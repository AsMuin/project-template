package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

// Placeholder 仅为满足「schema 目录至少有一个实体才能 go generate」的约束。
// 接入真实业务时：删除本文件，按领域新增 schema，再执行 go generate ./ent。
type Placeholder struct {
	ent.Schema
}

func (Placeholder) Fields() []ent.Field {
	return []ent.Field{
		field.Int64("id").
			Positive().
			Immutable().
			Comment("占位主键，删除本实体后请忽略"),
	}
}
