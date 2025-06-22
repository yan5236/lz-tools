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
  useTheme,
  useMediaQuery,
  Collapse,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import LinkIcon from '@mui/icons-material/Link';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import CodeOffIcon from '@mui/icons-material/CodeOff';
import TableChartIcon from '@mui/icons-material/TableChart';
import MicIcon from '@mui/icons-material/Mic';
import ImageIcon from '@mui/icons-material/Image';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TitleIcon from '@mui/icons-material/Title';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import Looks4Icon from '@mui/icons-material/Looks4';
import Looks5Icon from '@mui/icons-material/Looks5';
import Looks6Icon from '@mui/icons-material/Looks6';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import dynamic from 'next/dynamic';

// 完全客户端渲染的预览组件
const Preview = dynamic(
  () => import('./preview').then(mod => mod.default),
  { ssr: false }
);

export default function MarkdownEditor() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [markdown, setMarkdown] = useState<string>('# Markdown编辑器\n\n欢迎使用LZ小工具的Markdown编辑器!\n\n## 功能介绍\n\n- 实时预览\n- 导出为.md文件\n- 复制Markdown内容\n- 自动保存到本地存储\n\n```js\n// 示例代码\nfunction greeting() {\n  console.log("Hello, Markdown!");\n}\n```\n\n> 提示：可以使用工具栏进行快速格式化');
  
  // 移动端默认为编辑模式，桌面端默认为编辑模式
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>(isMobile ? 'edit' : 'edit');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [toolbarExpanded, setToolbarExpanded] = useState(!isMobile); // 移动端默认收起工具栏
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  
  // 标题菜单状态
  const [headingAnchorEl, setHeadingAnchorEl] = useState<null | HTMLElement>(null);
  const headingMenuOpen = Boolean(headingAnchorEl);

  // 响应式调整viewMode和工具栏状态
  useEffect(() => {
    if (isMobile && viewMode === 'split') {
      setViewMode('edit');
    }
    setToolbarExpanded(!isMobile);
  }, [isMobile, viewMode]);

  // 从本地存储加载数据
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedMarkdown = localStorage.getItem('lz-markdown-content');
        if (savedMarkdown) {
          setMarkdown(savedMarkdown);
        }
        
        const savedAutoSave = localStorage.getItem('lz-markdown-autosave');
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
    if (autoSave && markdown && typeof window !== 'undefined') {
      try {
        const timeoutId = setTimeout(() => {
          localStorage.setItem('lz-markdown-content', markdown);
        }, 1000);
        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error('保存到本地存储失败:', error);
      }
    }
  }, [markdown, autoSave]);

  // 保存自动保存设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lz-markdown-autosave', String(autoSave));
      } catch (error) {
        console.error('保存设置失败:', error);
      }
    }
  }, [autoSave]);

  // 处理复制到剪贴板
  const handleCopy = () => {
    if (markdown) {
      try {
        navigator.clipboard.writeText(markdown)
          .then(() => {
            setSnackbarMessage('内容已复制到剪贴板');
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
      setMarkdown('');
      if (autoSave && typeof window !== 'undefined') {
        try {
          localStorage.removeItem('lz-markdown-content');
        } catch (error) {
          console.error('清除本地存储失败:', error);
        }
      }
    }
  };

  // 处理下载Markdown文件
  const handleDownload = () => {
    if (markdown) {
      try {
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSnackbarMessage('文件已下载');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('下载文件失败:', error);
        setSnackbarMessage('下载失败');
        setSnackbarOpen(true);
      }
    }
  };

  // 视图模式切换
  const handleEditMode = () => setViewMode('edit');
  const handlePreviewMode = () => setViewMode('preview');
  const handleSplitMode = () => {
    // 移动端不支持分屏模式
    if (!isMobile) {
      setViewMode('split');
    }
  };

  // 工具栏功能实现 - 辅助函数
  const insertText = (before: string, after: string = '') => {
    const textField = textFieldRef.current;
    if (!textField) return;

    const start = textField.selectionStart;
    const end = textField.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const newText = markdown.substring(0, start) + before + selectedText + after + markdown.substring(end);
    
    setMarkdown(newText);
    
    // 延迟聚焦和设置光标位置，确保DOM已更新
    setTimeout(() => {
      textField.focus();
      const newCursorPos = selectedText ? start + before.length + selectedText.length + after.length : start + before.length;
      textField.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // 标题下拉菜单处理
  const handleHeadingClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setHeadingAnchorEl(event.currentTarget);
  };

  const handleHeadingMenuClose = () => {
    setHeadingAnchorEl(null);
  };

  const handleHeadingSelect = (level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    insertText(prefix);
    handleHeadingMenuClose();
  };

  // 文本格式化处理函数
  const handleBold = () => insertText('**', '**');
  const handleItalic = () => insertText('*', '*');
  const handleStrikethrough = () => insertText('~~', '~~');

  const handleLink = () => {
    const textField = textFieldRef.current;
    if (!textField) return;

    const start = textField.selectionStart;
    const end = textField.selectionEnd;
    const selectedText = markdown.substring(start, end);
    
    const linkText = selectedText || '链接文本';
    const linkUrl = 'https://example.com';
    const linkMarkdown = `[${linkText}](${linkUrl})`;
    
    insertText(linkMarkdown);
  };

  const handleImage = () => {
    const imageMarkdown = '![图片描述](图片URL)';
    insertText(imageMarkdown);
  };

  const handleBulletList = () => insertText('- ');
  const handleNumberedList = () => insertText('1. ');
  const handleTaskList = () => insertText('- [ ] ');
  const handleQuote = () => insertText('> ');

  const handleCodeBlock = () => {
    insertText('```\n', '\n```');
  };

  const handleInlineCode = () => insertText('`', '`');

  const handleTable = () => {
    const tableMarkdown = `| 标题1 | 标题2 | 标题3 |
| ----- | ----- | ----- |
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |`;
    insertText(tableMarkdown);
  };

  const handleHelp = () => {
    const helpText = `# Markdown 快速参考

## 标题
# 一级标题
## 二级标题
### 三级标题

## 文本格式
**粗体文本**
*斜体文本*
~~删除线~~

## 列表
### 无序列表
- 项目1
- 项目2

### 有序列表
1. 项目1
2. 项目2

### 任务列表
- [x] 已完成
- [ ] 未完成

## 链接和图片
[链接文本](https://example.com)
![图片描述](图片URL)

## 引用
> 这是一段引用文本

## 代码
\`行内代码\`

\`\`\`javascript
// 代码块
function hello() {
  console.log("Hello, world!");
}
\`\`\`

## 表格
| 标题1 | 标题2 |
| ----- | ----- |
| 内容1 | 内容2 |
| 内容3 | 内容4 |

${isMobile ? '\n## 移动端使用提示\n- 点击工具栏展开/收起按钮来显示/隐藏格式化工具\n- 使用悬浮按钮快速访问常用功能\n- 在编辑和预览模式间切换查看效果' : ''}
`;
    
    setMarkdown(helpText);
    setSnackbarMessage('已加载Markdown快速参考指南');
    setSnackbarOpen(true);
  };

  // 移动端快速操作按钮配置
  const speedDialActions = [
    { icon: <FormatBoldIcon />, name: '粗体', onClick: handleBold },
    { icon: <FormatItalicIcon />, name: '斜体', onClick: handleItalic },
    { icon: <LinkIcon />, name: '链接', onClick: handleLink },
    { icon: <FormatListBulletedIcon />, name: '列表', onClick: handleBulletList },
    { icon: <CodeIcon />, name: '代码', onClick: handleInlineCode },
    { icon: <FormatQuoteIcon />, name: '引用', onClick: handleQuote },
  ];

  return (
    <Box>
      <Grid container spacing={isSmallScreen ? 2 : 3}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: isSmallScreen ? 1.5 : 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant={isSmallScreen ? "body2" : "subtitle2"} gutterBottom>
              使用说明：在{isMobile ? '编辑器中' : '左侧'}编辑Markdown代码，{isMobile ? '切换到预览模式' : '右侧'}实时预览效果。支持常用的Markdown语法，如标题、列表、代码块等。
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant={viewMode === 'edit' ? 'contained' : 'outlined'}
                color="primary"
                onClick={handleEditMode}
                startIcon={<EditIcon />}
                size="small"
              >
                编辑
              </Button>
              <Button
                variant={viewMode === 'preview' ? 'contained' : 'outlined'}
                color="primary"
                onClick={handlePreviewMode}
                startIcon={<VisibilityIcon />}
                size="small"
              >
                预览
              </Button>
              {/* 移动端隐藏分屏模式 */}
              {!isMobile && (
                <Button
                  variant={viewMode === 'split' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={handleSplitMode}
                  size="small"
                >
                  分屏
                </Button>
              )}
            </Box>
            
            {/* 在小屏幕上换行 */}
            {isSmallScreen && <Box sx={{ width: '100%' }} />}
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {!isSmallScreen && (
                <FormControlLabel
                  control={<Switch checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />}
                  label="自动保存"
                  sx={{ mr: 1 }}
                />
              )}
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleCopy}
                startIcon={<ContentCopyIcon />}
                size="small"
              >
                复制
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleDownload}
                startIcon={<CloudDownloadIcon />}
                size="small"
              >
                下载
              </Button>
              {!isSmallScreen && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={handleClear}
                  startIcon={<DeleteIcon />}
                  size="small"
                >
                  清空
                </Button>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Markdown工具栏 */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 0.5 }}>
            {/* 移动端工具栏展开/收起按钮 */}
            {isMobile && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  格式化工具
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setToolbarExpanded(!toolbarExpanded)}
                >
                  {toolbarExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            )}
            
            <Collapse in={toolbarExpanded}>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                alignItems: 'center',
                gap: isMobile ? 0.5 : 0,
                p: isMobile ? 1 : 0
              }}>
                {/* 标题下拉菜单按钮 */}
                <Tooltip title="标题">
                  <IconButton 
                    onClick={handleHeadingClick}
                    size="small"
                    aria-controls={headingMenuOpen ? 'heading-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={headingMenuOpen ? 'true' : undefined}
                  >
                    <TitleIcon fontSize="small" />
                    <ArrowDropDownIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                {/* 标题下拉菜单 */}
                <Menu
                  id="heading-menu"
                  anchorEl={headingAnchorEl}
                  open={headingMenuOpen}
                  onClose={handleHeadingMenuClose}
                  MenuListProps={{
                    'aria-labelledby': 'heading-button',
                  }}
                >
                  <MenuItem onClick={() => handleHeadingSelect(1)}>
                    <ListItemIcon>
                      <LooksOneIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>一级标题</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleHeadingSelect(2)}>
                    <ListItemIcon>
                      <LooksTwoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>二级标题</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleHeadingSelect(3)}>
                    <ListItemIcon>
                      <Looks3Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>三级标题</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleHeadingSelect(4)}>
                    <ListItemIcon>
                      <Looks4Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>四级标题</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleHeadingSelect(5)}>
                    <ListItemIcon>
                      <Looks5Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>五级标题</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleHeadingSelect(6)}>
                    <ListItemIcon>
                      <Looks6Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>六级标题</ListItemText>
                  </MenuItem>
                </Menu>
                
                <Tooltip title="粗体">
                  <IconButton onClick={handleBold} size="small">
                    <FormatBoldIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="斜体">
                  <IconButton onClick={handleItalic} size="small">
                    <FormatItalicIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="删除线">
                  <IconButton onClick={handleStrikethrough} size="small">
                    <FormatStrikethroughIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                {!isSmallScreen && <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />}
                
                <Tooltip title="链接">
                  <IconButton onClick={handleLink} size="small">
                    <LinkIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="图片">
                  <IconButton onClick={handleImage} size="small">
                    <ImageIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                {!isSmallScreen && <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />}
                
                <Tooltip title="无序列表">
                  <IconButton onClick={handleBulletList} size="small">
                    <FormatListBulletedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="有序列表">
                  <IconButton onClick={handleNumberedList} size="small">
                    <FormatListNumberedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="任务列表">
                  <IconButton onClick={handleTaskList} size="small">
                    <CheckBoxOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                {!isSmallScreen && <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />}
                
                <Tooltip title="引用">
                  <IconButton onClick={handleQuote} size="small">
                    <FormatQuoteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="行内代码">
                  <IconButton onClick={handleInlineCode} size="small">
                    <CodeIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="代码块">
                  <IconButton onClick={handleCodeBlock} size="small">
                    <IntegrationInstructionsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="表格">
                  <IconButton onClick={handleTable} size="small">
                    <TableChartIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                {!isSmallScreen && <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />}
                
                <Tooltip title="帮助">
                  <IconButton onClick={handleHelp} size="small">
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Collapse>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ minHeight: isSmallScreen ? '50vh' : '60vh', position: 'relative' }}>
            {/* 编辑模式 */}
            {viewMode === 'edit' && (
              <TextField
                label="Markdown 内容"
                multiline
                fullWidth
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                variant="outlined"
                sx={{ minHeight: isSmallScreen ? '50vh' : '60vh' }}
                InputProps={{
                  sx: { 
                    fontFamily: 'monospace',
                    fontSize: isSmallScreen ? '14px' : '16px',
                    minHeight: isSmallScreen ? '50vh' : '60vh',
                    '& .MuiInputBase-input': { 
                      minHeight: isSmallScreen ? '50vh' : '60vh'
                    }
                  }
                }}
                inputRef={textFieldRef}
              />
            )}
            
            {/* 预览模式 */}
            {viewMode === 'preview' && (
              <Paper elevation={1} sx={{ 
                p: isSmallScreen ? 2 : 3, 
                minHeight: isSmallScreen ? '50vh' : '60vh',
                overflow: 'auto'
              }}>
                <Preview markdown={markdown} />
              </Paper>
            )}
            
            {/* 分屏模式（仅桌面端） */}
            {viewMode === 'split' && !isMobile && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Markdown 内容"
                    multiline
                    fullWidth
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    variant="outlined"
                    sx={{ minHeight: '60vh' }}
                    InputProps={{
                      sx: { 
                        fontFamily: 'monospace',
                        minHeight: '60vh',
                        '& .MuiInputBase-input': { 
                          minHeight: '60vh' 
                        }
                      }
                    }}
                    inputRef={textFieldRef}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 3, minHeight: '60vh', overflow: 'auto' }}>
                    <Preview markdown={markdown} />
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* 移动端悬浮快速操作按钮 */}
            {isMobile && viewMode === 'edit' && (
              <SpeedDial
                ariaLabel="快速格式化"
                sx={{ position: 'absolute', bottom: 16, right: 16 }}
                icon={<SpeedDialIcon />}
                direction="up"
              >
                {speedDialActions.map((action) => (
                  <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={action.onClick}
                  />
                ))}
              </SpeedDial>
            )}
          </Box>
        </Grid>
      </Grid>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 