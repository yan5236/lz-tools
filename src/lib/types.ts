// 工具定义类型
export interface Tool {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

// 工具配置类型
export interface ToolConfig {
  title: string;
  description: string;
} 