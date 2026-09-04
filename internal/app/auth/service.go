package auth

import (
	"context"
	"errors"
	"log/slog"

	"projecttemp/internal/module/user"
	"projecttemp/internal/pkg/logger"
	"projecttemp/internal/pkg/response"
)

// Service 认证相关应用用例。
type Service struct {
	users user.Repository
	log   *slog.Logger
}

func NewService(users user.Repository) *Service {
	return &Service{
		users: users,
		log:   logger.Module("app.auth"),
	}
}

func (s *Service) Register(ctx context.Context, in RegisterRequest) (*user.User, error) {
	exists, err := s.users.ExistsAccount(ctx, in.Account)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, response.NewBizErrorWithDetail(response.ParamsError, "账号已存在")
	}

	hash, err := user.HashPassword(in.Password)
	if err != nil {
		return nil, err
	}

	gender := in.Gender
	if gender == "" {
		gender = user.GenderUnknown
	}

	u, err := s.users.Create(ctx, user.CreateRepoParams{
		Account:      in.Account,
		Nickname:     in.Nickname,
		PasswordHash: hash,
		Email:        in.Email,
		Avatar:       in.Avatar,
		Age:          in.Age,
		Gender:       gender,
	})
	if err != nil {
		if errors.Is(err, user.ErrAccountConflict) {
			return nil, response.NewBizErrorWithDetail(response.ParamsError, "账号已存在")
		}
		return nil, err
	}

	s.log.Info("user registered",
		logger.FieldPurpose, logger.PurposeBiz,
		logger.FieldEvent, "user.registered",
		"user_id", u.ID,
		"account", u.Account,
	)
	return u, nil
}

func (s *Service) Login(ctx context.Context, in LoginRequest) (*user.User, error) {
	row, err := s.users.FindByAccount(ctx, in.Account)
	if err != nil {
		return nil, err
	}
	if row == nil || !user.CheckPassword(row.PasswordHash, in.Password) {
		return nil, response.NewBizErrorWithDetail(response.ParamsError, "账号或密码错误")
	}

	s.log.Info("user login",
		logger.FieldPurpose, logger.PurposeAudit,
		logger.FieldEvent, "user.login",
		"user_id", row.ID,
		"account", row.Account,
	)
	u := row.User
	return &u, nil
}
