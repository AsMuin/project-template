package middleware

import (
	"projecttemp/internal/pkg/response"

	"github.com/labstack/echo-contrib/v5/session"
	"github.com/labstack/echo/v5"
)

// SessionName 与 cookie 名一致，登录/鉴权共用。
const SessionName = "session"

// SessionKeyUserID session / context 中存放登录用户 ID 的键。
const SessionKeyUserID = "userID"

// AuthRequired 要求请求已登录；未登录时 return BizError，由全局 HTTPErrorHandler 写 401 JSON。
func AuthRequired() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			sess, err := session.Get(SessionName, c)
			if err != nil {
				return response.NewBizError(response.NotLogin)
			}
			uid, ok := asInt64(sess.Values[SessionKeyUserID])
			if !ok || uid == 0 {
				return response.NewBizError(response.NotLogin)
			}
			c.Set(SessionKeyUserID, uid)
			return next(c)
		}
	}
}

// GetLoginUserID 从请求上下文读取当前登录用户 ID（应在 AuthRequired 之后调用）。
func GetLoginUserID(c *echo.Context) (int64, error) {
	uid, ok := asInt64(c.Get(SessionKeyUserID))
	if !ok || uid == 0 {
		return 0, response.NewBizError(response.NotLogin)
	}
	return uid, nil
}

// SaveLoginUserID 写入登录用户 ID 并持久化 session（供登录 Handler 调用）。
func SaveLoginUserID(c *echo.Context, userID int64) error {
	if userID == 0 {
		return response.NewBizError(response.ParamsError)
	}
	sess, err := session.Get(SessionName, c)
	if err != nil {
		return err
	}
	sess.Values[SessionKeyUserID] = userID
	if err := sess.Save(c.Request(), c.Response()); err != nil {
		return err
	}
	c.Set(SessionKeyUserID, userID)
	return nil
}

// ClearLoginSession 清除登录态（供登出 Handler 调用）。
func ClearLoginSession(c *echo.Context) error {
	sess, err := session.Get(SessionName, c)
	if err != nil {
		return err
	}
	delete(sess.Values, SessionKeyUserID)
	// MaxAge < 0：指示 store 删除 session 并让浏览器丢弃 cookie
	sess.Options.MaxAge = -1
	return sess.Save(c.Request(), c.Response())
}

func asInt64(v any) (int64, bool) {
	switch n := v.(type) {
	case int64:
		return n, true
	case int:
		return int64(n), true
	case int32:
		return int64(n), true
	case uint64:
		if n > uint64(^uint64(0)>>1) {
			return 0, false
		}
		return int64(n), true
	case float64:
		return int64(n), true
	default:
		return 0, false
	}
}
