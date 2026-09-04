// Package app 是唯一应用用例层：全部业务用例与 *Request 入参放在这里。
//
//	httpapi/api → app.<usecase>.Service（Bind app.*Request）
//	app         → module 的实体 / Repository 接口 / 领域工具
//	module/*/repo → ent（ClientFrom）
//
// module 不再提供 Service。跨域事务同样在 app（如 membership）内 WithinTx。
package app
