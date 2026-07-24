package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"projecttemp/internal/httpapi"
	"projecttemp/internal/infra/database"
	"projecttemp/internal/infra/redis"
	"projecttemp/internal/infra/scheduler"
	"projecttemp/internal/pkg/logger"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "projecttemp/docs/api/swagger"
)

// @title           Go Web API Template
// @version         1.0
// @description     Go Web 后端工程模板接口文档（业务模块由使用者自行接入）
// @host            localhost:8080
// @BasePath        /api
// @securityDefinitions.apikey SessionAuth
// @in header
// @name Cookie
// @description Session cookie authentication. Example: session=your-session-id

func main() {
	logger.Init()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	r := gin.Default()

	db, err := database.New()
	if err != nil {
		logger.Fatal("connect db failed", logger.FieldErr, err)
	}
	defer db.Close()

	if err := db.Migrate(ctx); err != nil {
		logger.Fatal("migrate failed", logger.FieldErr, err)
	}

	store, err := redis.NewSessionStore()
	if err != nil {
		logger.Fatal("load redis session store failed", logger.FieldErr, err)
	}

	redisClient, err := redis.NewClient()
	if err != nil {
		logger.Fatal("connect redis failed", logger.FieldErr, err)
	}
	defer redisClient.Close()

	// 业务装配示例（接入 module 后取消注释并注入）：
	// locker := lock.New(redisClient)
	// cacheClient := cache.New(redisClient)
	// xxxSvc := xxx.NewService(xxxrepo.New(db.Client), cacheClient, locker)
	_ = redisClient // 保持连接就绪；接入 cache/lock 时去掉此行

	// 定时任务骨架：注册业务 job 后 Start
	sched := scheduler.New()
	// if _, err := sched.Schedule("0 0 3 * * *", func() { ... }); err != nil {
	// 	logger.Fatal("schedule job failed", logger.FieldErr, err)
	// }
	sched.Start()
	defer func() {
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()
		if err := sched.Stop(shutdownCtx); err != nil {
			logger.Warn("scheduler stop",
				logger.FieldPurpose, logger.PurposeJob,
				logger.FieldModule, "scheduler",
				logger.FieldEvent, "cron.stop_error",
				logger.FieldErr, err,
			)
		}
	}()

	r.Use(sessions.Sessions("session", store))

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// 接入业务后：httpapi.RegisterRouter(r, xxxSvc, ...)
	httpapi.RegisterRouter(r)

	logger.Info("http server starting",
		logger.FieldPurpose, logger.PurposeInfra,
		logger.FieldEvent, "http.listen",
		"addr", ":8080",
	)
	if err := r.Run(":8080"); err != nil {
		logger.Fatal("http server stopped", logger.FieldErr, err)
	}
}
