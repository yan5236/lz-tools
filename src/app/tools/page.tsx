'use client';

import { useState, useEffect, Suspense } from 'react';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Box, Card, CardContent, Grid, Chip, TextField, InputAdornment, Icon, CardActions, Button, Divider, Avatar, CircularProgress } from '@mui/material';
import { Container, Typography, Box, Card, CardContent, Grid, Chip, TextField, InputAdornment, Icon, CardActions, Button, Divider, Avatar, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';
import { tools, categoryIcons } from '@/lib/tools';
import { tools, categoryIcons } from '@/lib/tools';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import TransformIcon from '@mui/icons-material/Transform';
import LinkIcon from '@mui/icons-material/Link';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SecurityIcon from '@mui/icons-material/Security';
import PaletteIcon from '@mui/icons-material/Palette';
import AppsIcon from '@mui/icons-material/Apps';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// 获取所有分类
const categories = [...new Set(tools.map(tool => tool.category))];

// 工具搜索和展示组件 - 使用了useSearchParams
function ToolsContent() {
// 获取所有分类
const categories = [...new Set(tools.map(tool => tool.category))];

// 工具搜索和展示组件 - 使用了useSearchParams
function ToolsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [filteredTools, setFilteredTools] = useState(tools);

  // 当搜索词或分类发生变化时，过滤工具列表
  useEffect(() => {
    let results = tools;
    
    if (selectedCategory) {
      results = results.filter(tool => tool.category === selectedCategory);
    }
    
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      results = results.filter(tool => 
        tool.title.toLowerCase().includes(searchTermLower) || 
        tool.description.toLowerCase().includes(searchTermLower)
      );
    }
    
    setFilteredTools(results);
  }, [searchTerm, selectedCategory]);

  // 当URL中的category参数变化时更新选择的分类
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  return (
    <>
      {/* 搜索框 */}
      <TextField
        fullWidth
        placeholder="搜索工具..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      {/* 分类选择 */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip 
          label="全部" 
          clickable
          color={selectedCategory === null ? 'primary' : 'default'}
          onClick={() => setSelectedCategory(null)}
          sx={{ mr: 1 }}
          icon={<Icon>apps</Icon>}
        />
        {categories.map(category => (
          <Chip 
            key={category}
            label={category}
            clickable
            color={selectedCategory === category ? 'primary' : 'default'}
            onClick={() => setSelectedCategory(category)}
            icon={<Icon>{categoryIcons[category] || 'extension'}</Icon>}
          />
        ))}
      </Box>
      
      {/* 工具列表 */}
      {filteredTools.length > 0 ? (
        <Grid container spacing={3}>
          {filteredTools.map((tool) => (
            <Grid item key={tool.slug} xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        mr: 2,
                        width: 40,
                        height: 40
                      }}
                    >
                      <Icon>{tool.icon}</Icon>
                    </Avatar>
                    <Typography variant="h6">{tool.title}</Typography>
                  </Box>
                  <Chip 
                    label={tool.category} 
                    size="small" 
                    sx={{ mb: 2 }} 
                    color="secondary"
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {tool.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link} 
                    href={`/tools/${tool.slug}`}
                    sx={{ ml: 'auto' }}
                    endIcon={<Icon fontSize="small">arrow_forward</Icon>}
                  >
                    立即使用
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            没有找到符合条件的工具
          </Typography>
          <Icon sx={{ fontSize: 60, color: 'text.disabled', mt: 2 }}>search_off</Icon>
        </Box>
      )}
    </>
  );
}

// 加载中的占位符组件
function ToolsLoading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
      <CircularProgress />
      <Typography variant="body1" sx={{ ml: 2 }}>正在加载工具列表...</Typography>
    </Box>
  );
}

// 主页面组件
export default function ToolsPage() {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 4, fontWeight: 700 }}>
          实用工具集合
        </Typography>
        
        {/* 使用Suspense包裹使用了useSearchParams的组件 */}
        <Suspense fallback={<ToolsLoading />}>
          <ToolsContent />
        </Suspense>
    <>
      {/* 搜索框 */}
      <TextField
        fullWidth
        placeholder="搜索工具..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      {/* 分类选择 */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip 
          label="全部" 
          clickable
          color={selectedCategory === null ? 'primary' : 'default'}
          onClick={() => setSelectedCategory(null)}
          sx={{ mr: 1 }}
          icon={<Icon>apps</Icon>}
        />
        {categories.map(category => (
          <Chip 
            key={category}
            label={category}
            clickable
            color={selectedCategory === category ? 'primary' : 'default'}
            onClick={() => setSelectedCategory(category)}
            icon={<Icon>{categoryIcons[category] || 'extension'}</Icon>}
          />
        ))}
      </Box>
      
      {/* 工具列表 */}
      {filteredTools.length > 0 ? (
        <Grid container spacing={3}>
          {filteredTools.map((tool) => (
            <Grid item key={tool.slug} xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        mr: 2,
                        width: 40,
                        height: 40
                      }}
                    >
                      <Icon>{tool.icon}</Icon>
                    </Avatar>
                    <Typography variant="h6">{tool.title}</Typography>
                  </Box>
                  <Chip 
                    label={tool.category} 
                    size="small" 
                    sx={{ mb: 2 }} 
                    color="secondary"
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {tool.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link} 
                    href={`/tools/${tool.slug}`}
                    sx={{ ml: 'auto' }}
                    endIcon={<Icon fontSize="small">arrow_forward</Icon>}
                  >
                    立即使用
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            没有找到符合条件的工具
          </Typography>
          <Icon sx={{ fontSize: 60, color: 'text.disabled', mt: 2 }}>search_off</Icon>
        </Box>
      )}
    </>
  );
}

// 加载中的占位符组件
function ToolsLoading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
      <CircularProgress />
      <Typography variant="body1" sx={{ ml: 2 }}>正在加载工具列表...</Typography>
    </Box>
  );
}

// 主页面组件
export default function ToolsPage() {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 4, fontWeight: 700 }}>
          实用工具集合
        </Typography>
        
        {/* 使用Suspense包裹使用了useSearchParams的组件 */}
        <Suspense fallback={<ToolsLoading />}>
          <ToolsContent />
        </Suspense>
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