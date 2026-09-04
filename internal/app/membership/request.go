package membership

// ActivateRequest 通过支付单开通会员。
type ActivateRequest struct {
	PaymentID int64 `json:"paymentId" validate:"required,gte=1"`
}
