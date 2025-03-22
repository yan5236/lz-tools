'use client';

import { useState, useRef } from 'react';
import { Box, TextField, Button, Grid, Paper, Typography, Snackbar, Alert, FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

export default function UrlEncoder() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodeMode, setEncodeMode] = useState<'normal' | 'component'>('normal');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 处理模式切换
  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.value as 'encode' | 'decode');
    setOutputText('');
    setError(null);
  };

  // 处理编码模式切换
  const handleEncodeModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEncodeMode(event.target.value as 'normal' | 'component');
    setOutputText('');
    setError(null);
  };

  // 处理编码/解码
  const handleConvert = () => {
    if (!inputText.trim()) {
      setError('请输入需要处理的内容');
      return;
    }

    try {
      if (mode === 'encode') {
        // URL编码
        if (encodeMode === 'normal') {
          // 普通编码 - encodeURI
          setOutputText(encodeURI(inputText));
        } else {
          // 组件编码 - encodeURIComponent
          setOutputText(encodeURIComponent(inputText));
        }
        setError(null);
      } else {
        // URL解码
        try {
          if (encodeMode === 'normal') {
            // 普通解码 - decodeURI
            setOutputText(decodeURI(inputText));
          } else {
            // 组件解码 - decodeURIComponent
            setOutputText(decodeURIComponent(inputText));
          }
          setError(null);
        } catch (e) {
          setError('解码失败，请确保输入的是有效的URL编码字符串');
          setOutputText('');
        }
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(`处理过程出现错误: ${e.message}`);
      } else {
        setError('未知错误，请检查输入内容');
      }
      setOutputText('');
    }
  };

  // 处理复制到剪贴板
  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText)
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
    setInputText('');
    setOutputText('');
    setError(null);
  };

  // 处理文本变化 - 修复
  const handleTextChange = (_e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 只更新输入文本，不进行自动编码
    if (inputRef.current) {
      const value = inputRef.current.value;
      setInputText(value);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              使用说明：选择编码或解码模式，输入内容后点击按钮进行操作。URL完整编码适用于整个URL，组件编码适用于URL的参数部分。
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <FormControl component="fieldset">
              <RadioGroup
                row
                name="mode"
                value={mode}
                onChange={handleModeChange}
              >
                <FormControlLabel value="encode" control={<Radio />} label="编码" />
                <FormControlLabel value="decode" control={<Radio />} label="解码" />
              </RadioGroup>
            </FormControl>
            
            <FormControl component="fieldset">
              <RadioGroup
                row
                name="encodeMode"
                value={encodeMode}
                onChange={handleEncodeModeChange}
              >
                <FormControlLabel value="normal" control={<Radio />} label="URL完整编码" />
                <FormControlLabel value="component" control={<Radio />} label="URL组件编码" />
              </RadioGroup>
            </FormControl>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label={mode === 'encode' ? '输入要编码的文本' : '输入要解码的URL字符串'}
            multiline
            rows={6}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            inputRef={inputRef}
            fullWidth
            variant="outlined"
            placeholder={mode === 'encode' ? '请输入需要URL编码的文本' : '请输入需要解码的URL编码字符串'}
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
              label={mode === 'encode' ? 'URL编码结果' : '解码后的文本'}
              multiline
              rows={6}
              value={outputText}
              fullWidth
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
            />
            {outputText && (
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