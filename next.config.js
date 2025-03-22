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
}

module.exports = nextConfig 