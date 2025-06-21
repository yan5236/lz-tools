'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  Grid, 
  Paper, 
  Typography, 
  Snackbar, 
  Alert, 
  FormControlLabel, 
  Switch, 
  TextField, 
  IconButton, 
  Divider, 
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Select,
  FormControl,
  InputLabel,
  Slider
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import mermaid from 'mermaid';

export default function MermaidEditor() {
  const [mermaidCode, setMermaidCode] = useState<string>(`graph TD
    A[开始] --> B{是否满足条件?}
    B -->|是| C[执行操作A]
    B -->|否| D[执行操作B]
    C --> E[结束]
    D --> E`);
  
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string>('');
  
  // 缩放和拖拽相关状态
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const mermaidIdRef = useRef(0);

  // 示例模板
  const templates = {
    flowchart: `graph TD
    A[开始] --> B{是否满足条件?}
    B -->|是| C[执行操作A]
    B -->|否| D[执行操作B]
    C --> E[结束]
    D --> E`,
    
    sequence: `sequenceDiagram
    participant A as 用户
    participant B as 系统
    participant C as 数据库
    
    A->>B: 发送请求
    B->>C: 查询数据
    C-->>B: 返回结果
    B-->>A: 响应数据`,
    
    class: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +String color
        +meow()
    }
    
    Animal <|-- Dog
    Animal <|-- Cat`,
    
    state: `stateDiagram-v2
    [*] --> 待机
    待机 --> 运行 : 启动
    运行 --> 暂停 : 暂停操作
    暂停 --> 运行 : 继续
    运行 --> [*] : 停止`,
    
    gantt: `gantt
    title 项目开发计划
    dateFormat  YYYY-MM-DD
    section 设计阶段
    需求分析    :done, des1, 2024-01-01,2024-01-05
    UI设计      :active, des2, 2024-01-06, 3d
    section 开发阶段
    前端开发    :des3, after des2, 5d
    后端开发    :des4, after des2, 5d
    测试        :des5, after des3, 2d`,
    
    pie: `pie title 市场份额分布
    "产品A" : 40
    "产品B" : 30
    "产品C" : 20
    "其他" : 10`
  };

  // 初始化Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      themeVariables: {
        primaryColor: '#1976d2',
        primaryTextColor: '#333',
        primaryBorderColor: '#1976d2',
        lineColor: '#666',
        secondaryColor: '#f5f5f5',
        tertiaryColor: '#fff'
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true
      },
      sequence: {
        useMaxWidth: true,
        wrap: true
      }
    });
  }, []);

  // 从本地存储加载数据
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCode = localStorage.getItem('lz-mermaid-content');
        if (savedCode) {
          setMermaidCode(savedCode);
        }
        
        const savedAutoSave = localStorage.getItem('lz-mermaid-autosave');
        if (savedAutoSave !== null) {
          setAutoSave(savedAutoSave === 'true');
        }
      } catch (error) {
        console.error('加载本地存储数据失败:', error);
      }
    }
  }, []);

  // 自动保存功能
  useEffect(() => {
    if (autoSave && mermaidCode && typeof window !== 'undefined') {
      try {
        const timeoutId = setTimeout(() => {
          localStorage.setItem('lz-mermaid-content', mermaidCode);
        }, 1000);
        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error('保存到本地存储失败:', error);
      }
    }
  }, [mermaidCode, autoSave]);

  // 保存自动保存设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lz-mermaid-autosave', String(autoSave));
      } catch (error) {
        console.error('保存设置失败:', error);
      }
    }
  }, [autoSave]);

  // 渲染Mermaid图表
  const renderMermaid = async () => {
    if (!previewRef.current || !mermaidCode.trim()) return;
    
    setIsRendering(true);
    setRenderError('');
    
    try {
      // 清空预览区域
      previewRef.current.innerHTML = '';
      
      // 生成唯一ID
      const id = `mermaid-${++mermaidIdRef.current}`;
      
      // 验证和渲染Mermaid代码
      const isValid = await mermaid.parse(mermaidCode);
      if (isValid) {
        const { svg } = await mermaid.render(id, mermaidCode);
        previewRef.current.innerHTML = svg;
      }
    } catch (error: any) {
      console.error('Mermaid渲染错误:', error);
      setRenderError(error.message || '图表渲染失败，请检查语法是否正确');
      previewRef.current.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #d32f2f; background: #ffebee; border-radius: 4px;">
          <p><strong>渲染错误:</strong></p>
          <p>${error.message || '请检查Mermaid语法是否正确'}</p>
        </div>
      `;
    } finally {
      setIsRendering(false);
    }
  };

  // 当代码变化时重新渲染
  useEffect(() => {
    if (viewMode !== 'edit') {
      const timeoutId = setTimeout(renderMermaid, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [mermaidCode, viewMode]);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 只在预览模式下处理快捷键
      if (viewMode === 'edit') return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleResetView();
            break;
          case 'f':
            e.preventDefault();
            handleToggleFullscreen();
            break;
        }
      }
      
      // ESC键退出全屏
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, isFullscreen]);

  // 阻止全局滚轮事件在预览区域
  useEffect(() => {
    const preventGlobalWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    if (previewContainerRef.current) {
      previewContainerRef.current.addEventListener('wheel', preventGlobalWheel, { passive: false });
    }

    return () => {
      if (previewContainerRef.current) {
        previewContainerRef.current.removeEventListener('wheel', preventGlobalWheel);
      }
    };
  }, []);

  // 处理复制到剪贴板
  const handleCopy = () => {
    if (mermaidCode) {
      try {
        navigator.clipboard.writeText(mermaidCode)
          .then(() => {
            setSnackbarMessage('Mermaid代码已复制到剪贴板');
            setSnackbarOpen(true);
          })
          .catch(err => {
            console.error('复制失败:', err);
            setSnackbarMessage('复制失败');
            setSnackbarOpen(true);
          });
      } catch (error) {
        console.error('复制操作失败:', error);
        setSnackbarMessage('复制失败');
        setSnackbarOpen(true);
      }
    }
  };

  // 处理清空
  const handleClear = () => {
    if (confirm('确定要清空编辑器内容吗？')) {
      setMermaidCode('');
      if (autoSave && typeof window !== 'undefined') {
        try {
          localStorage.removeItem('lz-mermaid-content');
        } catch (error) {
          console.error('清除本地存储失败:', error);
        }
      }
    }
  };

  // 处理下载SVG文件
  const handleDownloadSVG = async () => {
    if (!mermaidCode.trim()) {
      setSnackbarMessage('请先输入Mermaid代码');
      setSnackbarOpen(true);
      return;
    }

    try {
      const id = `download-${Date.now()}`;
      const isValid = await mermaid.parse(mermaidCode);
      
      if (isValid) {
        const { svg } = await mermaid.render(id, mermaidCode);
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mermaid-diagram.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSnackbarMessage('SVG文件已下载');
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      console.error('下载失败:', error);
      setSnackbarMessage('下载失败: ' + (error.message || '请检查代码语法'));
      setSnackbarOpen(true);
    }
  };

  // 处理下载Mermaid代码文件
  const handleDownloadCode = () => {
    if (mermaidCode.trim()) {
      try {
        const blob = new Blob([mermaidCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram.mmd';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSnackbarMessage('Mermaid代码文件已下载');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('下载文件失败:', error);
        setSnackbarMessage('下载失败');
        setSnackbarOpen(true);
      }
    }
  };

  // 加载模板
  const handleLoadTemplate = (templateKey: keyof typeof templates) => {
    setMermaidCode(templates[templateKey]);
  };

  // 视图模式切换
  const handleEditMode = () => setViewMode('edit');
  const handlePreviewMode = () => setViewMode('preview');
  const handleSplitMode = () => setViewMode('split');

  // 缩放控制
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.2));
  };

  const handleResetView = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  const handleScaleChange = (event: Event, newValue: number | number[]) => {
    setScale(newValue as number);
  };

  // 全屏切换
  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 鼠标拖拽处理
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // 左键
      setIsDragging(true);
      setDragStart({ x: e.clientX - translateX, y: e.clientY - translateY });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTranslateX(e.clientX - dragStart.x);
      setTranslateY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.max(0.2, Math.min(3, prev + delta)));
    }
  };

  // 显示帮助信息
  const handleHelp = () => {
    const helpText = `Mermaid编辑器使用帮助：

1. 流程图 (graph/flowchart)
   - graph TD: 从上到下
   - graph LR: 从左到右
   
2. 时序图 (sequenceDiagram)
   - participant: 定义参与者
   - ->>: 实线箭头
   - -->>: 虚线箭头

3. 类图 (classDiagram)
   - class: 定义类
   - <|--: 继承关系

4. 状态图 (stateDiagram-v2)
   - [*]: 开始/结束状态

5. 甘特图 (gantt)
   - dateFormat: 日期格式
   - section: 分组

预览操作提示：
- 鼠标拖拽：平移图表
- Ctrl + 滚轮：缩放图表
- 键盘快捷键：
  * Ctrl + '+' / Ctrl + '='：放大
  * Ctrl + '-'：缩小
  * Ctrl + '0'：重置视图
  * Ctrl + 'F'：切换全屏
  * ESC：退出全屏
- 使用缩放控制按钮调整大小

更多语法请参考Mermaid官方文档。`;
    
    alert(helpText);
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* 工具栏 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {/* 视图模式切换 */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button
              size="small"
              variant={viewMode === 'edit' ? 'contained' : 'outlined'}
              startIcon={<EditIcon />}
              onClick={handleEditMode}
            >
              编辑
            </Button>
            <Button
              size="small"
              variant={viewMode === 'preview' ? 'contained' : 'outlined'}
              startIcon={<VisibilityIcon />}
              onClick={handlePreviewMode}
            >
              预览
            </Button>
            <Button
              size="small"
              variant={viewMode === 'split' ? 'contained' : 'outlined'}
              startIcon={<AccountTreeIcon />}
              onClick={handleSplitMode}
            >
              分屏
            </Button>
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* 模板选择 */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>选择模板</InputLabel>
            <Select
              value=""
              label="选择模板"
              onChange={(e) => handleLoadTemplate(e.target.value as keyof typeof templates)}
            >
              <MenuItem value="flowchart">
                <ListItemIcon><AccountTreeIcon fontSize="small" /></ListItemIcon>
                <ListItemText>流程图</ListItemText>
              </MenuItem>
              <MenuItem value="sequence">
                <ListItemIcon><TimelineIcon fontSize="small" /></ListItemIcon>
                <ListItemText>时序图</ListItemText>
              </MenuItem>
              <MenuItem value="class">
                <ListItemIcon><DeviceHubIcon fontSize="small" /></ListItemIcon>
                <ListItemText>类图</ListItemText>
              </MenuItem>
              <MenuItem value="state">
                <ListItemIcon><AccountTreeIcon fontSize="small" /></ListItemIcon>
                <ListItemText>状态图</ListItemText>
              </MenuItem>
              <MenuItem value="gantt">
                <ListItemIcon><TimelineIcon fontSize="small" /></ListItemIcon>
                <ListItemText>甘特图</ListItemText>
              </MenuItem>
              <MenuItem value="pie">
                <ListItemIcon><PieChartIcon fontSize="small" /></ListItemIcon>
                <ListItemText>饼图</ListItemText>
              </MenuItem>
            </Select>
          </FormControl>

          <Divider orientation="vertical" flexItem />

          {/* 操作按钮 */}
          <Tooltip title="复制代码">
            <IconButton size="small" onClick={handleCopy}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="下载SVG">
            <IconButton size="small" onClick={handleDownloadSVG}>
              <CloudDownloadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="下载代码">
            <IconButton size="small" onClick={handleDownloadCode}>
              <CloudDownloadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="清空">
            <IconButton size="small" onClick={handleClear}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="帮助">
            <IconButton size="small" onClick={handleHelp}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem />

          {/* 缩放控制 */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <>
              <Tooltip title="放大">
                <IconButton size="small" onClick={handleZoomIn}>
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="缩小">
                <IconButton size="small" onClick={handleZoomOut}>
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="重置视图">
                <IconButton size="small" onClick={handleResetView}>
                  <CenterFocusStrongIcon />
                </IconButton>
              </Tooltip>

              <Box sx={{ width: 100, mx: 1 }}>
                <Slider
                  value={scale}
                  onChange={handleScaleChange}
                  min={0.2}
                  max={3}
                  step={0.1}
                  size="small"
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                />
              </Box>

              <Tooltip title={isFullscreen ? "退出全屏" : "全屏预览"}>
                <IconButton size="small" onClick={handleToggleFullscreen}>
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem />
            </>
          )}

          {/* 自动保存开关 */}
          <FormControlLabel
            control={
              <Switch
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                size="small"
              />
            }
            label="自动保存"
            sx={{ ml: 1 }}
          />
        </Box>
      </Paper>

      {/* 编辑器和预览区域 */}
      <Grid container spacing={2} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* 编辑器 */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <Grid item xs={viewMode === 'split' ? 6 : 12}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
                Mermaid代码编辑器
              </Typography>
              <Box sx={{ flex: 1, p: 2, pt: 0 }}>
                <TextField
                  inputRef={textFieldRef}
                  multiline
                  fullWidth
                  value={mermaidCode}
                  onChange={(e) => setMermaidCode(e.target.value)}
                  placeholder="在此输入Mermaid代码..."
                  sx={{
                    height: '100%',
                    '& .MuiInputBase-root': {
                      height: '100%',
                      alignItems: 'flex-start'
                    },
                    '& .MuiInputBase-input': {
                      height: '100% !important',
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                      fontSize: '14px',
                      lineHeight: 1.5
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        )}

        {/* 预览区域 */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <Grid item xs={viewMode === 'split' ? 6 : 12}>
            <Paper 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                ...(isFullscreen && {
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 9999,
                  bgcolor: 'background.paper'
                })
              }}
            >
              <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
                预览
                {isRendering && <Typography component="span" sx={{ ml: 1, color: 'primary.main' }}>渲染中...</Typography>}
                <Typography component="span" sx={{ ml: 2, fontSize: '0.8em', color: 'text.secondary' }}>
                  {Math.round(scale * 100)}% | 拖拽移动 | Ctrl+滚轮缩放
                </Typography>
              </Typography>
              <Box 
                ref={previewContainerRef}
                sx={{ 
                  flex: 1, 
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  userSelect: 'none'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              >
                <Box
                  ref={previewRef}
                  sx={{
                    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    minWidth: 'fit-content',
                    minHeight: 'fit-content',
                    p: 2,
                    '& svg': {
                      display: 'block',
                      margin: '0 auto'
                    }
                  }}
                />
              </Box>
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