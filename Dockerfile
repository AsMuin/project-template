# ==================== 构建阶段 (builder) ====================
FROM golang:1.26.4-alpine AS builder

WORKDIR /app

# 单独复制依赖声明文件
COPY go.mod go.sum ./

# 利用 BuildKit 缓存挂载，加速依赖下载
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# 复制源码
COPY . .

# - CGO_ENABLED=0 确保静态编译
# - -ldflags="-s -w" 减小二进制体积
# - 挂载 go-build 缓存，使后续构建中未修改代码的编译速度极快
RUN --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/go/pkg/mod \
    CGO_ENABLED=0 go build -ldflags="-s -w" -o main ./cmd/server


# ==================== 运行阶段 (runtime) ====================
# 锁定 alpine 具体版本
FROM alpine:3.20 AS runtime

WORKDIR /app

# 创建非 root 安全用户
RUN adduser -D -g '' appuser && \
    chown -R appuser:appuser /app

# 从 builder 复制编译好的二进制文件，并修改所有者
COPY --from=builder --chown=appuser:appuser /app/main .

# 切换到非 root 用户运行
USER appuser

EXPOSE 8080

CMD ["./main"]