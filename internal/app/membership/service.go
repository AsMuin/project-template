package membership

import (
	"context"
	"errors"
	"log/slog"

	"projecttemp/internal/module/payment"
	"projecttemp/internal/module/user"
	"projecttemp/internal/pkg/logger"
	"projecttemp/internal/pkg/response"
	"projecttemp/internal/port"
)

// Result 支付履约（标已付 + 升 VIP）结果。
type Result struct {
	Payment *payment.Payment `json:"payment"`
	User    *user.User       `json:"user"`
}

// Service 跨 module 应用用例：支付成功并开通会员（本地事务）。
type Service struct {
	tx       port.TxManager
	payments payment.Repository
	users    user.Repository
	log      *slog.Logger
}

func NewService(tx port.TxManager, payments payment.Repository, users user.Repository) *Service {
	return &Service{
		tx:       tx,
		payments: payments,
		users:    users,
		log:      logger.Module("app.membership"),
	}
}

// ActivateByPayment 将支付单标为已支付并为下单用户开通 VIP。
// 整段在同一本地事务中；payment.MarkPaid 幂等，重复调用保持 VIP=true。
func (s *Service) ActivateByPayment(ctx context.Context, actorID, paymentID int64) (*Result, error) {
	if actorID <= 0 || paymentID <= 0 {
		return nil, response.NewBizErrorWithDetail(response.ParamsError, "无效的参数")
	}

	var out *Result
	err := s.tx.WithinTx(ctx, func(ctx context.Context) error {
		p, err := s.payments.FindByID(ctx, paymentID)
		if err != nil {
			return err
		}
		if p == nil {
			return response.NewBizError(response.NotFound)
		}
		if p.UserID != actorID {
			return response.NewBizError(response.NoAuth)
		}

		paid, err := s.payments.MarkPaid(ctx, paymentID)
		if err != nil {
			if errors.Is(err, payment.ErrInvalidTransition) {
				return response.NewBizErrorWithDetail(response.ParamsError, "当前支付单状态不可完成履约")
			}
			return err
		}
		if paid == nil {
			return response.NewBizError(response.NotFound)
		}

		u, err := s.users.SetVIP(ctx, paid.UserID, true)
		if err != nil {
			return err
		}
		if u == nil {
			return response.NewBizErrorWithDetail(response.NotFound, "支付单用户不存在")
		}

		out = &Result{Payment: paid, User: u}
		return nil
	})
	if err != nil {
		return nil, err
	}

	s.log.Info("membership activated by payment",
		logger.FieldPurpose, logger.PurposeBiz,
		logger.FieldEvent, "membership.activated_by_payment",
		"payment_id", paymentID,
		"user_id", actorID,
	)
	return out, nil
}
