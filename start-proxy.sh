#!/bin/bash

# 代理服务器启动脚本

echo " 启动 Cashier API 代理服务器..."

# 检查端口是否被占用
if lsof -Pi :3202 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 3202 已被占用，正在终止现有进程..."
    kill -9 $(lsof -Pi :3202 -sTCP:LISTEN -t)
    sleep 2
fi

# 启动代理服务器
echo "📍 启动代理服务器 (端口: 3202)"
echo "🎯 转发 /api/* 到 http://host.docker.internal:6084/*"
echo ""

node proxy-server.cjs
