const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const axios = require('axios');

const app = new Koa();
const router = new Router();

// 从环境变量获取目标主机，默认使用 host.docker.internal
const TARGET_HOST = process.env.TARGET_HOST || 'host.docker.internal';

// 中间件
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(bodyParser({
  enableTypes: ['json', 'form'],
  jsonLimit: '10mb',
  formLimit: '10mb',
}));

// 日志中间件
app.use(async (ctx, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${ctx.method} ${ctx.url}`);
  
  try {
    await next();
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${ctx.method} ${ctx.url} - ${ctx.status} (${ms}ms)`);
  } catch (error) {
    const ms = Date.now() - start;
    console.error(`[${new Date().toISOString()}] ${ctx.method} ${ctx.url} - ERROR (${ms}ms):`, error.message);
    throw error;
  }
});

// 唯一的API转发规则：/api/* -> http://localhost:9002/*
router.all('/api/(.*)', async (ctx) => {
  try {
    const { method, header, query } = ctx.request;
    const body = ctx.request.body;
    
    // /api/auth -> /auth -> http://TARGET_HOST:6084/auth
    const targetPath = '/' + ctx.params[0];
    const targetUrl = `http://${TARGET_HOST}:6084${targetPath}`;
    
    console.log(`[PROXY] ${method} ${ctx.url} -> ${targetUrl}`);
    
    // 发送请求
    const response = await axios({
      method: method.toLowerCase(),
      url: targetUrl,
      headers: {
        ...header,
        host: undefined,
        'content-length': undefined,
      },
      data: body,
      params: query,
      timeout: 30000,
      validateStatus: () => true,
    });
    
    // 返回响应
    ctx.status = response.status;
    ctx.set(response.headers);
    ctx.remove('connection');
    ctx.remove('transfer-encoding');
    ctx.body = response.data;
    
  } catch (error) {
    console.error(`[PROXY ERROR] ${ctx.method} ${ctx.url}:`, error.message);
    ctx.status = 500;
    ctx.body = { error: 'Proxy error', message: error.message };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务器
app.listen(3202, () => {
  console.log(`🚀 API Proxy Server running on http://localhost:3202`);
  console.log(`🎯 Forwarding /api/* to http://${TARGET_HOST}:6084/*`);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
