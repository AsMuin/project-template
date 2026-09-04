package payment

import (
	"context"
	"errors"
	"log/slog"
	"strings"

	modpay "projecttemp/internal/module/payment"
	"projecttemp/internal/pkg/logger"
	"projecttemp/internal/pkg/response"
)

// Service 支付单应用用例（单域；升 VIP 见 app/membership）。
type Service struct {
	payments modpay.Repository
	log      *slog.Logger
}

func NewService(payments modpay.Repository) *Service {
	return &Service{
		payments: payments,
		log:      logger.Module("app.payment"),
	}
}

func (s *Service) Create(ctx context.Context, userID int64, in CreateRequest) (*modpay.Payment, error) {
	if userID <= 0 {
		return nil, response.NewBizErrorWithDetail(response.ParamsError, "无效的用户")
	}
	subject := strings.TrimSpace(in.Subject)
	if subject == "" {
		subject = "VIP membership"
	}

	p, err := s.payments.Create(ctx, modpay.CreateRepoParams{
		UserID:     userID,
		Method:     in.Method,
		AmountCent: in.AmountCent,
		Subject:    subject,
	})
	if err != nil {
		return nil, err
	}

	s.log.Info("payment created",
		logger.FieldPurpose, logger.PurposeBiz,
		logger.FieldEvent, "payment.created",
		"payment_id", p.ID,
		"user_id", userID,
		"method", string(in.Method),
		"amount_cent", in.AmountCent,
	)
	return p, nil
}

func (s *Service) GetByID(ctx context.Context, id, actorID int64) (*modpay.Payment, error) {
	p, err := s.payments.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, response.NewBizError(response.NotFound)
	}
	if p.UserID != actorID {
		return nil, response.NewBizError(response.NoAuth)
	}
	return p, nil
}

func (s *Service) ListMine(ctx context.Context, userID int64) ([]*modpay.Payment, error) {
	return s.payments.ListByUser(ctx, userID, 50)
}

// MarkPaid 仅支付域标已付；不开通 VIP。
func (s *Service) MarkPaid(ctx context.Context, id, actorID int64) (*modpay.Payment, error) {
	p, err := s.payments.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, response.NewBizError(response.NotFound)
	}
	if p.UserID != actorID {
		return nil, response.NewBizError(response.NoAuth)
	}

	out, err := s.payments.MarkPaid(ctx, id)
	if err != nil {
		if errors.Is(err, modpay.ErrInvalidTransition) {
			return nil, response.NewBizErrorWithDetail(response.ParamsError, "当前支付单状态不可标记为已支付")
		}
		return nil, err
	}

	s.log.Info("payment marked paid",
		logger.FieldPurpose, logger.PurposeBiz,
		logger.FieldEvent, "payment.marked_paid",
		"payment_id", id,
		"user_id", actorID,
		"status", string(out.Status),
	)
	return out, nil
}
