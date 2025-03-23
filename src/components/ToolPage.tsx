'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Breadcrumbs, Icon, Avatar, Divider, CircularProgress } from '@mui/material';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { tools, categoryIcons } from '@/lib/tools';
import { notFound } from 'next/navigation';

interface ToolPageProps {
  toolId: string;
}

export default function ToolPage({ toolId }: ToolPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 查找当前工具
  const tool = tools.find(t => t.slug === toolId);
  
  // 如果工具不存在，返回404
  if (!tool) {
    notFound();
  }
  
  // 动态导入工具组件
  const ToolComponent = dynamic(
    () => import(`@/lib/tools/${tool.slug}/client`).catch(err => {
      console.error(`Failed to load tool component: ${err}`);
      setError(`无法加载工具组件 ${tool.title}，错误信息: ${err.message}`);
      return Promise.resolve(() => (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Icon color="error" sx={{ fontSize: 48, mb: 2 }}>error_outline</Icon>
          <Typography variant="h6" color="error" gutterBottom>加载失败</Typography>
          <Typography color="text.secondary">
            很抱歉，无法加载此工具组件，请稍后再试。
          </Typography>
        </Box>
      ));
    }),
    {
      loading: () => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', my: 8 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="body1" sx={{ mt: 2 }}>加载工具组件中...</Typography>
        </Box>
      ),
      ssr: false,
    }
  );
  
  useEffect(() => {
    // 模拟加载完成
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        {/* 面包屑导航 */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Icon fontSize="small" sx={{ mr: 0.5 }}>home</Icon>
              首页
            </Box>
          </Link>
          <Link href="/tools" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Icon fontSize="small" sx={{ mr: 0.5 }}>apps</Icon>
              工具
            </Box>
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon fontSize="small" sx={{ mr: 0.5 }}>{tool.icon}</Icon>
            {tool.title}
          </Typography>
        </Breadcrumbs>
        
        {/* 工具标题 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              mr: 2,
              width: 56,
              height: 56
            }}
          >
            <Icon sx={{ fontSize: 32 }}>{tool.icon}</Icon>
          </Avatar>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              {tool.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Icon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }}>
                {categoryIcons[tool.category] || 'extension'}
              </Icon>
              <Typography variant="subtitle2" color="text.secondary">
                {tool.category}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* 工具描述 */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            bgcolor: 'background.default',
            borderLeft: '4px solid',
            borderColor: 'primary.main'
          }}
        >
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {tool.description}
          </Typography>
        </Paper>
        
        {/* 工具内容 */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          {error ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Icon color="error" sx={{ fontSize: 48, mb: 2 }}>error_outline</Icon>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            <ToolComponent />
          )}
        </Paper>
      </Container>
      
      {/* 内容与页脚分隔线 */}
      <Box sx={{ width: '100%', mt: 4 }}>
        <Container maxWidth="lg">
          <Divider sx={{ borderColor: 'grey.200' }} />
          <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary', typography: 'body2' }}>
            -- 页面内容结束 --
          </Box>
        </Container>
      </Box>
    </Box>
  );
} 