package objectstore

import "testing"

func TestOptions_Enabled(t *testing.T) {
	ok := Options{
		AccountID: "acc", AccessKeyID: "ak", SecretAccessKey: "sk",
		Bucket: "b", PublicBaseURL: "https://cdn.example.com",
	}
	if !ok.Enabled() {
		t.Fatal("expected enabled")
	}
	bad := ok
	bad.PublicBaseURL = ""
	if bad.Enabled() {
		t.Fatal("public base required")
	}
}

func TestNew_NilWhenDisabled(t *testing.T) {
	if New(Options{}) != nil {
		t.Fatal("expected nil")
	}
}
