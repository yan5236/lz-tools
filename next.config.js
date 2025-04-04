/** @type {import('next').NextConfig} */
const nextConfig = {
  // 完全禁用TypeScript检查
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用ESLint检查
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 禁用图像优化，用于减少内存占用
  images: {
    unoptimized: true,
  },
  // 添加robots.txt和sitemap.xml作为静态文件
  poweredByHeader: false, // 移除"X-Powered-By"标头，增加安全性
  reactStrictMode: false,  // 禁用严格模式，减少内存占用
  // 为搜索引擎优化压缩HTML
  compress: true,
  // 配置Markdown编辑器相关依赖
  transpilePackages: ['@uiw/react-md-editor'],
  // 移除CSP配置，让图片压缩能够正常工作
  // 在产品环境可以重新添加更安全的设置
  headers: async () => {
    return []
  }
}

module.exports = nextConfig 