'use client';

import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  useTheme,
  useMediaQuery,
  Stack,
  Collapse
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestHistory {
  id: string;
  method: string;
  url: string;
  timestamp: number;
  status?: number;
  statusText?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function HttpRequestTool() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // 基本请求信息
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Header[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true }
  ]);
  const [body, setBody] = useState('');
  const [bodyType, setBodyType] = useState('json');

  // 响应信息
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // UI状态
  const [activeTab, setActiveTab] = useState(0);
  const [responseTab, setResponseTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [requestConfigExpanded, setRequestConfigExpanded] = useState(!isMobile); // 移动端默认收起

  // 历史记录
  const [history, setHistory] = useState<RequestHistory[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);

  // HTTP方法选项
  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  // 添加请求头
  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };

  // 删除请求头
  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  // 更新请求头
  const updateHeader = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  // 发送请求
  const sendRequest = async () => {
    if (!url.trim()) {
      setError('请输入请求URL');
      return;
    }

    // 验证URL格式
    try {
      new URL(url);
    } catch {
      setError('请输入有效的URL');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    // 创建AbortController用于取消请求
    abortControllerRef.current = new AbortController();

    try {
      const startTime = Date.now();

      // 构建请求头
      const requestHeaders: Record<string, string> = {};
      headers
        .filter(h => h.enabled && h.key.trim() && h.value.trim())
        .forEach(h => {
          requestHeaders[h.key] = h.value;
        });

      // 构建请求配置
      const config: RequestInit = {
        method,
        headers: requestHeaders,
        signal: abortControllerRef.current.signal
      };

      // 添加请求体（除了GET和HEAD方法）
      if (!['GET', 'HEAD'].includes(method) && body.trim()) {
        if (bodyType === 'json') {
          try {
            JSON.parse(body); // 验证JSON格式
            config.body = body;
          } catch {
            setError('请求体不是有效的JSON格式');
            setLoading(false);
            return;
          }
        } else {
          config.body = body;
        }
      }

      // 发送请求
      const response = await fetch(url, config);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 获取响应头
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // 获取响应体
      const contentType = response.headers.get('content-type') || '';
      let responseData: any;
      let responseText = '';

      try {
        responseText = await response.text();
        if (contentType.includes('application/json') && responseText) {
          responseData = JSON.parse(responseText);
        } else {
          responseData = responseText;
        }
      } catch {
        responseData = responseText;
      }

      // 设置响应信息
      const responseInfo = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        size: responseText.length,
        duration,
        url: response.url
      };

      setResponse(responseInfo);

      // 添加到历史记录
      const historyItem: RequestHistory = {
        id: Date.now().toString(),
        method,
        url,
        timestamp: Date.now(),
        status: response.status,
        statusText: response.statusText
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // 保留最近10条记录

    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('请求已取消');
      } else {
        setError(`请求失败: ${err.message || '网络错误'}`);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // 取消请求
  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // 清空所有数据
  const clearAll = () => {
    setUrl('');
    setHeaders([{ key: 'Content-Type', value: 'application/json', enabled: true }]);
    setBody('');
    setResponse(null);
    setError('');
  };

  // 复制响应数据
  const copyResponse = () => {
    if (response?.data) {
      const textToCopy = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data, null, 2);
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        setSnackbarMessage('响应数据已复制到剪贴板');
        setSnackbarOpen(true);
      }).catch(() => {
        setSnackbarMessage('复制失败');
        setSnackbarOpen(true);
      });
    }
  };

  // 从历史记录加载请求
  const loadFromHistory = (historyItem: RequestHistory) => {
    setMethod(historyItem.method);
    setUrl(historyItem.url);
  };

  // 获取状态码颜色
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'info';
    if (status >= 400 && status < 500) return 'warning';
    if (status >= 500) return 'error';
    return 'default';
  };

  // 格式化JSON
  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <Box>
      <Grid container spacing={isSmallScreen ? 2 : 3}>
        {/* 使用说明 */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: isSmallScreen ? 1.5 : 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant={isSmallScreen ? "body2" : "subtitle2"} gutterBottom>
              使用说明：输入API接口URL，选择HTTP方法，配置请求头和请求体，点击发送按钮测试API接口。
            </Typography>
          </Paper>
        </Grid>

        {/* 快速请求区域 */}
        <Grid item xs={12}>
          <Paper sx={{ p: isSmallScreen ? 2 : 3 }}>
            <Typography variant="h6" gutterBottom>
              HTTP请求测试
            </Typography>

            {/* URL和方法 - 移动端垂直布局 */}
            <Stack 
              direction={isMobile ? "column" : "row"} 
              spacing={2} 
              sx={{ mb: 3 }}
            >
              <FormControl sx={{ minWidth: isMobile ? '100%' : 120 }}>
                <InputLabel>方法</InputLabel>
                <Select
                  value={method}
                  label="方法"
                  onChange={(e) => setMethod(e.target.value)}
                  size={isSmallScreen ? "small" : "medium"}
                >
                  {httpMethods.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="请求URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                fullWidth
                placeholder="https://api.example.com/users"
                size={isSmallScreen ? "small" : "medium"}
                sx={{ 
                  flex: 1,
                  minWidth: isMobile ? '100%' : 'auto'
                }}
              />
              
              <Stack direction="row" spacing={1} sx={{ minWidth: isMobile ? '100%' : 'auto' }}>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
                  onClick={sendRequest}
                  disabled={loading}
                  fullWidth={isMobile}
                  size={isSmallScreen ? "small" : "medium"}
                  sx={{ minWidth: isMobile ? 'auto' : 120 }}
                >
                  {loading ? '发送中' : '发送'}
                </Button>
                
                {loading && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={cancelRequest}
                    size={isSmallScreen ? "small" : "medium"}
                    fullWidth={isMobile}
                  >
                    取消
                  </Button>
                )}
              </Stack>
            </Stack>

            {/* 移动端高级配置展开/收起 */}
            {isMobile && (
              <Box sx={{ mb: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={requestConfigExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setRequestConfigExpanded(!requestConfigExpanded)}
                  size="small"
                >
                  {requestConfigExpanded ? '收起高级配置' : '展开高级配置'}
                </Button>
              </Box>
            )}

            {/* 高级配置区域 */}
            <Collapse in={requestConfigExpanded}>
              {/* 选项卡 */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant={isMobile ? "scrollable" : "standard"}
                  scrollButtons={isMobile ? "auto" : false}
                  allowScrollButtonsMobile
                >
                  <Tab label="请求头" />
                  <Tab label="请求体" />
                  <Tab label="历史记录" />
                </Tabs>
              </Box>

              {/* 请求头配置 */}
              <TabPanel value={activeTab} index={0}>
                <Stack direction={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "stretch" : "center"} sx={{ mb: 2 }} spacing={1}>
                  <Typography variant="subtitle1">请求头</Typography>
                  <Button startIcon={<AddIcon />} onClick={addHeader} size="small" fullWidth={isMobile}>
                    添加请求头
                  </Button>
                </Stack>
                
                {headers.map((header, index) => (
                  <Stack key={index} direction={isMobile ? "column" : "row"} spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="请求头名称"
                      value={header.key}
                      onChange={(e) => updateHeader(index, 'key', e.target.value)}
                      fullWidth={isMobile}
                      sx={{ flex: isMobile ? 'none' : 1 }}
                    />
                    <TextField
                      size="small"
                      placeholder="请求头值"
                      value={header.value}
                      onChange={(e) => updateHeader(index, 'value', e.target.value)}
                      fullWidth={isMobile}
                      sx={{ flex: isMobile ? 'none' : 1 }}
                    />
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => updateHeader(index, 'enabled', !header.enabled)}
                        color={header.enabled ? 'primary' : 'default'}
                      >
                        {header.enabled ? '✓' : '○'}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => removeHeader(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                ))}
              </TabPanel>

              {/* 请求体配置 */}
              <TabPanel value={activeTab} index={1}>
                <Stack spacing={2}>
                  <FormControl sx={{ minWidth: isMobile ? '100%' : 120 }}>
                    <InputLabel>请求体类型</InputLabel>
                    <Select
                      value={bodyType}
                      label="请求体类型"
                      onChange={(e) => setBodyType(e.target.value)}
                      size="small"
                    >
                      <MenuItem value="json">JSON</MenuItem>
                      <MenuItem value="text">纯文本</MenuItem>
                      <MenuItem value="form">表单数据</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="请求体内容"
                    multiline
                    rows={isMobile ? 6 : 8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    fullWidth
                    placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : '请输入请求体内容'}
                    disabled={['GET', 'HEAD'].includes(method)}
                    helperText={['GET', 'HEAD'].includes(method) ? '该HTTP方法不支持请求体' : ''}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: 'monospace',
                        fontSize: isSmallScreen ? '12px' : '14px'
                      }
                    }}
                  />
                </Stack>
              </TabPanel>

              {/* 历史记录 */}
              <TabPanel value={activeTab} index={2}>
                <Stack direction={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "stretch" : "center"} sx={{ mb: 2 }} spacing={1}>
                  <Typography variant="subtitle1">请求历史</Typography>
                  <Button
                    startIcon={<ClearIcon />}
                    onClick={() => setHistory([])}
                    size="small"
                    color="error"
                    disabled={history.length === 0}
                    fullWidth={isMobile}
                  >
                    清空历史
                  </Button>
                </Stack>
                
                {history.length === 0 ? (
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    暂无请求历史
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {history.map((item) => (
                      <Card key={item.id} sx={{ cursor: 'pointer' }} onClick={() => loadFromHistory(item)}>
                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Stack direction={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "flex-start" : "center"} spacing={1}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flex: 1 }}>
                              <Chip label={item.method} size="small" color="primary" />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'monospace',
                                  fontSize: isSmallScreen ? '11px' : '12px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: isMobile ? 'nowrap' : 'normal'
                                }}
                              >
                                {item.url}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              {item.status && (
                                <Chip
                                  label={`${item.status} ${item.statusText}`}
                                  size="small"
                                  color={getStatusColor(item.status)}
                                />
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {new Date(item.timestamp).toLocaleString()}
                              </Typography>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </TabPanel>
            </Collapse>

            {/* 操作按钮 */}
            <Stack direction={isMobile ? "column" : "row"} spacing={1} sx={{ mt: 2 }}>
              <Button
                startIcon={<ClearIcon />}
                onClick={clearAll}
                variant="outlined"
                color="error"
                fullWidth={isMobile}
                size={isSmallScreen ? "small" : "medium"}
              >
                清空所有
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* 错误信息 */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        {/* 响应区域 */}
        {response && (
          <Grid item xs={12}>
            <Paper sx={{ p: isSmallScreen ? 2 : 3 }}>
              <Stack direction={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "stretch" : "center"} sx={{ mb: 2 }} spacing={1}>
                <Typography variant="h6">响应结果</Typography>
                <Button
                  startIcon={<CopyIcon />}
                  onClick={copyResponse}
                  size="small"
                  fullWidth={isMobile}
                >
                  复制响应
                </Button>
              </Stack>

              {/* 响应概览 */}
              <Stack direction={isMobile ? "column" : "row"} spacing={1} sx={{ mb: 3 }}>
                <Chip
                  label={`${response.status} ${response.statusText}`}
                  color={getStatusColor(response.status)}
                  size={isSmallScreen ? "small" : "medium"}
                />
                <Chip 
                  label={`${response.duration}ms`} 
                  variant="outlined" 
                  size={isSmallScreen ? "small" : "medium"}
                />
                <Chip 
                  label={`${response.size} bytes`} 
                  variant="outlined" 
                  size={isSmallScreen ? "small" : "medium"}
                />
              </Stack>

              {/* 响应选项卡 */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={responseTab} 
                  onChange={(e, newValue) => setResponseTab(newValue)}
                  variant={isMobile ? "fullWidth" : "standard"}
                >
                  <Tab label="响应体" />
                  <Tab label="响应头" />
                </Tabs>
              </Box>

              {/* 响应体 */}
              <TabPanel value={responseTab} index={0}>
                <TextField
                  multiline
                  rows={isMobile ? 8 : 12}
                  value={typeof response.data === 'string' ? response.data : formatJson(response.data)}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    sx: { 
                      fontFamily: 'monospace', 
                      fontSize: isSmallScreen ? '11px' : '0.875rem'
                    }
                  }}
                />
              </TabPanel>

              {/* 响应头 */}
              <TabPanel value={responseTab} index={1}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>请求头名称</TableCell>
                        <TableCell>值</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(response.headers).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell sx={{ 
                            fontFamily: 'monospace',
                            fontSize: isSmallScreen ? '11px' : '0.875rem',
                            wordBreak: 'break-word'
                          }}>
                            {key}
                          </TableCell>
                          <TableCell sx={{ 
                            fontFamily: 'monospace',
                            fontSize: isSmallScreen ? '11px' : '0.875rem',
                            wordBreak: 'break-word'
                          }}>
                            {String(value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </Paper>
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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 