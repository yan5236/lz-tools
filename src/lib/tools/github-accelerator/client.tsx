'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Chip,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Divider,
  Link,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Collapse,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  Download,
  ContentCopy,
  GitHub,
  Speed,
  Warning,
  Info,
  Launch,
  CheckBox,
  CheckBoxOutlineBlank,
  NetworkCheck,
  CheckCircle,
  Error,
  AccessTime
} from '@mui/icons-material';

// 节点状态类型
interface NodeStatus {
  name: string;
  status: 'checking' | 'online' | 'offline' | 'unknown';
  latency?: number;
  error?: string;
}

// GitHub代理服务列表
const PROXY_SERVICES = [
  {
    name: 'ghproxy.nanhaiblog.top',
    url: 'https://ghproxy.nanhaiblog.top/',
    description: '站长自建 - 高速稳定的GitHub代理服务'
  },
  {
    name: 'gh-proxy.com',
    url: 'https://gh-proxy.com/',
    description: '稳定快速的GitHub代理服务'
  },
  {
    name: 'cdn.gh-proxy.com',
    url: 'https://cdn.gh-proxy.com/',
    description: 'ghproxy镜像站点'
  },
  {
    name: 'gh-proxy.net',
    url: 'https://gh-proxy.net/',
    description: '高速GitHub代理'
  },
  {
    name: 'github.moeyy.xyz',
    url: 'https://github.moeyy.xyz/',
    description: 'GitHub文件加速下载'
  },
  {
    name: 'gh.ddlc.top',
    url: 'https://gh.ddlc.top/',
    description: 'GitHub加速代理服务'
  },
  {
    name: 'ui.ghproxy.cc',
    url: 'https://ui.ghproxy.cc/',
    description: 'GitHub加速代理服务'
  }
];

