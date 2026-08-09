package config

import "testing"

func TestSessionConfigNormalized(t *testing.T) {
	got := SessionConfig{}.Normalized()
	if got.Secret != defaultSessionSecret {
		t.Fatalf("secret=%q", got.Secret)
	}
	if got.MaxAge != defaultSessionMaxAge {
		t.Fatalf("maxAge=%d", got.MaxAge)
	}

	got = SessionConfig{Secret: "x", MaxAge: 60, Secure: true}.Normalized()
	if got.Secret != "x" || got.MaxAge != 60 || !got.Secure {
		t.Fatalf("%+v", got)
	}
}
