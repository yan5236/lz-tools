'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  Typography, 
  Snackbar, 
  Alert, 
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

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
      id={`code-tabpanel-${index}`}
      aria-labelledby={`code-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function HtmlRunner() {
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML示例</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            text-align: center;
        }
        .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 15px;
            margin: 20px 0;
        }
        button {
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #ff5252;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>欢迎使用HTML在线运行器！</h1>
            <p>这是一个示例页面，您可以编辑HTML、CSS和JavaScript代码。</p>
            <button onclick="showAlert()">点击我</button>
            <p id="demo">JavaScript演示区域</p>
        </div>
    </div>

    <script>
        function showAlert() {
            alert('Hello World! 这是JavaScript演示');
            document.getElementById('demo').innerHTML = '按钮被点击了！时间: ' + new Date().toLocaleString();
        }
        
        // 页面加载完成后的欢迎信息
        window.onload = function() {
            console.log('页面加载完成！');
        }
    </script>
</body>
</html>`);
  
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 运行代码
  const runCode = () => {
    if (!htmlCode.trim()) {
      showSnackbar('请输入HTML代码');
      return;
    }

    let finalHtml = htmlCode;
    
    // 如果有额外的CSS，添加到head中
    if (cssCode.trim()) {
      const cssTag = `<style>${cssCode}</style>`;
      if (finalHtml.includes('</head>')) {
        finalHtml = finalHtml.replace('</head>', `${cssTag}\n</head>`);
      } else {
        finalHtml = `<style>${cssCode}</style>\n${finalHtml}`;
      }
    }
    
    // 如果有额外的JavaScript，添加到body末尾
    if (jsCode.trim()) {
      const jsTag = `<script>${jsCode}</script>`;
      if (finalHtml.includes('</body>')) {
        finalHtml = finalHtml.replace('</body>', `${jsTag}\n</body>`);
      } else {
        finalHtml = `${finalHtml}\n<script>${jsCode}</script>`;
      }
    }

    // 为iframe添加基本样式，避免外部资源依赖
    let iframeCompatibleHtml = finalHtml;
    const baseStyles = `
      <style>
        /* 基础样式重置，避免依赖外部资源 */
        * { box-sizing: border-box; }
        body { margin: 0; padding: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      </style>`;
    
    if (iframeCompatibleHtml.includes('<head>')) {
      iframeCompatibleHtml = iframeCompatibleHtml.replace(/<head>/i, `<head>${baseStyles}`);
    } else {
      iframeCompatibleHtml = `${baseStyles}${iframeCompatibleHtml}`;
    }

    if (isMobile) {
      // 移动端：打开新窗口
      const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      if (newWindow) {
        newWindow.document.write(finalHtml);
        newWindow.document.close();
        showSnackbar('代码已在新窗口中运行');
      } else {
        showSnackbar('无法打开新窗口，请检查浏览器设置');
      }
    } else {
      // 桌面端：在iframe中预览
      if (iframeRef.current) {
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(iframeCompatibleHtml);
          iframeDoc.close();
        }
      }
      // 不自动打开全屏预览，让用户选择
    }
  };

  // 清空代码
  const clearCode = () => {
    setHtmlCode('');
    setCssCode('');
    setJsCode('');
    showSnackbar('代码已清空');
  };

  // 复制代码
  const copyCode = () => {
    let codeToCopy = '';
    switch(tabValue) {
      case 0:
        codeToCopy = htmlCode;
        break;
      case 1:
        codeToCopy = cssCode;
        break;
      case 2:
        codeToCopy = jsCode;
        break;
    }
    
    if (codeToCopy.trim()) {
      navigator.clipboard.writeText(codeToCopy)
        .then(() => showSnackbar('代码已复制到剪贴板'))
        .catch(() => showSnackbar('复制失败'));
    } else {
      showSnackbar('当前标签页没有代码可复制');
    }
  };

  // 显示提示信息
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // 处理标签切换
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 在新窗口中运行（桌面端也可使用）
  const runInNewWindow = () => {
    if (!htmlCode.trim()) {
      showSnackbar('请输入HTML代码');
      return;
    }

    let finalHtml = htmlCode;
    
    if (cssCode.trim()) {
      const cssTag = `<style>${cssCode}</style>`;
      if (finalHtml.includes('</head>')) {
        finalHtml = finalHtml.replace('</head>', `${cssTag}\n</head>`);
      } else {
        finalHtml = `<style>${cssCode}</style>\n${finalHtml}`;
      }
    }
    
    if (jsCode.trim()) {
      const jsTag = `<script>${jsCode}</script>`;
      if (finalHtml.includes('</body>')) {
        finalHtml = finalHtml.replace('</body>', `${jsTag}\n</body>`);
      } else {
        finalHtml = `${finalHtml}\n<script>${jsCode}</script>`;
      }
    }

    const newWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
    if (newWindow) {
      newWindow.document.write(finalHtml);
      newWindow.document.close();
      showSnackbar('代码已在新窗口中运行');
    } else {
      showSnackbar('无法打开新窗口，请检查浏览器设置');
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* 使用说明 */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              使用说明：在代码编辑器中输入HTML、CSS、JavaScript代码，点击"运行代码"按钮预览效果。
              {isMobile ? '移动端将在新窗口中运行代码。' : '桌面端支持实时预览。'}
            </Typography>
          </Paper>
        </Grid>

        {/* 代码编辑区 */}
        <Grid item xs={12} md={isMobile ? 12 : 6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">代码编辑器</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                  onClick={runCode}
                  size="small"
                >
                  {isMobile ? '运行代码' : '预览'}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<OpenInNewIcon />}
                  onClick={runInNewWindow}
                  size="small"
                >
                  新窗口运行
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={copyCode}
                  size="small"
                >
                  复制
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={clearCode}
                  size="small"
                >
                  清空
                </Button>
              </Box>
            </Box>

            {/* 代码标签页 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="代码编辑标签">
                <Tab label="HTML" />
                <Tab label="CSS" />
                <Tab label="JavaScript" />
              </Tabs>
            </Box>

            {/* HTML编辑器 */}
            <TabPanel value={tabValue} index={0}>
              <TextField
                label="HTML代码"
                multiline
                rows={16}
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="请输入HTML代码..."
                sx={{ fontFamily: 'monospace' }}
              />
            </TabPanel>

            {/* CSS编辑器 */}
            <TabPanel value={tabValue} index={1}>
              <TextField
                label="CSS代码 (可选)"
                multiline
                rows={16}
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="请输入CSS代码..."
                sx={{ fontFamily: 'monospace' }}
              />
            </TabPanel>

            {/* JavaScript编辑器 */}
            <TabPanel value={tabValue} index={2}>
              <TextField
                label="JavaScript代码 (可选)"
                multiline
                rows={16}
                value={jsCode}
                onChange={(e) => setJsCode(e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="请输入JavaScript代码..."
                sx={{ fontFamily: 'monospace' }}
              />
            </TabPanel>
          </Paper>
        </Grid>

        {/* 桌面端预览区 */}
        {!isMobile && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">预览</Typography>
                <IconButton
                  onClick={() => setPreviewOpen(true)}
                  size="small"
                  title="全屏预览"
                >
                  <FullscreenIcon />
                </IconButton>
              </Box>
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, height: 'calc(100% - 60px)' }}>
                <iframe
                  ref={iframeRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                  title="HTML预览"
                />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* 全屏预览对话框 */}
      <Dialog
        fullScreen
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          HTML预览
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setPreviewOpen(false)}
            aria-label="关闭"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <iframe
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            title="HTML全屏预览"
            srcDoc={(() => {
              let html = htmlCode;
              if (cssCode.trim()) {
                const cssTag = `<style>${cssCode}</style>`;
                if (html.includes('</head>')) {
                  html = html.replace('</head>', `${cssTag}\n</head>`);
                } else {
                  html = `<style>${cssCode}</style>\n${html}`;
                }
              }
              if (jsCode.trim()) {
                const jsTag = `<script>${jsCode}</script>`;
                if (html.includes('</body>')) {
                  html = html.replace('</body>', `${jsTag}\n</body>`);
                } else {
                  html = `${html}\n<script>${jsCode}</script>`;
                }
              }
              const baseStyles = `
                <style>
                  * { box-sizing: border-box; }
                  body { margin: 0; padding: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                </style>`;
              
              if (html.includes('<head>')) {
                return html.replace(/<head>/i, `<head>${baseStyles}`);
              } else {
                return `${baseStyles}${html}`;
              }
            })()}
          />
        </DialogContent>
      </Dialog>

      {/* 提示信息 */}
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