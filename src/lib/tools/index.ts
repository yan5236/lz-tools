// 工具类别图标
export const categoryIcons: Record<string, string> = {
  '文本工具': 'text_fields',
  '图片工具': 'photo_size_select_actual',
  '编码转换': 'code',
  '开发辅助': 'developer_mode',
  '数据处理': 'data_object',
  '单位换算': 'calculate',
  '密码安全': 'security'
};

// 工具列表
export const tools = [
  {
    slug: 'hash',
    title: '哈希计算器',
    description: '计算文本或文件的哈希值，支持MD5、SHA-1、SHA-256、SHA-384和SHA-512算法。',
    category: '密码安全',
    icon: 'tag',
    featured: true
  },
  {
    slug: 'color-converter',
    title: '颜色格式转换',
    description: '在HEX、RGB和HSL等颜色格式之间进行转换，支持可视化选择和编辑。',
    category: '开发辅助',
    icon: 'palette',
    featured: true
  },
  {
    slug: 'image-compress',
    title: '图片压缩',
    description: '压缩图片文件大小，支持JPEG、PNG等格式，可自定义压缩质量和尺寸。',
    category: '图片工具',
    icon: 'compress',
    featured: true
  },
  {
    slug: 'json-format',
    title: 'JSON格式化',
    description: '格式化和美化JSON数据，使其更易读，也可将格式化的JSON压缩为单行。',
    category: '开发辅助',
    icon: 'data_object',
    featured: false
  },
  {
    slug: 'url-codec',
    title: 'URL编解码',
    description: 'URL编码和解码工具，支持编码整个URL或URL参数。',
    category: '编码转换',
    icon: 'link',
    featured: false
  },
  {
    slug: 'timestamp',
    title: '时间戳转换',
    description: '在Unix时间戳与可读日期时间格式之间转换，支持多种时间格式。',
    category: '开发辅助',
    icon: 'schedule',
    featured: false
  }
];

// 获取所有工具ID
export function getAllToolIds(): string[] {
  return tools.map(tool => tool.slug);
} 