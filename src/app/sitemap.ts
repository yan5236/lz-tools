import { MetadataRoute } from 'next';
import { tools } from '@/lib/constants';

// Next.js站点地图生成函数
// 参考: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lztools.nanhaiblog.top';
  
  // 主页
  const routes = [{
    url: `${baseUrl}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 1,
  }];

  // 工具主页
  routes.push({
    url: `${baseUrl}/tools`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  });

  // 各个工具页面
  const toolRoutes = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...routes, ...toolRoutes];
} 