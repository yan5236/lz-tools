'use client';

import { useState } from 'react';
import { Box, TextField, Button, Grid, Paper, Typography, Snackbar, Alert, FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

export default function Base64Converter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  // 处理模式切换
  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.value as 'encode' | 'decode');
    // 清空输出，保留输入
    setOutput('');
    setError(null);
  };

  // 处理编码/解码
  const handleConvert = () => {
    if (!input.trim()) {
      setError('请输入需要处理的内容');
      return;
    }

    try {
      if (mode === 'encode') {
        // 编码: 文本 -> Base64
        const encoded = btoa(encodeURIComponent(input));
        setOutput(encoded);
        setError(null);
      } else {
        // 解码: Base64 -> 文本
        try {
          const decoded = decodeURIComponent(atob(input.trim()));
          setOutput(decoded);
          setError(null);
        } catch (e) {
          setError('解码失败，请确保输入的是有效的Base64字符串');
          setOutput('');
        }
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(`处理过程出现错误: ${e.message}`);
      } else {
        setError('未知错误，请检查输入内容');
      }
      setOutput('');
    }
  };

  // 交换输入和输出
  const handleSwap = () => {
    // 交换输入和输出的内容
    const temp = input;
    setInput(output);
    setOutput(temp);
    // 同时切换模式
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setError(null);
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

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              使用说明：输入内容后，选择"编码"或"解码"模式，然后点击相应的按钮进行操作。
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <RadioGroup
              row
              name="mode"
              value={mode}
              onChange={handleModeChange}
            >
              <FormControlLabel value="encode" control={<Radio />} label="编码(文本 → Base64)" />
              <FormControlLabel value="decode" control={<Radio />} label="解码(Base64 → 文本)" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label={mode === 'encode' ? '输入要编码的文本' : '输入要解码的Base64字符串'}
            multiline
            rows={6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder={mode === 'encode' ? '请输入需要转换为Base64的文本内容' : '请输入需要解码的Base64字符串'}
            error={!!error}
            helperText={error}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleConvert}
            >
              {mode === 'encode' ? '编码' : '解码'}
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleSwap}
              startIcon={<SwapHorizIcon />}
              disabled={!output}
            >
              交换内容
            </Button>
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
              label={mode === 'encode' ? 'Base64编码结果' : '解码后的文本'}
              multiline
              rows={6}
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