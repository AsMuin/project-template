package scheduler

import (
	"context"
	"sync"

	"projecttemp/internal/pkg/logger"

	"github.com/robfig/cron/v3"
)

type Scheduler struct {
	client *cron.Cron
	// 主要作用是保证调度器的启动和停止是线程安全的
	mu      sync.Mutex
	started bool
}

func New() *Scheduler {
	cronLog := logger.NewCronLogger()

	return &Scheduler{
		client: cron.New(
			cron.WithSeconds(),
			cron.WithLogger(cronLog),
			cron.WithChain(
				cron.Recover(cronLog),
				cron.SkipIfStillRunning(cronLog),
			),
		),
	}
}

// Schedule 注册任务，不会启动调度器。
func (s *Scheduler) Schedule(spec string, cmd func()) (cron.EntryID, error) {
	id, err := s.client.AddFunc(spec, cmd)
	if err != nil {
		return 0, err
	}
	logger.Info("cron job registered",
		logger.FieldPurpose, logger.PurposeJob,
		logger.FieldModule, "scheduler",
		logger.FieldEvent, "cron.registered",
		"entry_id", id,
		"spec", spec,
	)
	return id, nil
}

// Start 启动调度器，多次调用幂等。
func (s *Scheduler) Start() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.started {
		return
	}
	s.client.Start()
	s.started = true
	logger.Info("scheduler started",
		logger.FieldPurpose, logger.PurposeJob,
		logger.FieldModule, "scheduler",
		logger.FieldEvent, "cron.started",
	)
}

// Stop 停止调度器并等待正在执行的任务结束。
func (s *Scheduler) Stop(ctx context.Context) error {
	s.mu.Lock()
	if !s.started {
		s.mu.Unlock()
		return nil
	}
	stopCtx := s.client.Stop()
	s.started = false
	s.mu.Unlock()

	if ctx == nil {
		<-stopCtx.Done()
		return nil
	}

	select {
	case <-stopCtx.Done():
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}
