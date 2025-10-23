# InPayOS Cashier Admin Frontend Makefile

.PHONY: help install dev build preview clean lint format sync-config-dev sync-config-prod check-github-auth

# 默认目标
help: ## 显示帮助信息
	@echo "InPayOS Cashier Admin Frontend 开发工具"
	@echo ""
	@echo "使用方法: make [target]"
	@echo ""
	@echo "目标:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## 安装依赖
	@echo "📦 安装依赖..."
	npm ci

dev: ## 启动开发服务器
	@echo "🛠️ 启动开发服务器..."
	npm run dev

build: ## 构建生产版本
	@echo "🔨 构建生产版本..."
	npm run build

preview: ## 预览生产版本
	@echo "👀 预览生产版本..."
	npm run preview

proxy: ## 启动代理服务器
	@echo "🔄 启动代理服务器..."
	npm run proxy

clean: ## 清理构建文件
	@echo "🧹 清理构建文件..."
	rm -rf dist
	rm -rf node_modules/.vite

lint: ## 代码检查
	@echo "🔍 代码检查..."
	npm run lint

format: ## 格式化代码
	@echo "✨ 格式化代码..."
	prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,scss,md}"
	eslint "src/**/*.{ts,tsx}" --fix

sync-config-dev: ## 同步开发环境配置到GitHub Secrets
	@echo "🔄 同步开发环境配置到GitHub Secrets..."
	@if [ ! -f .env.development ]; then \
		echo "❌ 错误: .env.development文件不存在"; \
		exit 1; \
	fi
	@echo "🔐 检查并切换到正确的GitHub账户..."
	@if ! GH_TOKEN="" gh auth status 2>/dev/null | grep -A1 "ayhero" | grep -q "Active account: true"; then \
		echo "⚠️  当前不是ayhero账户，正在切换..."; \
		GH_TOKEN="" gh auth switch --hostname github.com --user ayhero || (echo "❌ 账户切换失败，请检查GitHub CLI配置" && exit 1); \
	fi
	@echo "� 上传.env.development内容到GitHub Secret ENV (DEV环境)..."
	@cat .env.development | GH_TOKEN="" gh secret set ENV --env DEV
	@echo "✅ 开发环境配置同步成功!"

sync-config-prod: ## 同步生产环境配置到GitHub Secrets
	@echo "🔄 同步生产环境配置到GitHub Secrets..."
	@if [ ! -f .env.production ]; then \
		echo "❌ 错误: .env.production文件不存在"; \
		exit 1; \
	fi
	@echo "🔐 检查并切换到正确的GitHub账户..."
	@if ! GH_TOKEN="" gh auth status 2>/dev/null | grep -A1 "ayhero" | grep -q "Active account: true"; then \
		echo "⚠️  当前不是ayhero账户，正在切换..."; \
		GH_TOKEN="" gh auth switch --hostname github.com --user ayhero || (echo "❌ 账户切换失败，请检查GitHub CLI配置" && exit 1); \
	fi
	@echo "� 上传.env.production内容到GitHub Secret ENV (PROD环境)..."
	@cat .env.production | GH_TOKEN="" gh secret set ENV --env PROD
	@echo "✅ 生产环境配置同步成功!"

check-github-auth: ## 检查GitHub CLI认证状态
	@echo "🔐 检查GitHub CLI认证状态..."
	@echo "⚡ 注意: 如果你有GH_TOKEN环境变量，可能需要使用 GH_TOKEN=\"\" make sync-config-xxx"
	@echo ""
	@echo "📊 当前GitHub认证状态:"
	@GH_TOKEN="" gh auth status 2>/dev/null || echo "❌ GitHub CLI未认证，请运行: gh auth login"
	@echo ""
	@if GH_TOKEN="" gh auth status 2>/dev/null | grep -A1 "ayhero" | grep -q "Active account: true"; then \
		echo "✅ 当前正在使用ayhero账户，可以同步配置"; \
	else \
		echo "⚠️  当前未使用ayhero账户，请运行: GH_TOKEN=\"\" gh auth switch --hostname github.com --user ayhero"; \
	fi