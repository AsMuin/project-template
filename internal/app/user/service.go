package user

import (
	"context"
	"log/slog"

	moduser "projecttemp/internal/module/user"
	"projecttemp/internal/pkg/logger"
	"projecttemp/internal/pkg/response"
)

// Service 用户资料相关应用用例。
type Service struct {
	users moduser.Repository
	log   *slog.Logger
}

func NewService(users moduser.Repository) *Service {
	return &Service{
		users: users,
		log:   logger.Module("app.user"),
	}
}

func (s *Service) GetByID(ctx context.Context, id int64) (*moduser.User, error) {
	u, err := s.users.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, response.NewBizError(response.NotFound)
	}
	return u, nil
}

func (s *Service) Update(ctx context.Context, actorID, targetID int64, in UpdateRequest) (*moduser.User, error) {
	if actorID != targetID {
		return nil, response.NewBizError(response.NoAuth)
	}

	existing, err := s.users.FindByID(ctx, targetID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, response.NewBizError(response.NotFound)
	}

	repoIn := moduser.UpdateRepoParams{
		Nickname: in.Nickname,
		Email:    in.Email,
		Avatar:   in.Avatar,
		Age:      in.Age,
		Gender:   in.Gender,
	}
	if in.Password != nil {
		hash, err := moduser.HashPassword(*in.Password)
		if err != nil {
			return nil, err
		}
		repoIn.PasswordHash = &hash
	}

	u, err := s.users.Update(ctx, targetID, repoIn)
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, response.NewBizError(response.NotFound)
	}

	s.log.Info("user updated",
		logger.FieldPurpose, logger.PurposeBiz,
		logger.FieldEvent, "user.updated",
		"user_id", targetID,
	)
	return u, nil
}
