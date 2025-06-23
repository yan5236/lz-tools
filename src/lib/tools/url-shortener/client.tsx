'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  Typography, 
  Snackbar, 
  Alert, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Card, 
  CardContent,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import HistoryIcon from '@mui/icons-material/History';

// 短链接服务配置
const shortenerServices = [
  {
    id: 'yuanmeng',
    name: '远梦API',
    description: '免费稳定的中文短链接服务'
  },
  {
    id: 'tinyurl',
    name: 'TinyURL',
    description: '老牌免费短链接服务'
  },
  {
    id: 'ulvis',
    name: 'Ulvis',
    description: '2025年最新免费短链接API服务'
  },
  {
    id: 'vgd',
    name: 'v.gd',
    description: 'is.gd的替代服务，功能相同'
  }
];

interface ShortenedUrl {
  id: string;
  original: string;
  shortened: string;
  service: string;
  timestamp: Date;
}

export default function UrlShortener() {
  const [inputUrl, setInputUrl] = useState('');
  const [selectedService, setSelectedService] = useState(shortenerServices[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [autoFallback, setAutoFallback] = useState(true);

  // 组件加载时从localStorage读取历史记录
  useEffect(() => {
    try {
      const savedUrls = localStorage.getItem('shortenerHistory');
      const savedAutoFallback = localStorage.getItem('shortenerAutoFallback');
      
      if (savedUrls) {
        const parsedUrls = JSON.parse(savedUrls);
        // 将字符串日期转换回Date对象
        const urlsWithDates = parsedUrls.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setShortenedUrls(urlsWithDates);
      }
      
      if (savedAutoFallback !== null) {
        setAutoFallback(savedAutoFallback === 'true');
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  }, []);

  // 保存历史记录到localStorage
  const saveToStorage = (urls: ShortenedUrl[]) => {
    try {
      localStorage.setItem('shortenerHistory', JSON.stringify(urls));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  };

  // 保存自动切换设置
  const saveAutoFallbackSetting = (value: boolean) => {
    try {
      localStorage.setItem('shortenerAutoFallback', value.toString());
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  };

  // 验证URL格式
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // 自动添加协议
  const normalizeUrl = (url: string): string => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  // 调用后端API路由生成短链接
  const shortenUrl = async (url: string, serviceId: string): Promise<string> => {
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          serviceId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成短链接失败');
      }

      if (!data.success || !data.shortUrl) {
        throw new Error('API返回格式错误');
      }

      return data.shortUrl;
    } catch (error) {
      console.error('短链接API调用错误:', error);
      throw error;
    }
  };

  // 处理短链接生成
  const handleShortenUrl = async () => {
    if (!inputUrl.trim()) {
      setError('请输入要缩短的网址');
      return;
    }

    const normalizedUrl = normalizeUrl(inputUrl.trim());
    if (!isValidUrl(normalizedUrl)) {
      setError('请输入有效的网址（如：https://example.com）');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const shortened = await shortenUrl(normalizedUrl, selectedService);
      const newEntry: ShortenedUrl = {
        id: Date.now().toString(),
        original: normalizedUrl,
        shortened,
        service: shortenerServices.find(s => s.id === selectedService)?.name || selectedService,
        timestamp: new Date()
      };

      const updatedUrls = [newEntry, ...shortenedUrls.slice(0, 19)];
      setShortenedUrls(updatedUrls);
      saveToStorage(updatedUrls); // 保存更新后的列表
      setInputUrl('');
      setSnackbarMessage('短链接生成成功！');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('短链接生成失败:', err);
      
      // 如果选择的服务失败且不是TinyURL，且启用了自动切换，提供备用服务
      if (selectedService !== 'tinyurl' && autoFallback) {
        try {
          console.log('尝试使用TinyURL备用服务...');
          const backupShortened = await shortenUrl(normalizedUrl, 'tinyurl');
          const newEntry: ShortenedUrl = {
            id: Date.now().toString(),
            original: normalizedUrl,
            shortened: backupShortened,
            service: 'TinyURL (备用)',
            timestamp: new Date()
          };

          const updatedUrls = [newEntry, ...shortenedUrls.slice(0, 19)];
          setShortenedUrls(updatedUrls);
          saveToStorage(updatedUrls); // 保存更新后的列表
          setInputUrl('');
          setSnackbarMessage(`${shortenerServices.find(s => s.id === selectedService)?.name}服务暂时不可用，已使用TinyURL备用服务生成！`);
          setSnackbarOpen(true);
          return;
        } catch (backupError) {
          console.error('备用服务也失败:', backupError);
        }
      }
      
      const errorMessage = err instanceof Error ? err.message : '生成短链接时发生错误';
      setError(`${errorMessage}。请尝试其他服务或稍后再试。`);
    } finally {
      setLoading(false);
    }
  };

  // 复制到剪贴板
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbarMessage('已复制到剪贴板');
      setSnackbarOpen(true);
    } catch {
      setError('复制失败，请手动复制');
    }
  };

  // 打开链接
  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 删除记录
  const handleDeleteRecord = (id: string) => {
    const updatedUrls = shortenedUrls.filter(item => item.id !== id);
    setShortenedUrls(updatedUrls);
    saveToStorage(updatedUrls);
  };

  // 清空所有记录
  const handleClearAll = () => {
    setShortenedUrls([]);
    saveToStorage([]);
  };

  // 处理自动切换设置变化
  const handleAutoFallbackChange = (value: boolean) => {
    setAutoFallback(value);
    saveAutoFallbackSetting(value);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* 说明信息 */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              使用说明：输入需要缩短的网址，选择短链接服务，点击生成按钮。支持多个免费短链接服务，无需注册或API密钥。推荐使用远梦API或TinyURL，服务稳定可靠。
            </Typography>
          </Paper>
        </Grid>

        {/* 主要输入区域 */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinkIcon color="primary" />
                短链接生成器
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="输入长网址"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="例如：https://www.example.com/very/long/url/path"
                    error={!!error}
                    helperText={error}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && handleShortenUrl()}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>选择服务</InputLabel>
                    <Select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      label="选择服务"
                    >
                      {shortenerServices.map((service) => (
                        <MenuItem key={service.id} value={service.id}>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {service.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {service.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleShortenUrl}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
                >
                  {loading ? '生成中...' : '生成短链接'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setInputUrl('')}
                  disabled={!inputUrl}
                >
                  清空
                </Button>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoFallback}
                      onChange={(e) => handleAutoFallbackChange(e.target.checked)}
                      size="small"
                    />
                  }
                  label="服务失败时自动切换到TinyURL"
                  sx={{ ml: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 历史记录 */}
        {shortenedUrls.length > 0 && (
          <Grid item xs={12}>
            <Card elevation={1}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon color="primary" />
                    生成历史 ({shortenedUrls.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={handleClearAll}
                    startIcon={<DeleteIcon />}
                  >
                    清空全部
                  </Button>
                </Box>

                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {shortenedUrls.map((item, index) => (
                    <Box key={item.id}>
                      <ListItem sx={{ flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start' }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography
                                variant="body2"
                                color="primary"
                                sx={{ 
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  wordBreak: 'break-all'
                                }}
                                onClick={() => handleOpenUrl(item.shortened)}
                              >
                                {item.shortened}
                              </Typography>
                              <Chip 
                                label={item.service} 
                                size="small" 
                                variant="outlined"
                                color="primary"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ wordBreak: 'break-all' }}
                              >
                                原网址：{item.original}
                              </Typography>
                              <br />
                              <Typography variant="caption" color="text.secondary">
                                生成时间：{item.timestamp.toLocaleString()}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleCopy(item.shortened)}
                              title="复制短链接"
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleOpenUrl(item.shortened)}
                              title="打开链接"
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleDeleteRecord(item.id)}
                              title="删除记录"
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < shortenedUrls.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* 消息提示 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 