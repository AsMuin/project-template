package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"projecttemp/internal/app/auth"
	"projecttemp/internal/app/membership"
	apppay "projecttemp/internal/app/payment"
	appuser "projecttemp/internal/app/user"
	"projecttemp/internal/config"
	"projecttemp/internal/httpapi"
	authapi "projecttemp/internal/httpapi/api/auth"
	membershipapi "projecttemp/internal/httpapi/api/membership"
	paymentapi "projecttemp/internal/httpapi/api/payment"
	userapi "projecttemp/internal/httpapi/api/user"
	"projecttemp/internal/httpapi/binding"
	"projecttemp/internal/httpapi/docsui"
	httpmw "projecttemp/internal/httpapi/middleware"
	"projecttemp/internal/infra/database"
	"projecttemp/internal/infra/redis"
	"projecttemp/internal/infra/scheduler"
	paymentrepo "projecttemp/internal/module/payment/repo"
	userrepo "projecttemp/internal/module/user/repo"
	"projecttemp/internal/pkg/logger"

	"github.com/labstack/echo-contrib/v5/session"
	"github.com/labstack/echo/v5"
	echomw "github.com/labstack/echo/v5/middleware"

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
	cfg := config.LoadConfig()
	logger.Init(&cfg.App)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	e := echo.New()
	e.Validator = binding.NewValidator()
	e.HTTPErrorHandler = httpapi.HTTPErrorHandler

	e.Use(echomw.Recover())
	e.Use(echomw.RequestID())
	e.Use(httpmw.AccessLog())

	db, err := database.New(&cfg.Database)
	if err != nil {
		logger.Fatal("connect db failed", logger.FieldErr, err)
	}
	defer db.Close()

	if err := db.Migrate(ctx); err != nil {
		logger.Fatal("migrate failed", logger.FieldErr, err)
	}

	store, err := redis.NewSessionStore(&cfg.Redis, cfg.Session)
	if err != nil {
		logger.Fatal("load redis session store failed", logger.FieldErr, err)
	}

	redisClient, err := redis.NewClient(&cfg.Redis)
	if err != nil {
		logger.Fatal("connect redis failed", logger.FieldErr, err)
	}
	defer redisClient.Close()

	// 装配：module=领域+repo；app=全部用例+*Request；httpapi/api 只依赖 app。
	// locker := lock.New(redisClient)
	// cacheClient := cache.New(redisClient)
	_ = redisClient
	txm := database.NewTxManager(db.Client)
	userRepo := userrepo.New(db.Client)
	payRepo := paymentrepo.New(db.Client)

	authSvc := auth.NewService(userRepo)
	userSvc := appuser.NewService(userRepo)
	paymentSvc := apppay.NewService(payRepo)
	membershipSvc := membership.NewService(txm, payRepo, userRepo)

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

	e.Use(session.Middleware(store))

	docsui.Register(e)

	httpapi.RegisterRouter(e,
		authapi.NewRegistrar(authSvc),
		userapi.NewRegistrar(userSvc),
		paymentapi.NewRegistrar(paymentSvc),
		membershipapi.NewRegistrar(membershipSvc),
	)

	logger.Info("http server starting",
		logger.FieldPurpose, logger.PurposeInfra,
		logger.FieldEvent, "http.listen",
		"addr", ":8080",
	)

	sc := echo.StartConfig{
		Address:    ":8080",
		HideBanner: true,
	}
	if err := sc.Start(ctx, e); err != nil && !errors.Is(err, http.ErrServerClosed) {
		logger.Fatal("http server stopped", logger.FieldErr, err)
	}
}
