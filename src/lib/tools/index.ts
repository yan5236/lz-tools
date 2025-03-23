// 工具类别图标
export const categoryIcons: Record<string, string> = {
  '编码工具': 'code',
  '日期工具': 'event',
  '加密工具': 'security',
  '设计工具': 'brush',
  '图像工具': 'image'
};

// 工具列表
export const tools = [
  {
    slug: 'hash',
    title: '哈希计算器',
    description: '计算文本或文件的哈希值，支持MD5、SHA-1、SHA-256、SHA-384和SHA-512算法。',
    category: '加密工具',
    icon: 'tag',
    featured: true
  },
  {
    slug: 'color-converter',
    title: '颜色格式转换',
    description: '在HEX、RGB和HSL等颜色格式之间进行转换，支持可视化选择和编辑。',
    category: '设计工具',
    icon: 'palette',
    featured: true
  },
  {
    slug: 'image-compress',
    title: '图片压缩',
    description: '压缩图片文件大小，支持JPEG、PNG等格式，可自定义压缩质量和尺寸。',
    category: '图像工具',
    icon: 'compress',
    featured: true
  },
  {
    slug: 'image-converter',
    title: '图片格式转换',
    description: '在JPEG、PNG、WebP等常见图片格式之间转换，保持图片质量，支持批量处理。',
    category: '图像工具',
    icon: 'switch_access_shortcut',
    featured: true
  },
  {
    slug: 'base64',
    title: 'Base64编解码',
    description: '编码或解码Base64字符串',
    category: '编码工具',
    icon: 'transform',
    featured: false
  },
  {
    slug: 'json-format',
    title: 'JSON格式化',
    description: '格式化和美化JSON数据，使其更易读，也可将格式化的JSON压缩为单行。',
    category: '编码工具',
    icon: 'data_object',
    featured: false
  },
  {
    slug: 'url-codec',
    title: 'URL编解码',
    description: 'URL编码和解码工具，支持编码整个URL或URL参数。',
    category: '编码工具',
    icon: 'link',
    featured: false
  },
  {
    slug: 'timestamp',
    title: '时间戳转换',
    description: '在Unix时间戳与可读日期时间格式之间转换，支持多种时间格式。',
    category: '日期工具',
    icon: 'schedule',
    featured: false
  }
];

// 获取所有工具ID
export function getAllToolIds(): string[] {
  return tools.map(tool => tool.slug);
} 