# ent schema

手写表结构只放这里，改完后：

```bash
go generate ./ent
```

服务启动时 `database.Migrate` 会按当前 schema 建表（以项目现状为准）。

## 模板说明

仓库默认只有 `placeholder.go`（占位实体），**不是业务表**。新增第一个真实实体时请：

1. 删除 `placeholder.go`
2. 按领域新增 `xxx.go`（`ent.Schema`）
3. `go generate ./ent`
