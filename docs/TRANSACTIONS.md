# 本地事务与跨 module 一致性

本模板使用 **同一 Postgres + 同一 ent.Client**。  
module 在代码上垂直分片，**并不**等于分库；跨 module 的强一致写通过 **共享事务（Unit of Work）** 完成。

## 1. 核心组件

| 组件 | 位置 | 职责 |
|------|------|------|
| `port.TxManager` | `internal/port/tx.go` | 业务/app 依赖的事务端口 |
| `database.TxManager` | `internal/infra/database/tx.go` | ent 实现：Begin/Commit/Rollback |
| `database.ClientFrom` | 同上 | repo 从 ctx 取当前 `*ent.Client`（事务内或根 Client） |
| 用例入口 | 优先 `internal/app/...` | 唯一决定何时 `WithinTx` |

```text
WithinTx(ctx)
  ├─ begin *ent.Tx（若尚未在事务中）
  ├─ ctx' = WithClient(tx.Client())
  ├─ repoA.Write(ctx')  → ClientFrom → 同一 Tx
  ├─ repoB.Write(ctx')  → ClientFrom → 同一 Tx
  └─ commit / rollback
```

## 2. 规则（必须遵守）

1. **所有** `module/*/repo` 通过 `database.ClientFrom(ctx, r.client)` 取 Client，禁止写死只用字段 `r.client` 而忽略 ctx。  
2. **禁止**在 repo 内 `Begin/Commit`；事务边界上移到用例。  
3. **一个业务动作只开一层逻辑事务**：由 app（或单 module 多写 Service）调用 `WithinTx`。  
4. 嵌套 `WithinTx` **复用**外层事务（已实现），但不要依赖“每个 Service 自己包一层”的隐式约定——所有权应清晰。  
5. 事务内 **不要** 调用外部 HTTP、长耗时消息、不确定的分布式锁等待；外部副作用放提交之后，并保证幂等。  
6. module 的 Service 若希望被 app 编进事务：写方法 **自身不再开事务**，只调 repo（tx-safe）。

## 3. 调用关系选择

| 需求 | 做法 |
|------|------|
| 跨 module **查询** / 非原子流程 | 调对方 **Service** |
| 跨 module **强一致写** | **app 用例** + `WithinTx` + 各方 **Repository**（或 tx-safe Service 方法） |
| 单 module 内多表原子写 | 该 module Service 注入 `TxManager` 后 `WithinTx`，不必建 app |
| 跨库 / 未来独立服务 | 本地事务 + Outbox / 领域事件，最终一致（本模板不内置消息总线） |

> 旧约定「跨 module 只调 Service」仍然适用于非事务路径。  
> 强一致写路径允许 app **依赖多个 module 的 Repository 接口**（仍不依赖 `repo` 实现包）。

用例层在 `app`（含 `*Request`）；module 仅领域+repo。本仓库已实现 POC：`app/membership.ActivateByPayment` + `POST /api/membership/activate`（HTTP 方案 C，见 [HTTP_LAYOUT.md](HTTP_LAYOUT.md)）。

## 4. 完整示例：支付升会员

假设已有 `payment` 与 `user` 两个 module（示意代码，非仓库内实体）。

### 4.1 Repository 均走 ClientFrom

```go
func (r *OrderRepo) MarkPaid(ctx context.Context, id int64) error {
    c := database.ClientFrom(ctx, r.client)
    return c.PaymentOrder.UpdateOneID(id).SetStatus("paid").Exec(ctx)
}
```

### 4.2 app 用例

```go
package membership

type UpgradeService struct {
    tx      port.TxManager
    orders  payment.Repository
    users   user.Repository
}

func NewUpgradeService(tx port.TxManager, orders payment.Repository, users user.Repository) *UpgradeService {
    return &UpgradeService{tx: tx, orders: orders, users: users}
}

func (s *UpgradeService) OnPaid(ctx context.Context, userID, orderID int64) error {
    return s.tx.WithinTx(ctx, func(ctx context.Context) error {
        if err := s.orders.MarkPaid(ctx, orderID); err != nil {
            return err
        }
        // 领域字段按实际 schema 扩展；此处表达「与 MarkPaid 同事务」
        _, err := s.users.Update(ctx, userID, user.UpdateRepoParams{
            // Nickname: ... 或专用 ActivateMembership
        })
        return err
    })
}
```

### 4.3 cmd 装配

```go
txm := database.NewTxManager(db.Client)
userRepo := userrepo.New(db.Client)
payRepo := paymentrepo.New(db.Client)

userSvc := user.NewService(userRepo)
upgradeSvc := membership.NewUpgradeService(txm, payRepo, userRepo)

// httpapi 注册时注入 upgradeSvc
```

### 4.4 失败语义

- `MarkPaid` 成功但 `users.Update` 失败 → **整笔回滚**，订单不会保持 paid。  
- 回调重试必须 **幂等**（已 paid / 已是会员则成功返回）。

## 5. 反模式

| 反模式 | 问题 |
|--------|------|
| `payment.Service` 开事务写完再调 `user.Service`（对方再用根 Client 写） | 不是同一事务，中途崩溃会双写不一致 |
| repo 直接依赖另一个 module 的 repo 实现 | 破坏边界，难测、易循环依赖 |
| 事务里调支付渠道 HTTP 并等待 | 长事务锁行、超时放大 |
| 为每个 module 创建独立 `ent.Client`/库却指望本地事务 | 做不到；应事件驱动 |

## 6. 与缓存

- 读：可继续 `port.Cache`；注意事务未提交前不要把脏数据写入缓存。  
- 写：在 **Commit 成功之后** 再 `Cache.Delete`；或用 Outbox 延后失效。

## 7. 测试建议

- 单测 `ClientFrom` / 嵌套复用（见 `infra/database/tx_test.go`）。  
- 集成测：`WithinTx` 中第二步返回 error，断言两表均无提交（需本机 Postgres）。  
- app 用例：对 Repository 打假实现，断言调用顺序与错误传播。