export default function GitHubAcceleratorClient() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [githubUrl, setGithubUrl] = useState('');
  const [acceleratedUrls, setAcceleratedUrls] = useState<Array<{proxy: string, url: string}>>([]);
  const [error, setError] = useState('');
  const [selectedProxies, setSelectedProxies] = useState<string[]>(PROXY_SERVICES.map(p => p.name));
  const [showProxySelection, setShowProxySelection] = useState(false);
  const [nodeStatuses, setNodeStatuses] = useState<NodeStatus[]>(
    PROXY_SERVICES.map(proxy => ({
      name: proxy.name,
      status: 'unknown' as const
    }))
  );
  const [isChecking, setIsChecking] = useState(false);

  // 验证GitHub URL
  const validateGitHubUrl = useCallback((url: string): boolean => {
    if (!url) return false;
    
    const githubPattern = /^https?:\/\/(www\.)?github\.com\/.+/i;
    return githubPattern.test(url);
  }, []);

  // 生成加速下载链接
  const generateAcceleratedUrls = useCallback(() => {
    setError('');
    
    if (!githubUrl.trim()) {
      setError('请输入GitHub链接');
      return;
    }

    if (!validateGitHubUrl(githubUrl)) {
      setError('请输入有效的GitHub链接');
      return;
    }

    if (selectedProxies.length === 0) {
      setError('请至少选择一个代理源');
      return;
    }

    // 清理URL，移除可能的代理前缀
    let cleanUrl = githubUrl.trim();
    PROXY_SERVICES.forEach(proxy => {
      if (cleanUrl.startsWith(proxy.url)) {
        cleanUrl = cleanUrl.replace(proxy.url, '');
      }
    });

    // 确保URL以https://github.com开头
    if (!cleanUrl.startsWith('https://github.com')) {
      if (cleanUrl.startsWith('github.com')) {
        cleanUrl = 'https://' + cleanUrl;
      } else {
        setError('请输入有效的GitHub链接');
        return;
      }
    }

    // 生成选中代理的加速链接
    const urls = PROXY_SERVICES
      .filter(proxy => selectedProxies.includes(proxy.name))
      .map(proxy => ({
        proxy: proxy.name,
        url: proxy.url + cleanUrl
      }));

    setAcceleratedUrls(urls);
  }, [githubUrl, validateGitHubUrl]);

  // 复制到剪贴板
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, []);

  // 处理输入框回车
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      generateAcceleratedUrls();
    }
  }, [generateAcceleratedUrls]);

  // 处理代理选择
  const handleProxyToggle = useCallback((proxyName: string) => {
    setSelectedProxies(prev => {
      if (prev.includes(proxyName)) {
        return prev.filter(name => name !== proxyName);
      } else {
        return [...prev, proxyName];
      }
    });
  }, []);

  // 全选/取消全选代理
  const handleSelectAllProxies = useCallback((selectAll: boolean) => {
    if (selectAll) {
      setSelectedProxies(PROXY_SERVICES.map(p => p.name));
    } else {
      setSelectedProxies([]);
    }
  }, []);

  // 检测单个节点
  const checkSingleNode = useCallback(async (proxy: typeof PROXY_SERVICES[0]): Promise<NodeStatus> => {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时
      
      // 直接测试代理服务的根URL是否可访问
      const response = await fetch(proxy.url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
        mode: 'no-cors' // 避免CORS问题
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      // 对于no-cors模式，只要没有抛出异常就认为是可访问的
      return {
        name: proxy.name,
        status: 'online',
        latency
      };
      
    } catch (error) {
      // 如果HEAD请求失败，尝试GET请求（某些服务器可能不支持HEAD）
      try {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
        
        const response2 = await fetch(proxy.url, {
          method: 'GET',
          signal: controller2.signal,
          cache: 'no-cache',
          mode: 'no-cors'
        });
        
        clearTimeout(timeoutId2);
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        return {
          name: proxy.name,
          status: 'online',
          latency
        };
      } catch (error2) {
        return {
          name: proxy.name,
          status: 'offline' as const,
          error: '连接超时或服务不可用'
        };
      }
    }
  }, []);

  // 检测所有节点
  const checkAllNodes = useCallback(async () => {
    setIsChecking(true);
    
    // 初始化所有节点状态为检测中
    setNodeStatuses(PROXY_SERVICES.map(proxy => ({
      name: proxy.name,
      status: 'checking'
    })));

    try {
      // 并发检测所有节点
      const results = await Promise.allSettled(
        PROXY_SERVICES.map(proxy => checkSingleNode(proxy))
      );

      const statuses: NodeStatus[] = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            name: PROXY_SERVICES[index].name,
            status: 'offline',
            error: '检测失败'
          };
        }
      });

      setNodeStatuses(statuses);
    } catch (error: unknown) {
      console.error('节点检测失败:', error);
      setNodeStatuses(PROXY_SERVICES.map(proxy => ({
        name: proxy.name,
        status: 'offline',
        error: '检测失败'
      })));
    } finally {
      setIsChecking(false);
    }
  }, [checkSingleNode]);

  // 获取节点状态
  const getNodeStatus = useCallback((proxyName: string) => {
    return nodeStatuses.find(status => status.name === proxyName);
  }, [nodeStatuses]);

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: isMobile ? 1 : 2 }}>
      {/* 工具说明 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <GitHub sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h1">
              GitHub加速下载
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            通过公共代理服务加速GitHub文件下载，解决国内访问GitHub慢的问题。
          </Typography>

          {/* 免责声明 */}
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                <Warning sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                免责声明
              </Typography>
              <Typography variant="body2">
                本工具使用的是网络上的公共GitHub代理服务，请勿滥用。
                代理服务的稳定性和安全性由第三方提供商负责，使用时请注意保护个人隐私和数据安全。
              </Typography>
            </Box>
          </Alert>

          <Alert severity="info">
            <Typography variant="body2">
              <Info sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
              支持GitHub仓库文件、Release文件、Raw文件等各种GitHub链接的加速下载
            </Typography>
          </Alert>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <GitHub sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
              节点贡献或遇到无可用节点？请前往 
              <Link 
                href="https://github.com/yan5236/lz-tools/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ mx: 0.5 }}
              >
                GitHub Issues
              </Link> 
              反馈
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* 输入区域 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            输入GitHub链接
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                label="GitHub链接"
                placeholder="https://github.com/user/repo/releases/download/v1.0.0/file.zip"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                error={!!error}
                helperText={error || '支持仓库、文件、Release等各种GitHub链接'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: isMobile ? '14px' : '16px'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={generateAcceleratedUrls}
                startIcon={<Speed />}
                sx={{ 
                  height: 56,
                  fontSize: isMobile ? '14px' : '16px'
                }}
              >
                生成加速链接
              </Button>
            </Grid>
          </Grid>
        </CardContent>
              </Card>

      {/* 代理源选择 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6">
              选择代理源
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={checkAllNodes}
                disabled={isChecking}
                startIcon={isChecking ? <CircularProgress size={16} /> : <NetworkCheck />}
                sx={{ fontSize: isMobile ? '12px' : '14px' }}
              >
                {isChecking ? '检测中...' : '检测节点'}
              </Button>
              <Button
                size="small"
                onClick={() => setShowProxySelection(!showProxySelection)}
                endIcon={showProxySelection ? <CheckBox /> : <CheckBoxOutlineBlank />}
              >
                {showProxySelection ? '收起' : '展开'}选择
              </Button>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            已选择 {selectedProxies.length} / {PROXY_SERVICES.length} 个代理源
          </Typography>

          {/* 检测进度和结果汇总 */}
          {isChecking && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                正在检测节点状态...
              </Typography>
              <LinearProgress />
            </Box>
          )}

          {!isChecking && nodeStatuses.some(s => s.status !== 'unknown') && (
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" color="success.main">
                      在线: {nodeStatuses.filter(s => s.status === 'online').length}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Error sx={{ fontSize: 16, color: 'error.main' }} />
                    <Typography variant="caption" color="error.main">
                      离线: {nodeStatuses.filter(s => s.status === 'offline').length}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime sx={{ fontSize: 16, color: 'info.main' }} />
                    <Typography variant="caption" color="info.main">
                      平均延迟: {
                        (() => {
                          const onlineNodes = nodeStatuses.filter(s => s.status === 'online' && s.latency);
                          if (onlineNodes.length === 0) return 'N/A';
                          const avgLatency = onlineNodes.reduce((sum, node) => sum + (node.latency || 0), 0) / onlineNodes.length;
                          return Math.round(avgLatency) + 'ms';
                        })()
                      }
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          <Collapse in={showProxySelection}>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedProxies.length === PROXY_SERVICES.length}
                    indeterminate={selectedProxies.length > 0 && selectedProxies.length < PROXY_SERVICES.length}
                    onChange={(e) => handleSelectAllProxies(e.target.checked)}
                  />
                }
                label="全选"
              />
            </Box>
            
            <FormGroup>
              <Grid container spacing={1}>
                {PROXY_SERVICES.map((proxy) => {
                  const nodeStatus = getNodeStatus(proxy.name);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={proxy.name}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 1.5, 
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedProxies.includes(proxy.name)}
                              onChange={() => handleProxyToggle(proxy.name)}
                              size="small"
                            />
                          }
                          label={
                            <Box sx={{ width: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {proxy.name}
                                </Typography>
                                {nodeStatus && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {nodeStatus.status === 'checking' && (
                                      <CircularProgress size={12} />
                                    )}
                                    {nodeStatus.status === 'online' && (
                                      <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                                    )}
                                    {nodeStatus.status === 'offline' && (
                                      <Error sx={{ fontSize: 16, color: 'error.main' }} />
                                    )}
                                  </Box>
                                )}
                              </Box>
                              
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                {proxy.description}
                              </Typography>
                              
                              {nodeStatus && nodeStatus.status !== 'unknown' && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                  {nodeStatus.status === 'checking' && (
                                    <Typography variant="caption" color="info.main">
                                      检测中...
                                    </Typography>
                                  )}
                                  {nodeStatus.status === 'online' && nodeStatus.latency && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <AccessTime sx={{ fontSize: 12, color: 'success.main' }} />
                                      <Typography variant="caption" color="success.main">
                                        {nodeStatus.latency}ms
                                      </Typography>
                                    </Box>
                                  )}
                                  {nodeStatus.status === 'offline' && (
                                    <Typography variant="caption" color="error.main">
                                      {nodeStatus.error || '不可用'}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </Box>
                          }
                          sx={{ 
                            alignItems: 'flex-start',
                            width: '100%',
                            m: 0,
                            '& .MuiFormControlLabel-label': {
                              ml: 0.5,
                              width: '100%'
                            }
                          }}
                        />
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </FormGroup>
          </Collapse>
        </CardContent>
      </Card>

      {/* 加速链接结果 */}
      {acceleratedUrls.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              加速下载链接
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              选择一个代理服务进行下载，如果某个代理无法访问，请尝试其他代理
            </Typography>

            <Grid container spacing={2}>
              {acceleratedUrls.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2,
                      '&:hover': {
                        elevation: 2,
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      flexWrap: isMobile ? 'wrap' : 'nowrap',
                      gap: 1
                    }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                          <Chip 
                            label={item.proxy}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          {(() => {
                            const nodeStatus = getNodeStatus(item.proxy);
                            if (nodeStatus && nodeStatus.status !== 'unknown') {
                              return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  {nodeStatus.status === 'online' && (
                                    <>
                                      <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                                      {nodeStatus.latency && (
                                        <Typography variant="caption" color="success.main">
                                          {nodeStatus.latency}ms
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                  {nodeStatus.status === 'offline' && (
                                    <Tooltip title={nodeStatus.error || '不可用'}>
                                      <Error sx={{ fontSize: 14, color: 'error.main' }} />
                                    </Tooltip>
                                  )}
                                </Box>
                              );
                            }
                            return null;
                          })()}
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            wordBreak: 'break-all',
                            color: 'text.secondary',
                            fontSize: isMobile ? '12px' : '14px'
                          }}
                        >
                          {item.url}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1,
                        flexShrink: 0,
                        width: isMobile ? '100%' : 'auto',
                        justifyContent: isMobile ? 'center' : 'flex-end',
                        mt: isMobile ? 1 : 0
                      }}>
                        <Tooltip title="复制链接">
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(item.url)}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="在新窗口打开">
                          <IconButton
                            size="small"
                            component={Link}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Launch fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Download />}
                          component={Link}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ fontSize: isMobile ? '12px' : '14px' }}
                        >
                          下载
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 使用说明 */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            使用说明
          </Typography>
          
          <Box sx={{ '& > *': { mb: 2 } }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                支持的链接类型：
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>仓库文件：https://github.com/user/repo/blob/main/file.txt</li>
                <li>Raw文件：https://raw.githubusercontent.com/user/repo/main/file.txt</li>
                <li>Release文件：https://github.com/user/repo/releases/download/v1.0.0/file.zip</li>
                <li>整个仓库：https://github.com/user/repo/archive/refs/heads/main.zip</li>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                使用步骤：
              </Typography>
              <Box component="ol" sx={{ pl: 2, m: 0 }}>
                <li>复制需要下载的GitHub链接</li>
                <li>粘贴到上方输入框中</li>
                <li>点击"检测节点"按钮测试代理源的可用性和延迟</li>
                <li>根据检测结果选择合适的代理源（默认全选）</li>
                <li>点击"生成加速链接"按钮</li>
                <li>选择一个代理服务进行下载</li>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                注意事项：
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>代理服务可能存在访问限制或不稳定的情况</li>
                <li>节点检测功能可以帮助您选择最快的代理源</li>
                <li>检测结果仅供参考，实际下载速度可能因文件大小和网络环境而异</li>
                <li>如遇到无法下载，请尝试其他代理服务</li>
                <li>请遵守相关法律法规，合理使用代理服务</li>
                <li>大文件下载可能需要较长时间，请耐心等待</li>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}