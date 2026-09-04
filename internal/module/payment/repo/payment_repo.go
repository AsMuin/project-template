package repo

import (
	"context"
	"time"

	"projecttemp/ent"
	entpay "projecttemp/ent/payment"
	"projecttemp/internal/infra/database"
	"projecttemp/internal/module/payment"
)

// PaymentRepo 支付单持久化适配器（ClientFrom 支持外层事务）。
type PaymentRepo struct {
	client *ent.Client
}

func New(client *ent.Client) *PaymentRepo {
	return &PaymentRepo{client: client}
}

func (r *PaymentRepo) ent(ctx context.Context) *ent.Client {
	return database.ClientFrom(ctx, r.client)
}

func (r *PaymentRepo) Create(ctx context.Context, in payment.CreateRepoParams) (*payment.Payment, error) {
	row, err := r.ent(ctx).Payment.Create().
		SetUserID(in.UserID).
		SetMethod(toEntMethod(in.Method)).
		SetStatus(entpay.StatusPending).
		SetAmountCent(in.AmountCent).
		SetSubject(in.Subject).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return toDomain(row), nil
}

func (r *PaymentRepo) FindByID(ctx context.Context, id int64) (*payment.Payment, error) {
	row, err := r.ent(ctx).Payment.Get(ctx, id)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, nil
		}
		return nil, err
	}
	return toDomain(row), nil
}

func (r *PaymentRepo) MarkPaid(ctx context.Context, id int64) (*payment.Payment, error) {
	c := r.ent(ctx)
	row, err := c.Payment.Get(ctx, id)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, nil
		}
		return nil, err
	}
	switch row.Status {
	case entpay.StatusPaid:
		return toDomain(row), nil // 幂等
	case entpay.StatusPending:
		// continue
	default:
		return nil, payment.ErrInvalidTransition
	}

	now := time.Now()
	updated, err := c.Payment.UpdateOneID(id).
		Where(entpay.StatusEQ(entpay.StatusPending)).
		SetStatus(entpay.StatusPaid).
		SetPaidAt(now).
		Save(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			// 并发下可能已被其它事务更新
			row2, err2 := c.Payment.Get(ctx, id)
			if err2 != nil {
				return nil, err2
			}
			if row2.Status == entpay.StatusPaid {
				return toDomain(row2), nil
			}
			return nil, payment.ErrInvalidTransition
		}
		return nil, err
	}
	return toDomain(updated), nil
}

func (r *PaymentRepo) ListByUser(ctx context.Context, userID int64, limit int) ([]*payment.Payment, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	rows, err := r.ent(ctx).Payment.Query().
		Where(entpay.UserIDEQ(userID)).
		Order(ent.Desc(entpay.FieldID)).
		Limit(limit).
		All(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]*payment.Payment, 0, len(rows))
	for _, row := range rows {
		out = append(out, toDomain(row))
	}
	return out, nil
}

func toDomain(row *ent.Payment) *payment.Payment {
	return &payment.Payment{
		ID:         row.ID,
		UserID:     row.UserID,
		Method:     payment.Method(row.Method),
		Status:     payment.Status(row.Status),
		AmountCent: row.AmountCent,
		Subject:    row.Subject,
		PaidAt:     row.PaidAt,
		CreatedAt:  row.CreatedAt,
		UpdatedAt:  row.UpdatedAt,
	}
}

func toEntMethod(m payment.Method) entpay.Method {
	switch m {
	case payment.MethodWechat:
		return entpay.MethodWechat
	case payment.MethodAlipay:
		return entpay.MethodAlipay
	case payment.MethodCard:
		return entpay.MethodCard
	default:
		return entpay.MethodMock
	}
}
