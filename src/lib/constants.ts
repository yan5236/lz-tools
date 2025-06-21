import { Tool } from './types';

// 工具列表配置
export const tools: Tool[] = [
  {
    slug: 'json-format',
    title: 'JSON格式化',
    description: '格式化和验证JSON数据',
    icon: 'data_object',
    category: '编码工具'
  },
  {
    slug: 'base64',
    title: 'Base64编解码',
    description: '编码或解码Base64字符串',
    icon: 'transform',
    category: '编码工具'
  },
  {
    slug: 'url-codec',
    title: 'URL编解码',
    description: '编码或解码URL字符串',
    icon: 'link',
    category: '编码工具'
  },
  {
    slug: 'timestamp',
    title: '时间戳转换',
    description: '在不同时间格式之间转换',
    icon: 'schedule',
    category: '日期工具'
  },
  {
    slug: 'hash',
    title: '哈希生成',
    description: '生成MD5、SHA-1、SHA-256等哈希值',
    icon: 'security',
    category: '加密工具'
  },
  {
    slug: 'color-converter',
    title: '颜色格式转换',
    description: '在HEX、RGB、HSL等颜色格式之间转换',
    icon: 'palette',
    category: '设计工具'
  },
  {
    slug: 'image-compress',
    title: '图片压缩',
    description: '压缩图片以减小文件大小，支持调整质量和尺寸',
    icon: 'compress',
    category: '图像工具'
  },
  {
    slug: 'mermaid-editor',
    title: 'Mermaid编辑器',
    description: '在线编辑和预览Mermaid流程图，支持多种图表类型',
    icon: 'account_tree',
    category: '设计工具'
  }
];

// 工具分类
export const categories = Array.from(new Set(tools.map(tool => tool.category)));

// 分类图标映射
export const categoryIcons: Record<string, string> = {
  '编码工具': 'code',
  '日期工具': 'event',
  '加密工具': 'security',
  '设计工具': 'brush',
  '图像工具': 'image'
}; 