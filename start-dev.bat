@echo off
REM 设置Node.js内存限制
set NODE_OPTIONS=--max-old-space-size=4096

REM 清理缓存
rmdir /s /q .next
rmdir /s /q node_modules\.cache

REM 启动Next.js开发服务器
npm run dev 