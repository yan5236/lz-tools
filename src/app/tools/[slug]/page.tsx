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

// 页面组件 - 使用async函数处理参数
export default async function Page({ params }: { params: { slug: string } }) {
  // 在Next.js 14 App Router中，params已经是解析好的，不需要额外的await
  // 但我们需要确保我们不会同步使用它
  const { slug } = params;
  
  // 如果工具ID无效，返回404
  if (!isValidToolId(slug)) {
    notFound();
  }
  
  return <ToolPage toolId={slug} />;
} 