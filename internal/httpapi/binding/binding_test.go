package binding

import "testing"

func TestStandardAndRegexpTags(t *testing.T) {
	v := NewValidator()
	type req struct {
		Account  string `validate:"required,min=3,max=20,regexp=^[a-zA-Z][a-zA-Z0-9_]*$"`
		Password string `validate:"required,min=6,max=20,hasalpha,hasdigit"`
		Gender   string `validate:"omitempty,oneof=unknown male female"`
	}

	if err := v.Validate(req{Account: "alice", Password: "pass1234", Gender: "male"}); err != nil {
		t.Fatalf("want ok: %v", err)
	}
	if err := v.Validate(req{Account: "1bad", Password: "pass1234"}); err == nil {
		t.Fatal("want account regexp fail")
	}
	if err := v.Validate(req{Account: "ab", Password: "pass1234"}); err == nil {
		t.Fatal("want account min fail")
	}
	if err := v.Validate(req{Account: "alice", Password: "password"}); err == nil {
		t.Fatal("want password hasdigit fail")
	}
	if err := v.Validate(req{Account: "alice", Password: "pass1234", Gender: "other"}); err == nil {
		t.Fatal("want gender oneof fail")
	}
}
