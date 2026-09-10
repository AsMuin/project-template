package objectstore

import (
	"context"
	"strings"
	"testing"

	"projecttemp/internal/port"
)

func TestParseDataURL(t *testing.T) {
	mime, raw, err := ParseDataURL("data:image/png;base64,aGk=")
	if err != nil {
		t.Fatal(err)
	}
	if mime != "image/png" || string(raw) != "hi" {
		t.Fatalf("mime=%s raw=%q", mime, raw)
	}
}

func TestBuildObjectKey(t *testing.T) {
	got := buildObjectKey("articles/images", "avatars", "a.png")
	if got != "articles/images/avatars/a.png" {
		t.Fatal(got)
	}
	got = buildObjectKey("", "x", "../etc/passwd")
	if got != "x/passwd" {
		t.Fatalf("traversal: %s", got)
	}
}

func TestExtFromMIME(t *testing.T) {
	if extFromMIME("image/jpeg") != ".jpg" {
		t.Fatal()
	}
}

func TestPublishSource_NilStoreKeepsSource(t *testing.T) {
	u, err := PublishSource(context.Background(), nil, "https://example.com/a.png", "pexels", 0)
	if err != nil {
		t.Fatal(err)
	}
	if u != "https://example.com/a.png" {
		t.Fatal(u)
	}
}

func TestPublishSource_AlreadyPublic(t *testing.T) {
	st := staticBaseStore{base: "https://cdn.example.com"}
	u, err := PublishSource(context.Background(), st, "https://cdn.example.com/a/b.png", "x", 0)
	if err != nil {
		t.Fatal(err)
	}
	if u != "https://cdn.example.com/a/b.png" {
		t.Fatal(u)
	}
}

type staticBaseStore struct{ base string }

func (s staticBaseStore) PublicBase() string { return s.base }
func (s staticBaseStore) Put(ctx context.Context, in port.ObjectPutInput) (string, error) {
	return s.base + "/uploaded", nil
}

func TestAutoName(t *testing.T) {
	n := autoName("image/png")
	if !strings.HasSuffix(n, ".png") || len(n) < 10 {
		t.Fatal(n)
	}
}

func TestPutBytes_NilStore(t *testing.T) {
	_, err := PutBytes(context.Background(), nil, "avatars", "image/png", []byte("x"))
	if err == nil {
		t.Fatal("expected error")
	}
}
