// Package docsui 用 go-scalar-api-reference 提供 API 文档页。
// Spec 来自 swag 生成物（swag.ReadDoc）；展示层为 Scalar。
package docsui

import (
	"net/http"

	"github.com/MarceloPetrucio/go-scalar-api-reference"
	"github.com/labstack/echo/v5"
	"github.com/swaggo/swag"
)

// Register 挂载 GET /docs（Scalar UI，Spec 内嵌进 HTML）。
func Register(e *echo.Echo) {
	e.GET("/docs", serveDocs)
}

func serveDocs(c *echo.Context) error {
	doc, err := swag.ReadDoc()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "openapi spec unavailable: "+err.Error())
	}

	html, err := scalar.ApiReferenceHTML(&scalar.Options{
		SpecContent: doc,
		DarkMode:    true,
		Theme:       scalar.ThemeDefault,
		Layout:      scalar.LayoutModern,
		CustomOptions: scalar.CustomOptions{
			PageTitle: "Wood Passage Creator API",
		},
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "scalar html: "+err.Error())
	}
	return c.HTML(http.StatusOK, html)
}
