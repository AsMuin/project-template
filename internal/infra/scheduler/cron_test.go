package scheduler

import (
	"context"
	"sync/atomic"
	"testing"
	"time"
)

func TestSchedulerLifecycle(t *testing.T) {
	s := New()

	var runCount atomic.Int32
	_, err := s.Schedule("*/1 * * * * *", func() {
		runCount.Add(1)
	})
	if err != nil {
		t.Fatalf("schedule: %v", err)
	}

	s.Start()
	time.Sleep(1200 * time.Millisecond)

	if runCount.Load() == 0 {
		t.Fatalf("expected scheduled job to run at least once")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := s.Stop(ctx); err != nil {
		t.Fatalf("stop: %v", err)
	}

	afterStop := runCount.Load()
	time.Sleep(1200 * time.Millisecond)

	if runCount.Load() != afterStop {
		t.Fatalf("expected no new runs after stop")
	}

	if err := s.Stop(ctx); err != nil {
		t.Fatalf("second stop should be idempotent: %v", err)
	}
}
