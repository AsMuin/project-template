// Package objectstore 实现 port.ObjectStore（当前为 Cloudflare R2 / S3 兼容）。
package objectstore

import (
	"strings"

	"projecttemp/internal/config"
	"projecttemp/internal/port"
)

// Options 构造参数（不依赖完整 config.Config，便于单测）。
type Options struct {
	// Provider 预留："r2"；空视为 r2。
	Provider string

	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	Endpoint        string // 空则按 AccountID 推导 R2 endpoint
	PublicBaseURL   string // 对外 URL 前缀，必需才能启用
	KeyPrefix       string // 全局 key 前缀，如 articles/images
}

// Enabled 判断配置是否齐全能真正上传。
func (o Options) Enabled() bool {
	if strings.TrimSpace(o.AccessKeyID) == "" || strings.TrimSpace(o.SecretAccessKey) == "" {
		return false
	}
	if strings.TrimSpace(o.Bucket) == "" || strings.TrimSpace(o.PublicBaseURL) == "" {
		return false
	}
	if strings.TrimSpace(o.Endpoint) == "" && strings.TrimSpace(o.AccountID) == "" {
		return false
	}
	return true
}

// New 按 Options 创建 ObjectStore；未配齐或未知 Provider 时返回 nil。
func New(opt Options) port.ObjectStore {
	if !opt.Enabled() {
		return nil
	}
	provider := strings.ToLower(strings.TrimSpace(opt.Provider))
	if provider == "" || provider == "r2" {
		return newR2(opt)
	}
	return nil
}

// NewFromConfig 从应用 R2 配置构造；未启用时返回 nil。
func NewFromConfig(r config.R2Config) port.ObjectStore {
	return New(Options{
		Provider:        "r2",
		AccountID:       r.AccountID,
		AccessKeyID:     r.AccessKeyID,
		SecretAccessKey: r.SecretAccessKey,
		Bucket:          r.Bucket,
		Endpoint:        r.Endpoint,
		PublicBaseURL:   r.PublicBaseURL,
		KeyPrefix:       r.KeyPrefix,
	})
}
