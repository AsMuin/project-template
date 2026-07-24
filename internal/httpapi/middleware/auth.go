package middleware

import (
	"net/http"

	"projecttemp/internal/pkg/response"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// SessionKeyUserID session / context 中存放登录用户 ID 的键。
const SessionKeyUserID = "userID"

// AuthRequired 要求请求已登录，否则返回 401。
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		uid := session.Get(SessionKeyUserID)
		if uid == nil {
			c.JSON(http.StatusUnauthorized, response.FailWithCode(response.NotLogin, ""))
			c.Abort()
			return
		}
		c.Set(SessionKeyUserID, uid)
		c.Next()
	}
}

// GetLoginUserID 从请求上下文读取当前登录用户 ID。
func GetLoginUserID(c *gin.Context) (int64, error) {
	uid, exists := c.Get(SessionKeyUserID)
	if !exists {
		return 0, response.NewBizError(response.NotLogin)
	}
	id, ok := uid.(int64)
	if !ok {
		return 0, response.NewBizError(response.NotLogin)
	}
	return id, nil
}
