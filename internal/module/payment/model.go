package payment

import "time"

// Method 支付方式。
type Method string

const (
	MethodWechat Method = "wechat"
	MethodAlipay Method = "alipay"
	MethodCard   Method = "card"
	MethodMock   Method = "mock" // 本地/POC 模拟支付
)

// Status 支付状态。
type Status string

const (
	StatusPending   Status = "pending"
	StatusPaid      Status = "paid"
	StatusFailed    Status = "failed"
	StatusCancelled Status = "cancelled"
)

// Payment 支付单领域实体。
type Payment struct {
	ID         int64      `json:"id"`
	UserID     int64      `json:"userId"`
	Method     Method     `json:"method"`
	Status     Status     `json:"status"`
	AmountCent int64      `json:"amountCent"`
	Subject    string     `json:"subject"`
	PaidAt     *time.Time `json:"paidAt,omitempty"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  time.Time  `json:"updatedAt"`
}
