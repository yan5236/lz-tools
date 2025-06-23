// 工具类别图标
export const categoryIcons: Record<string, string> = {
  '编码工具': 'code',
  '日期工具': 'event',
  '加密工具': 'security',
  '设计工具': 'brush',
  '图像工具': 'image',
  '文本工具': 'text_format',
  '网络工具': 'public',
  '开发工具': 'developer_mode',
  '计算器': 'calculate'
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
    slug: 'markdown-editor',
    title: 'Markdown编辑器',
    description: '在线编辑和预览Markdown文档，支持实时预览、导出文件和自动保存功能。',
    category: '文本工具',
    icon: 'edit_note',
    featured: true
  },
  {
    slug: 'ip-query',
    title: 'IP地址查询',
    description: '查询用户的IP地址、地理位置、经纬度和运营商等详细信息，支持中文展示。',
    category: '网络工具',
    icon: 'my_location',
    featured: true
  },
  {
    slug: 'url-shortener',
    title: '短链接生成器',
    description: '将长网址转换为短链接，支持多个免费服务提供商，无需注册或API密钥。',
    category: '网络工具',
    icon: 'link_off',
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
  },
  {
    slug: 'mermaid-editor',
    title: 'Mermaid编辑器',
    description: '在线编辑和预览Mermaid流程图，支持流程图、时序图、类图、状态图、甘特图等多种图表类型。',
    category: '设计工具',
    icon: 'account_tree',
    featured: true
  },
  {
    slug: 'http-request',
    title: '在线HTTP请求工具',
    description: '在线测试API接口，支持GET、POST、PUT、DELETE等HTTP方法，可自定义请求头、请求体，查看响应结果。',
    category: '开发工具',
    icon: 'http',
    featured: true
  },
  {
    slug: 'calculator',
    title: '高级计算器',
    description: '多功能计算器，支持标准计算、科学计算、程序员计算、日期计算、单位转换和汇率换算。',
    category: '计算器',
    icon: 'calculate',
    featured: true
  },
  {
    slug: 'github-accelerator',
    title: 'GitHub加速下载',
    description: '通过公共代理加速GitHub文件下载，支持多个代理源，解决国内访问GitHub慢的问题。',
    category: '开发工具',
    icon: 'download',
    featured: true
  },
  {
    slug: 'qr-code',
    title: '二维码工具',
    description: '生成自定义二维码和解码二维码图片，支持颜色、尺寸、容错级别等个性化设置。',
    category: '编码工具',
    icon: 'qr_code',
    featured: true
  }
];

// 获取所有工具ID
export function getAllToolIds(): string[] {
  return tools.map(tool => tool.slug);
} 