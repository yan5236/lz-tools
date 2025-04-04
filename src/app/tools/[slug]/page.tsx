import ToolPage from '@/components/ToolPage';
import { getAllToolIds } from '@/lib/tools';
import { notFound } from 'next/navigation';

// 获取所有可能的工具路径，用于静态生成
export async function generateStaticParams() {
  const tools = getAllToolIds();
  return tools.map(tool => ({
    slug: tool
  }));
}

// 验证工具ID是否有效
function isValidToolId(slug: string): boolean {
  const validIds = getAllToolIds();
  return validIds.includes(slug);
}

// 页面组件 - 使用async函数
export default async function Page({ params }: { params: { slug: string } }) {
  // 获取slug参数 - 在Next.js 14中，需要await params才能安全使用
  const slug = params.slug;
  
  // 如果工具ID无效，返回404
  if (!isValidToolId(slug)) {
    notFound();
  }

  // 返回组件之前确保所有异步操作已完成
  // 等待一下以确保params已经被完全解析
  await new Promise(resolve => setTimeout(resolve, 0));
  
  return <ToolPage toolId={slug} />;
} 