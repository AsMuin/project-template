// Package api 存放业务向的 HTTP 传输入口（Handler + RouteRegistrar）。
//
// 与 httpapi 根包分工：
//   - internal/httpapi：协议基建（binding、middleware、错误映射、health、RegisterRouter）
//   - internal/httpapi/api/<area>：具体资源/用例的路由与 Handler
//
// Handler 只依赖 module.Service 或 app.Service，不依赖 repo / infra。
package api
