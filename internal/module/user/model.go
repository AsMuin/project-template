package user

import "time"

// Gender 与 ent schema 对齐。
type Gender string

const (
	GenderUnknown Gender = "unknown"
	GenderMale    Gender = "male"
	GenderFemale  Gender = "female"
)

// User 用户领域实体（对外可序列化为 API 响应；不含 password_hash）。
type User struct {
	ID        int64     `json:"id"`
	Account   string    `json:"account"`
	Nickname  string    `json:"nickname"`
	Email     *string   `json:"email,omitempty"`
	Avatar    *string   `json:"avatar,omitempty"`
	Age       *int      `json:"age,omitempty"`
	Gender    Gender    `json:"gender"`
	VIP       bool      `json:"vip"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
