package objectstore

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"path"
	"strings"
	"time"

	"projecttemp/internal/port"

	"github.com/google/uuid"
)

// PutBytes 上传字节切片。s 为 nil 时返回错误。
func PutBytes(ctx context.Context, s port.ObjectStore, folder, contentType string, data []byte) (string, error) {
	if s == nil {
		return "", fmt.Errorf("objectstore: not configured")
	}
	return s.Put(ctx, port.ObjectPutInput{
		Folder:      folder,
		ContentType: contentType,
		Body:        bytes.NewReader(data),
		Size:        int64(len(data)),
	})
}

// PublishSource 将 http(s) 或 data: URL 转存到 ObjectStore，返回公开 URL。
// s == nil 时原样返回 source（表示未启用对象存储）。
// 若 source 已位于 PublicBase 下则原样返回。
// maxBytes <=0 时默认 16MiB。
//
// 这是业务侧转存编排（下载/解析 + Put），不是 R2/S3 原生能力。
func PublishSource(ctx context.Context, s port.ObjectStore, source, folder string, maxBytes int64) (string, error) {
	if s == nil {
		return source, nil
	}
	source = strings.TrimSpace(source)
	if source == "" {
		return "", fmt.Errorf("objectstore: empty source")
	}
	if base := s.PublicBase(); base != "" && strings.HasPrefix(source, base+"/") {
		return source, nil
	}

	var (
		raw  []byte
		mime string
		err  error
	)
	switch {
	case strings.HasPrefix(source, "data:"):
		mime, raw, err = ParseDataURL(source)
		if err != nil {
			return "", err
		}
	case strings.HasPrefix(source, "http://"), strings.HasPrefix(source, "https://"):
		mime, raw, err = downloadURL(ctx, source, maxBytes)
		if err != nil {
			return "", err
		}
	default:
		return "", fmt.Errorf("objectstore: unsupported source scheme")
	}
	if len(raw) == 0 {
		return "", fmt.Errorf("objectstore: empty payload")
	}
	if mime == "" {
		mime = "application/octet-stream"
	}
	return PutBytes(ctx, s, folder, mime, raw)
}

// ParseDataURL 解析 data:[<mime>][;base64],<payload>
func ParseDataURL(s string) (mime string, raw []byte, err error) {
	if !strings.HasPrefix(s, "data:") {
		return "", nil, fmt.Errorf("objectstore: not data url")
	}
	comma := strings.Index(s, ",")
	if comma < 0 {
		return "", nil, fmt.Errorf("objectstore: invalid data url")
	}
	meta := s[5:comma]
	payload := s[comma+1:]
	mime = "application/octet-stream"
	if i := strings.Index(meta, ";"); i >= 0 {
		if i > 0 {
			mime = meta[:i]
		}
	} else if meta != "" {
		mime = meta
	}
	if strings.Contains(meta, "base64") {
		b, decErr := base64.StdEncoding.DecodeString(payload)
		return mime, b, decErr
	}
	return mime, []byte(payload), nil
}

func downloadURL(ctx context.Context, rawURL string, maxBytes int64) (mime string, data []byte, err error) {
	if maxBytes <= 0 {
		maxBytes = 16 << 20
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, rawURL, nil)
	if err != nil {
		return "", nil, err
	}
	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", nil, fmt.Errorf("objectstore: download: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", nil, fmt.Errorf("objectstore: download status=%d", resp.StatusCode)
	}
	limited, err := io.ReadAll(io.LimitReader(resp.Body, maxBytes+1))
	if err != nil {
		return "", nil, fmt.Errorf("objectstore: read body: %w", err)
	}
	if int64(len(limited)) > maxBytes {
		return "", nil, fmt.Errorf("objectstore: object too large (>%d bytes)", maxBytes)
	}
	mime = resp.Header.Get("Content-Type")
	if i := strings.Index(mime, ";"); i >= 0 {
		mime = strings.TrimSpace(mime[:i])
	}
	if mime == "" {
		mime = http.DetectContentType(limited)
	}
	return mime, limited, nil
}

// buildObjectKey 拼 key：{keyPrefix}/{folder}/{name}
func buildObjectKey(keyPrefix, folder, name string) string {
	parts := make([]string, 0, 3)
	if p := strings.Trim(strings.ReplaceAll(keyPrefix, "\\", "/"), "/"); p != "" {
		parts = append(parts, p)
	}
	if f := strings.Trim(strings.ReplaceAll(folder, "\\", "/"), "/"); f != "" {
		parts = append(parts, f)
	}
	name = strings.Trim(strings.ReplaceAll(name, "\\", "/"), "/")
	if name == "" {
		name = uuid.New().String()
	}
	name = path.Base(name) // 防止 path traversal
	parts = append(parts, name)
	return path.Join(parts...)
}

func extFromMIME(mime string) string {
	switch strings.ToLower(strings.TrimSpace(mime)) {
	case "image/png":
		return ".png"
	case "image/jpeg", "image/jpg":
		return ".jpg"
	case "image/gif":
		return ".gif"
	case "image/webp":
		return ".webp"
	case "image/svg+xml":
		return ".svg"
	case "application/pdf":
		return ".pdf"
	default:
		return ".bin"
	}
}

func autoName(contentType string) string {
	return uuid.New().String() + extFromMIME(contentType)
}
