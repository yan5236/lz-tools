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
  // 添加robots.txt和sitemap.xml作为静态文件
  poweredByHeader: false, // 移除"X-Powered-By"标头，增加安全性
  reactStrictMode: true,  // 启用严格模式，提高代码质量
  // 为搜索引擎优化压缩HTML
  compress: true,
}

module.exports = nextConfig 