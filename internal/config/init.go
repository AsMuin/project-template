package config

import (
	"log"
	"strings"
	"sync"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

type Config struct {
	App      AppConfig      `mapstructure:"app"`
	Database DatabaseConfig `mapstructure:"database"`
	Redis    RedisConfig    `mapstructure:"redis"`
	Session  SessionConfig  `mapstructure:"session"`
}

type AppConfig struct {
	Name      string `mapstructure:"name"`
	Env       string `mapstructure:"env"`
	LogLevel  string `mapstructure:"log_level"`
	LogFormat string `mapstructure:"log_format"`
}

type DatabaseConfig struct {
	Host         string `mapstructure:"host"`
	Port         int    `mapstructure:"port"`
	User         string `mapstructure:"user"`
	Password     string `mapstructure:"password"`
	DBName       string `mapstructure:"db_name"`
	MaxIdleConns int    `mapstructure:"max_idle_conns"`
	MaxOpenConns int    `mapstructure:"max_open_conns"`
}

type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
}

// SessionConfig Cookie Session（Redis 后端）相关配置。
type SessionConfig struct {
	// Secret 用于签名 session cookie，生产必须通过环境变量覆盖。
	Secret string `mapstructure:"secret"`
	// MaxAge session 有效期（秒），默认 7 天。
	MaxAge int `mapstructure:"max_age"`
	// Secure 是否仅 HTTPS 发送 cookie；生产 HTTPS 环境应设为 true。
	Secure bool `mapstructure:"secure"`
}

const (
	defaultSessionSecret = "change-me-session-secret"
	defaultSessionMaxAge = 86400 * 7
)

// Normalized 返回填好默认值后的副本，避免调用方重复判断。
func (c SessionConfig) Normalized() SessionConfig {
	out := c
	if out.Secret == "" {
		out.Secret = defaultSessionSecret
	}
	if out.MaxAge <= 0 {
		out.MaxAge = defaultSessionMaxAge
	}
	return out
}

var (
	globalConfig *Config
	loadOnce     sync.Once
)

func LoadConfig() *Config {
	loadOnce.Do(func() {
		// 1. 本地开发时，从 .env 文件加载变量到操作系统的 Env 中。
		// 线上通过 Docker compose / K8s 注入时，如果没有 .env 文件也没关系，所以忽略错误。
		_ = godotenv.Load()

		v := viper.New()

		// 2. 设置骨架配置文件 config.yml
		v.SetConfigName("config")   // 文件名不带扩展名
		v.SetConfigType("yml")      // 明确文件类型
		v.AddConfigPath(".")        // 告诉 viper 在当前目录寻找
		v.AddConfigPath("./config") // 也可以添加多个查找路径

		// 3. 环境变量覆盖设置
		// 比如设置了 "APP"，那么 viper 会寻找 "APP_DATABASE_HOST" 来覆盖 database.host
		v.SetEnvPrefix("APP")
		v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
		v.AutomaticEnv() // 开启自动读取环境变量

		// 4. 读取 config.yml
		if err := v.ReadInConfig(); err != nil {
			log.Printf("⚠️ 提示: 读取 config.yml 失败, 如果是在纯环境变量驱动的容器内可忽略. Err: %v", err)
		}

		// 5. 解析到结构体
		globalConfig = &Config{}
		if err := v.Unmarshal(globalConfig); err != nil {
			log.Fatalf("❌ 解析配置失败: %v", err)
		}

		// 6. session 默认值
		globalConfig.Session = globalConfig.Session.Normalized()
	})

	return globalConfig
}

func GetConfig() *Config {
	if globalConfig == nil {
		log.Fatal("❌ 错误: 必须先调用 LoadConfig()")
	}
	return globalConfig
}
