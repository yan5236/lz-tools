# LZ小工具网站

LZ小工具是一个基于Next.js 14和Material Design 3设计的现代化在线工具集合，为开发者、设计师和普通用户提供各种实用工具。

## 特点

- 使用Next.js 14 App Router构建
- Material Design 3风格的UI设计
- 响应式布局，适配各种设备
- 模块化设计，易于扩展
- 无服务器架构，完全在客户端运行

## 包含工具

1. **JSON格式化** - 格式化和验证JSON数据
2. **Base64编解码** - 编码或解码Base64字符串
3. **URL编解码** - 编码或解码URL字符串
4. **时间戳转换** - 在不同时间格式之间转换
5. **哈希生成** - 生成MD5、SHA-1、SHA-256等哈希值
6. **颜色格式转换** - 在HEX、RGB、HSL等颜色格式之间转换
7. **图片压缩** - 压缩图片文件大小，支持JPEG、PNG等格式
8. **图片格式转换** - 在JPEG、PNG、WebP等常见图片格式之间转换

## 技术栈

- [Next.js 14](https://nextjs.org/) - React框架
- [TypeScript](https://www.typescriptlang.org/) - 静态类型检查
- [Material UI](https://mui.com/) - UI组件库
- [Emotion](https://emotion.sh/) - CSS-in-JS解决方案

## 开发指南

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm run start
```

## 项目结构

```
lz-tools/
├── src/
│   ├── app/                # Next.js 14 App Router
│   │   ├── components/     # 公共组件
│   │   ├── tools/          # 工具页面路由
│   │   ├── layout.tsx      # 全局布局
│   │   └── page.tsx        # 首页
│   └── lib/                # 工具逻辑和配置
│       ├── tools/          # 各工具实现
│       ├── constants.ts    # 工具配置
│       ├── theme.ts        # 主题配置
│       └── types.ts        # 类型定义
└── public/                 # 静态资源
```

## 添加新工具

1. 在 `src/lib/tools/` 下创建新工具目录
2. 实现 `client.tsx` 文件
3. 在 `src/lib/constants.ts` 中添加工具配置

## 许可

MIT
