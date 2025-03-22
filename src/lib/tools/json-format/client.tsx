'use client';

import { useState } from 'react';
import { Box, TextField, Button, Grid, Paper, Typography, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [indentLevel, setIndentLevel] = useState('2');

  // 处理格式化
  const handleFormat = () => {
    if (!input.trim()) {
      setError('请输入JSON数据');
      return;
    }

    try {
      // 解析JSON
      const parsedJson = JSON.parse(input);
      // 格式化并设置缩进
      const formattedJson = JSON.stringify(parsedJson, null, Number(indentLevel));
      setOutput(formattedJson);
      setError(null);
    } catch (e) {
      if (e instanceof Error) {
        setError(`JSON解析错误: ${e.message}`);
      } else {
        setError('未知错误');
      }
      setOutput('');
    }
  };

  // 处理压缩
  const handleMinify = () => {
    if (!input.trim()) {
      setError('请输入JSON数据');
      return;
    }

    try {
      // 解析JSON
      const parsedJson = JSON.parse(input);
      // 压缩为单行
      const minifiedJson = JSON.stringify(parsedJson);
      setOutput(minifiedJson);
      setError(null);
    } catch (e) {
      if (e instanceof Error) {
        setError(`JSON解析错误: ${e.message}`);
      } else {
        setError('未知错误');
      }
      setOutput('');
    }
  };

  // 处理复制到剪贴板
  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output)
        .then(() => {
          setSnackbarOpen(true);
        })
        .catch(err => {
          console.error('复制失败:', err);
        });
    }
  };

  // 处理清空
  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  // 处理缩进级别变化
  const handleIndentChange = (event: SelectChangeEvent) => {
    setIndentLevel(event.target.value);
  };

  // 修复引号转义问题
  const InfoBlock = () => (
    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
      <strong>提示：</strong> 
      <br />
      将JSON字符串粘贴到左侧文本框中，点击&quot;格式化&quot;按钮将其格式化。
      <br />
      您也可以点击&quot;压缩&quot;按钮将格式化的JSON压缩为单行。
      <br />
      支持对象、数组和基本数据类型的格式化。
    </Typography>
  );

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              使用说明：输入JSON数据，点击"格式化"按钮进行格式化或"压缩"按钮进行压缩。
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="输入JSON数据"
            multiline
            rows={8}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder='{
  "示例": "请输入您的JSON数据"
}'
            error={!!error}
            helperText={error}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleFormat}
            >
              格式化
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleMinify}
            >
              压缩
            </Button>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="indent-level-label">缩进空格</InputLabel>
              <Select
                labelId="indent-level-label"
                value={indentLevel}
                label="缩进空格"
                onChange={handleIndentChange}
                size="small"
              >
                <MenuItem value="2">2 空格</MenuItem>
                <MenuItem value="4">4 空格</MenuItem>
                <MenuItem value="8">8 空格</MenuItem>
              </Select>
            </FormControl>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleClear}
              startIcon={<DeleteIcon />}
              sx={{ ml: 'auto' }}
            >
              清空
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ position: 'relative' }}>
            <TextField
              label="输出结果"
              multiline
              rows={8}
              value={output}
              fullWidth
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
            />
            {output && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopy}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                }}
              >
                复制
              </Button>
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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          已复制到剪贴板
        </Alert>
      </Snackbar>
    </Box>
  );
} 