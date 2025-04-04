'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Button, Grid, Paper, Typography, Snackbar, Alert, FormControlLabel, Switch, TextField, IconButton, Divider, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
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
import dynamic from 'next/dynamic';

// 完全客户端渲染的预览组件
const Preview = dynamic(
  () => import('./preview').then(mod => mod.default),
  { ssr: false }
);

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState<string>('# Markdown编辑器\n\n欢迎使用LZ小工具的Markdown编辑器!\n\n## 功能介绍\n\n- 实时预览\n- 导出为.md文件\n- 复制Markdown内容\n- 自动保存到本地存储\n\n```js\n// 示例代码\nfunction greeting() {\n  console.log("Hello, Markdown!");\n}\n```\n\n> 提示：可以使用工具栏进行快速格式化');
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  
  // 标题菜单状态
  const [headingAnchorEl, setHeadingAnchorEl] = useState<null | HTMLElement>(null);
  const headingMenuOpen = Boolean(headingAnchorEl);

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
  const handleSplitMode = () => setViewMode('split');

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

  // 标题菜单处理
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

  const handleBold = () => insertText('**', '**');
  const handleItalic = () => insertText('*', '*');
  const handleStrikethrough = () => insertText('~~', '~~');
  
  const handleLink = () => {
    const url = prompt('请输入链接URL:', 'https://');
    if (url) {
      const textField = textFieldRef.current;
      if (!textField) return;
      
      const start = textField.selectionStart;
      const end = textField.selectionEnd;
      const selectedText = markdown.substring(start, end);
      const linkText = selectedText || '链接文本';
      
      insertText(`[${linkText}](${url})`, '');
    }
  };
  
  const handleImage = () => {
    const url = prompt('请输入图片URL:', 'https://');
    if (url) {
      const alt = prompt('请输入图片描述:', '图片描述');
      insertText(`![${alt || '图片'}](${url})`, '');
    }
  };
  
  const handleBulletList = () => insertText('- ');
  const handleNumberedList = () => insertText('1. ');
  const handleTaskList = () => insertText('- [ ] ');
  const handleQuote = () => insertText('> ');
  
  const handleCodeBlock = () => {
    const language = prompt('请输入代码语言 (如javascript, python, css等):', 'javascript');
    insertText(`\`\`\`${language || ''}\n`, '\n\`\`\`');
  };

  const handleInlineCode = () => insertText('`', '`');
  
  const handleTable = () => {
    const rows = parseInt(prompt('请输入行数:', '3') || '3');
    const cols = parseInt(prompt('请输入列数:', '3') || '3');
    
    if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
      setSnackbarMessage('无效的行数或列数');
      setSnackbarOpen(true);
      return;
    }
    
    let tableText = '';
    
    // 表头
    for (let c = 0; c < cols; c++) {
      tableText += '| 标题 ';
    }
    tableText += '|\n';
    
    // 分隔线
    for (let c = 0; c < cols; c++) {
      tableText += '| --- ';
    }
    tableText += '|\n';
    
    // 表格内容
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols; c++) {
        tableText += '| 内容 ';
      }
      tableText += '|\n';
    }
    
    insertText(tableText);
  };

  const handleHelp = () => {
    const helpText = `
# Markdown 快速参考

## 标题
# 一级标题
## 二级标题
### 三级标题

## 格式化
**粗体文本**
*斜体文本*
~~删除线文本~~

## 列表
- 无序列表项
- 另一个项目
  - 嵌套项目

1. 有序列表项
2. 另一个项目

- [ ] 待办事项
- [x] 已完成事项

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
`;
    
    setMarkdown(helpText);
    setSnackbarMessage('已加载Markdown快速参考指南');
    setSnackbarOpen(true);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              使用说明：在左侧编辑Markdown代码，右侧实时预览效果。支持常用的Markdown语法，如标题、列表、代码块等。
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
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
              <Button
                variant={viewMode === 'split' ? 'contained' : 'outlined'}
                color="primary"
                onClick={handleSplitMode}
                size="small"
              >
                分屏
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControlLabel
                control={<Switch checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />}
                label="自动保存"
                sx={{ mr: 1 }}
              />
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
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleClear}
                startIcon={<DeleteIcon />}
                size="small"
              >
                清空
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Markdown工具栏 */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 0.5 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
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
              
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              
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
              
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              
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
              
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              
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
              
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              
              <Tooltip title="帮助">
                <IconButton onClick={handleHelp} size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ minHeight: '60vh' }}>
            {/* 编辑模式 */}
            {viewMode === 'edit' && (
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
            )}
            
            {/* 预览模式 */}
            {viewMode === 'preview' && (
              <Paper elevation={1} sx={{ p: 3, minHeight: '60vh' }}>
                <Preview markdown={markdown} />
              </Paper>
            )}
            
            {/* 分屏模式 */}
            {viewMode === 'split' && (
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
                  <Paper elevation={1} sx={{ p: 3, minHeight: '60vh' }}>
                    <Preview markdown={markdown} />
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        </Grid>
      </Grid>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 