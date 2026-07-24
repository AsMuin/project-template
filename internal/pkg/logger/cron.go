package logger

import "log/slog"

// CronLogger 适配 robfig/cron 的 Logger。
type CronLogger struct{ l *slog.Logger }

// NewCronLogger 带 module=scheduler、purpose=job。
func NewCronLogger() CronLogger {
	return CronLogger{l: L().With(FieldModule, "scheduler", FieldPurpose, PurposeJob)}
}

func (c CronLogger) Info(msg string, keysAndValues ...interface{}) {
	c.l.Info(msg, keysAndValues...)
}

func (c CronLogger) Error(err error, msg string, keysAndValues ...interface{}) {
	args := keysAndValues
	if err != nil {
		args = append([]any{FieldErr, err}, keysAndValues...)
	}
	c.l.Error(msg, args...)
}
