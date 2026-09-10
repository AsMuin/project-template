package port

import (
	"context"
	"io"
)

// ObjectStore 对象存储端口。未配置时实现方可返回 nil，调用方 if store != nil 再上传。
// 由 infra/objectstore 实现；配图转存、头像等共用。
type ObjectStore interface {
	// Put 上传对象，返回可公开访问的 URL。
	Put(ctx context.Context, in ObjectPutInput) (publicURL string, err error)
	// PublicBase 公开访问前缀（无尾斜杠）。
	PublicBase() string
}

// ObjectPutInput 一次上传请求。
type ObjectPutInput struct {
	// Folder 逻辑目录，如 "pexels"、"avatars"；会拼在实现侧 KeyPrefix 之后。
	Folder string
	// Name 对象文件名；空则由实现自动生成。
	Name string
	// ContentType MIME，建议填写。
	ContentType string
	// Body 内容流。
	Body io.Reader
	// Size 可选；>0 时部分实现可少一次缓冲。
	Size int64
}
