package port

import "context"

// TxManager 跨仓储本地事务端口：由 infra/database 实现，业务与 app 只依赖本接口。
//
// 约定：
//   - 由「用例入口」开启事务（通常是 app 用例，或单 module 内多写操作的 Service 方法）；
//   - 被编排的 Repository / 领域写方法不再自行 Begin，只通过 ctx 中的 client 参与同一事务；
//   - 嵌套 WithinTx 复用外层事务，避免 Service 互相调用时二次提交。
type TxManager interface {
	// WithinTx 在事务中执行 fn：成功则提交，失败则回滚。
	// 若 ctx 已处于事务中，则直接执行 fn，不新开事务。
	WithinTx(ctx context.Context, fn func(ctx context.Context) error) error
}
