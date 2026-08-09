# ent schema

手写表结构只放这里，改完后：

```bash
go generate ./ent
```

服务启动时 `database.Migrate` 会按当前 schema 建表（以项目现状为准）。

## 当前实体

| Schema | 说明 |
|--------|------|
| `User` | 基础用户（账号/密码哈希/资料/软删除） |

新增实体：在本目录添加 `xxx.go` → `go generate ./ent`。
