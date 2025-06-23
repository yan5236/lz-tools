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
    slug: 'url-shortener',
    title: '短链接生成器',
    description: '将长网址转换为短链接，支持多个服务提供商',
    icon: 'link_off',
    category: '网络工具'
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
  },
  {
    slug: 'http-request',
    title: '在线HTTP请求工具',
    description: '在线测试API接口，支持GET、POST、PUT、DELETE等HTTP方法',
    icon: 'http',
    category: '开发工具'
  },
  {
    slug: 'calculator',
    title: '高级计算器',
    description: '多功能计算器，支持标准、科学、程序员计算，单位转换和汇率换算',
    icon: 'calculate',
    category: '计算器'
  },
  {
    slug: 'github-accelerator',
    title: 'GitHub加速下载',
    description: '通过公共代理加速GitHub文件下载，支持多个代理源',
    icon: 'download',
    category: '开发工具'
  },
  {
    slug: 'qr-code',
    title: '二维码工具',
    description: '生成自定义二维码和解码二维码图片，支持颜色、尺寸、LOGO等个性化设置',
    icon: 'qr_code',
    category: '编码工具'
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
  '图像工具': 'image',
  '开发工具': 'developer_mode',
  '计算器': 'calculate',
  '网络工具': 'public'
}; 