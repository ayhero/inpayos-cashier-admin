# 多阶段构建
FROM node:18-alpine as builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括 dev dependencies）
RUN npm ci

# 复制源代码
COPY . .

# 构建应用（跳过 TypeScript 检查）
RUN npx vite build

# 生产环境镜像 - 使用 Node.js 基础镜像
FROM node:18-alpine

# 安装 nginx 和 supervisor
RUN apk add --no-cache nginx supervisor

# 创建必要的目录
RUN mkdir -p /var/log/supervisor /run/nginx /app

# 设置工作目录
WORKDIR /app

# 复制 package.json 并安装生产依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制代理服务器文件
COPY proxy-server.cjs ./

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制 supervisor 配置
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 暴露端口
EXPOSE 80 3202

# 启动 supervisor 管理多个服务
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
