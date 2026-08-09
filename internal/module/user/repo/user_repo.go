package repo

import (
	"context"
	"time"

	"projecttemp/ent"
	entgen "projecttemp/ent/user"
	"projecttemp/internal/module/user"
)

type UserRepo struct {
	client *ent.Client
}

func New(client *ent.Client) *UserRepo {
	return &UserRepo{client: client}
}

func (r *UserRepo) Create(ctx context.Context, in user.CreateRepoParams) (*user.User, error) {
	b := r.client.User.Create().
		SetAccount(in.Account).
		SetNickname(in.Nickname).
		SetPasswordHash(in.PasswordHash).
		SetGender(toEntGender(in.Gender))

	if in.Email != nil {
		b.SetEmail(*in.Email)
	}
	if in.Avatar != nil {
		b.SetAvatar(*in.Avatar)
	}
	if in.Age != nil {
		b.SetAge(*in.Age)
	}

	row, err := b.Save(ctx)
	if err != nil {
		if ent.IsConstraintError(err) {
			return nil, user.ErrAccountConflict
		}
		return nil, err
	}
	return toDomain(row), nil
}

func (r *UserRepo) FindByID(ctx context.Context, id int64) (*user.User, error) {
	row, err := r.client.User.Query().
		Where(
			entgen.IDEQ(id),
			entgen.DeletedAtIsNil(),
		).
		Only(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, nil
		}
		return nil, err
	}
	return toDomain(row), nil
}

func (r *UserRepo) FindByAccount(ctx context.Context, account string) (*user.UserWithSecret, error) {
	row, err := r.client.User.Query().
		Where(
			entgen.AccountEQ(account),
			entgen.DeletedAtIsNil(),
		).
		Only(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, nil
		}
		return nil, err
	}
	u := toDomain(row)
	return &user.UserWithSecret{User: *u, PasswordHash: row.PasswordHash}, nil
}

func (r *UserRepo) Update(ctx context.Context, id int64, in user.UpdateRepoParams) (*user.User, error) {
	b := r.client.User.UpdateOneID(id).
		Where(entgen.DeletedAtIsNil())

	if in.Nickname != nil {
		b.SetNickname(*in.Nickname)
	}
	if in.PasswordHash != nil {
		b.SetPasswordHash(*in.PasswordHash)
	}
	if in.Email != nil {
		b.SetEmail(*in.Email)
	}
	if in.Avatar != nil {
		b.SetAvatar(*in.Avatar)
	}
	if in.Age != nil {
		b.SetAge(*in.Age)
	}
	if in.Gender != nil {
		b.SetGender(toEntGender(*in.Gender))
	}

	row, err := b.Save(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, nil
		}
		return nil, err
	}
	return toDomain(row), nil
}

func (r *UserRepo) ExistsAccount(ctx context.Context, account string) (bool, error) {
	return r.client.User.Query().
		Where(
			entgen.AccountEQ(account),
			entgen.DeletedAtIsNil(),
		).
		Exist(ctx)
}

// SoftDelete 预留：当前接口未暴露，便于后续扩展。
func (r *UserRepo) SoftDelete(ctx context.Context, id int64) error {
	now := time.Now()
	n, err := r.client.User.Update().
		Where(entgen.IDEQ(id), entgen.DeletedAtIsNil()).
		SetDeletedAt(now).
		Save(ctx)
	if err != nil {
		return err
	}
	if n == 0 {
		return nil
	}
	return nil
}

func toDomain(row *ent.User) *user.User {
	return &user.User{
		ID:        row.ID,
		Account:   row.Account,
		Nickname:  row.Nickname,
		Email:     row.Email,
		Avatar:    row.Avatar,
		Age:       row.Age,
		Gender:    user.Gender(row.Gender),
		CreatedAt: row.CreatedAt,
		UpdatedAt: row.UpdatedAt,
	}
}

func toEntGender(g user.Gender) entgen.Gender {
	switch g {
	case user.GenderMale:
		return entgen.GenderMale
	case user.GenderFemale:
		return entgen.GenderFemale
	default:
		return entgen.GenderUnknown
	}
}
