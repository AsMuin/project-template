package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"projecttemp/internal/pkg/response"
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v5"
)

func TestMapError_BizError(t *testing.T) {
	status, body := mapError(response.NewBizError(response.NotLogin))
	if status != http.StatusUnauthorized {
		t.Fatalf("status=%d", status)
	}
	if body.Code != response.NotLogin.Biz || body.Message != response.NotLogin.Message {
		t.Fatalf("body=%+v", body)
	}
}

func TestMapError_Validation(t *testing.T) {
	type req struct {
		Name string `validate:"required"`
	}
	err := validator.New().Struct(req{})
	status, body := mapError(err)
	if status != http.StatusBadRequest || body.Code != response.ParamsError.Biz {
		t.Fatalf("status=%d body=%+v", status, body)
	}
}

func TestMapError_Unknown(t *testing.T) {
	status, body := mapError(errors.New("boom"))
	if status != http.StatusInternalServerError || body.Code != response.SystemError.Biz {
		t.Fatalf("status=%d body=%+v", status, body)
	}
	if body.Message == "boom" {
		t.Fatal("must not leak internal error message")
	}
}

func TestHTTPErrorHandler_WritesJSON(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	HTTPErrorHandler(c, response.NewBizError(response.NotLogin))

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("code=%d", rec.Code)
	}
	var got response.Response
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		t.Fatal(err)
	}
	if got.Code != response.NotLogin.Biz {
		t.Fatalf("got=%+v", got)
	}
}
