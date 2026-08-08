package logger

import (
	"log/slog"
	"os"
	"strings"
	"sync"

	"projecttemp/internal/config"
)

// ---------- 字段名（slog 要求 key 为 string，故不用自定义类型）----------

const (
	FieldModule  = "module"
	FieldPurpose = "purpose"
	FieldEvent   = "event"
	FieldErr     = "err"
)

// ---------- 枚举型别名 ----------

// Level 日志级别。
type Level string

const (
	LevelDebug Level = "debug"
	LevelInfo  Level = "info"
	LevelWarn  Level = "warn"
	LevelError Level = "error"
)

// Format 输出格式。
type Format string

const (
	FormatText Format = "text"
	FormatJSON Format = "json"
)

// Purpose 日志用途（与 Level 正交）。
type Purpose string

const (
	PurposeJob   Purpose = "job"
	PurposeCache Purpose = "cache"
	PurposeInfra Purpose = "infra"
	PurposeAlert Purpose = "alert"
	PurposeHTTP  Purpose = "http"
	PurposeBiz   Purpose = "biz"
	PurposeAudit Purpose = "audit"
)

// ---------- 全局实例 ----------

var (
	mu     sync.Mutex
	global *slog.Logger
)

func init() {
	global = build("projecttemp", LevelInfo, FormatText)
	slog.SetDefault(global)
}

// Init 从环境变量初始化全局 logger。
func Init(config *config.AppConfig) {
	l := build(config.Name, parseLevel(config.LogLevel), parseFormat(config.LogFormat))
	mu.Lock()
	global = l
	mu.Unlock()
	slog.SetDefault(l)
}

func build(service string, level Level, format Format) *slog.Logger {
	opts := &slog.HandlerOptions{Level: level.Slog()}
	var h slog.Handler
	if format == FormatJSON {
		h = slog.NewJSONHandler(os.Stderr, opts)
	} else {
		h = slog.NewTextHandler(os.Stderr, opts)
	}
	if service == "" {
		service = "projecttemp"
	}
	return slog.New(h).With("service", service)
}

// Slog 将 Level 转为 slog.Level。
func (l Level) Slog() slog.Level {
	switch l {
	case LevelDebug:
		return slog.LevelDebug
	case LevelWarn:
		return slog.LevelWarn
	case LevelError:
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}

func parseLevel(s string) Level {
	switch Level(strings.ToLower(strings.TrimSpace(s))) {
	case LevelDebug, LevelInfo, LevelWarn, LevelError:
		return Level(strings.ToLower(strings.TrimSpace(s)))
	default:
		return LevelInfo
	}
}

func parseFormat(s string) Format {
	switch Format(strings.ToLower(strings.TrimSpace(s))) {
	case FormatJSON:
		return FormatJSON
	default:
		return FormatText
	}
}

// L 全局 logger。
func L() *slog.Logger {
	mu.Lock()
	defer mu.Unlock()
	return global
}

// Module 带 module 字段的子 logger。
func Module(name string) *slog.Logger {
	return L().With(FieldModule, name)
}

// With 在全局 logger 上附加字段。
func With(args ...any) *slog.Logger {
	return L().With(args...)
}

func Debug(msg string, args ...any) {
	L().Debug(msg, args...)
}
func Info(msg string, args ...any) {
	L().Info(msg, args...)
}
func Warn(msg string, args ...any) {
	L().Warn(msg, args...)
}
func Error(msg string, args ...any) {
	L().Error(msg, args...)
}

// Fatal 记录错误后退出进程（仅启动失败使用）。
func Fatal(msg string, args ...any) {
	L().Error(msg, args...)
	os.Exit(1)
}
