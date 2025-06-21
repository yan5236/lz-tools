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
  Snackbar
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Clear as ClearIcon
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
      <Grid container spacing={3}>
        {/* 使用说明 */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              使用说明：输入API接口URL，选择HTTP方法，配置请求头和请求体，点击发送按钮测试API接口。
            </Typography>
          </Paper>
        </Grid>

        {/* 请求配置区域 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              HTTP请求配置
            </Typography>

            {/* URL和方法 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>方法</InputLabel>
                <Select
                  value={method}
                  label="方法"
                  onChange={(e) => setMethod(e.target.value)}
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
              />
              
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
                onClick={sendRequest}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? '发送中' : '发送'}
              </Button>
              
              {loading && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={cancelRequest}
                >
                  取消
                </Button>
              )}
            </Box>

            {/* 选项卡 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="请求头" />
                <Tab label="请求体" />
                <Tab label="历史记录" />
              </Tabs>
            </Box>

            {/* 请求头配置 */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">请求头</Typography>
                <Button startIcon={<AddIcon />} onClick={addHeader} size="small">
                  添加请求头
                </Button>
              </Box>
              
              {headers.map((header, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    placeholder="请求头名称"
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    placeholder="请求头值"
                    value={header.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    sx={{ flex: 1 }}
                  />
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
                </Box>
              ))}
            </TabPanel>

            {/* 请求体配置 */}
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ mb: 2 }}>
                <FormControl sx={{ minWidth: 120, mb: 2 }}>
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
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  fullWidth
                  placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : '请输入请求体内容'}
                  disabled={['GET', 'HEAD'].includes(method)}
                  helperText={['GET', 'HEAD'].includes(method) ? '该HTTP方法不支持请求体' : ''}
                />
              </Box>
            </TabPanel>

            {/* 历史记录 */}
            <TabPanel value={activeTab} index={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">请求历史</Typography>
                <Button
                  startIcon={<ClearIcon />}
                  onClick={() => setHistory([])}
                  size="small"
                  color="error"
                  disabled={history.length === 0}
                >
                  清空历史
                </Button>
              </Box>
              
              {history.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  暂无请求历史
                </Typography>
              ) : (
                <Box>
                  {history.map((item) => (
                    <Card key={item.id} sx={{ mb: 1, cursor: 'pointer' }} onClick={() => loadFromHistory(item)}>
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={item.method} size="small" color="primary" />
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {item.url}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </TabPanel>

            {/* 操作按钮 */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                startIcon={<ClearIcon />}
                onClick={clearAll}
                variant="outlined"
                color="error"
              >
                清空所有
              </Button>
            </Box>
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
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">响应结果</Typography>
                <Button
                  startIcon={<CopyIcon />}
                  onClick={copyResponse}
                  size="small"
                >
                  复制响应
                </Button>
              </Box>

              {/* 响应概览 */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                  label={`${response.status} ${response.statusText}`}
                  color={getStatusColor(response.status)}
                />
                <Chip label={`${response.duration}ms`} variant="outlined" />
                <Chip label={`${response.size} bytes`} variant="outlined" />
              </Box>

              {/* 响应选项卡 */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={responseTab} onChange={(e, newValue) => setResponseTab(newValue)}>
                  <Tab label="响应体" />
                  <Tab label="响应头" />
                </Tabs>
              </Box>

              {/* 响应体 */}
              <TabPanel value={responseTab} index={0}>
                <TextField
                  multiline
                  rows={12}
                  value={typeof response.data === 'string' ? response.data : formatJson(response.data)}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
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
                          <TableCell sx={{ fontFamily: 'monospace' }}>{key}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace' }}>{String(value)}</TableCell>
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