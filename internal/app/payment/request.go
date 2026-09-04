package payment

import modpay "projecttemp/internal/module/payment"

// CreateRequest 创建支付单用例入参。
type CreateRequest struct {
	Method     modpay.Method `json:"method" validate:"required,oneof=wechat alipay card mock"`
	AmountCent int64         `json:"amountCent" validate:"required,gte=1"`
	Subject    string        `json:"subject" validate:"omitempty,max=128"`
}

// MarkPaidRequest 标记已支付（POC；可为空 body）。
type MarkPaidRequest struct{}
