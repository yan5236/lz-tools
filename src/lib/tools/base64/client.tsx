'use client';

import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  Typography, 
  Snackbar, 
  Alert, 
  FormControl, 
  RadioGroup, 
  FormControlLabel, 
  Radio,
  useTheme,
  useMediaQuery 
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TransformIcon from '@mui/icons-material/Transform';
import CheckIcon from '@mui/icons-material/Check';

export default function Base64Converter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copyButtonText, setCopyButtonText] = useState('复制');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 处理模式切换
  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.value as 'encode' | 'decode');
    // 清空输出，保留输入
    setOutput('');
    setError(null);
    // 重置复制按钮状态
    setCopyButtonText('复制');
  };

  // UTF-8字符串转Base64（真正的标准方式）
  const stringToBase64 = (str: string): string => {
    try {
      // 使用标准的UTF-8字节序列转Base64
      // 这是RFC 4648标准的Base64编码方式
      const utf8Bytes = new TextEncoder().encode(str);
      let binaryString = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binaryString += String.fromCharCode(utf8Bytes[i]);
      }
      return btoa(binaryString);
    } catch (error) {
      throw new Error('编码失败，请检查输入内容');
    }
  };

  // Base64转UTF-8字符串（真正的标准方式）
  const base64ToString = (base64: string): string => {
    try {
      // 首先验证Base64格式
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64.trim())) {
        throw new Error('无效的Base64格式');
      }
      
      // 使用标准的Base64解码到UTF-8字节序列
      const binaryString = atob(base64.trim());
      const utf8Bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        utf8Bytes[i] = binaryString.charCodeAt(i);
      }
      
      // 使用TextDecoder解码UTF-8字节序列
      return new TextDecoder('utf-8').decode(utf8Bytes);
    } catch (error) {
      throw new Error('解码失败，请确保输入的是有效的Base64字符串');
    }
  };

  // 处理编码/解码
  const handleConvert = () => {
    if (!input.trim()) {
      setError('请输入需要处理的内容');
      return;
    }

    try {
      if (mode === 'encode') {
        // 编码: 文本 -> Base64（使用标准方式）
        const encoded = stringToBase64(input);
        setOutput(encoded);
        setError(null);
      } else {
        // 解码: Base64 -> 文本（使用标准方式）
        try {
          const decoded = base64ToString(input.trim());
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
  const handleCopy = async () => {
    if (!output) return;
    
    setIsCopying(true);
    setCopyButtonText('复制中...');
    
    try {
      await navigator.clipboard.writeText(output);
      
      // 复制成功的反馈
      setCopySuccess(true);
      setCopyButtonText('已复制');
      setSnackbarSeverity('success');
      setSnackbarMessage('已成功复制到剪贴板');
      setSnackbarOpen(true);
      
      // 2秒后重置按钮状态
      setTimeout(() => {
        setCopySuccess(false);
        setCopyButtonText('复制');
        setIsCopying(false);
      }, 2000);
      
    } catch (err) {
      console.error('复制失败:', err);
      
      // 尝试使用旧的复制方法作为备选
      try {
        const textArea = document.createElement('textarea');
        textArea.value = output;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopySuccess(true);
          setCopyButtonText('已复制');
          setSnackbarSeverity('success');
          setSnackbarMessage('已成功复制到剪贴板');
          setSnackbarOpen(true);
          
          setTimeout(() => {
            setCopySuccess(false);
            setCopyButtonText('复制');
            setIsCopying(false);
          }, 2000);
        } else {
          throw new Error('复制命令执行失败');
        }
      } catch (fallbackErr) {
        setCopyButtonText('复制失败');
        setSnackbarSeverity('error');
        setSnackbarMessage('复制失败，请手动选择并复制文本');
        setSnackbarOpen(true);
        
        setTimeout(() => {
          setCopyButtonText('复制');
          setIsCopying(false);
        }, 2000);
      }
    }
  };

  // 处理清空
  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    // 重置复制相关状态
    setCopyButtonText('复制');
    setCopySuccess(false);
    setIsCopying(false);
  };

  return (
    <Box>
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: isMobile ? 1.5 : 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
              <TransformIcon color="primary" /> Base64 编码/解码器
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
              标准UTF-8 Base64编码解码工具，完全兼容主流Base64工具和网站。支持中文等Unicode字符的正确编码，无需额外的URL编码处理。
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset" sx={{ mb: isMobile ? 1 : 2 }}>
            <RadioGroup
              row={!isMobile}
              name="mode"
              value={mode}
              onChange={handleModeChange}
              sx={{ 
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 0.5 : 2
              }}
            >
              <FormControlLabel 
                value="encode" 
                control={<Radio size={isMobile ? 'small' : 'medium'} />} 
                label={
                  <Typography variant={isMobile ? 'body2' : 'body1'}>
                    编码 (文本 → Base64)
                  </Typography>
                } 
              />
              <FormControlLabel 
                value="decode" 
                control={<Radio size={isMobile ? 'small' : 'medium'} />} 
                label={
                  <Typography variant={isMobile ? 'body2' : 'body1'}>
                    解码 (Base64 → 文本)
                  </Typography>
                } 
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label={mode === 'encode' ? '输入要编码的文本' : '输入要解码的Base64字符串'}
            multiline
            rows={isMobile ? 4 : 6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder={mode === 'encode' ? '请输入需要转换为Base64的文本内容...' : '请输入需要解码的Base64字符串...'}
            error={!!error}
            helperText={error}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: isMobile ? '0.9rem' : '1rem',
              },
              '& .MuiInputLabel-root': {
                fontSize: isMobile ? '0.9rem' : '1rem',
              }
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1.5 : 2, 
            mb: isMobile ? 1 : 2 
          }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleConvert}
              size={isMobile ? 'medium' : 'large'}
              fullWidth={isMobile}
              sx={{ 
                minWidth: isMobile ? 'auto' : '120px',
                fontSize: isMobile ? '0.9rem' : '1rem'
              }}
            >
              {mode === 'encode' ? '编码' : '解码'}
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleSwap}
              startIcon={<SwapHorizIcon />}
              disabled={!output}
              size={isMobile ? 'medium' : 'large'}
              fullWidth={isMobile}
              sx={{ 
                minWidth: isMobile ? 'auto' : '120px',
                fontSize: isMobile ? '0.9rem' : '1rem'
              }}
            >
              交换内容
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleClear}
              startIcon={<DeleteIcon />}
              size={isMobile ? 'medium' : 'large'}
              fullWidth={isMobile}
              sx={{ 
                minWidth: isMobile ? 'auto' : '120px',
                fontSize: isMobile ? '0.9rem' : '1rem',
                ml: isMobile ? 0 : 'auto'
              }}
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
              rows={isMobile ? 4 : 6}
              value={output}
              fullWidth
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: isMobile ? '0.9rem' : '1rem',
                },
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '0.9rem' : '1rem',
                }
              }}
            />
            {output && (
              <Button
                variant="contained"
                color={copySuccess ? "success" : "primary"}
                size={isMobile ? 'small' : 'medium'}
                startIcon={copySuccess ? <CheckIcon /> : <ContentCopyIcon />}
                onClick={handleCopy}
                disabled={isCopying}
                sx={{
                  position: 'absolute',
                  right: isMobile ? 8 : 16,
                  top: isMobile ? 8 : 16,
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  minWidth: isMobile ? 'auto' : '80px',
                  px: isMobile ? 1 : 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: copySuccess ? 'none' : 'scale(1.05)',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: copySuccess ? 'success.main' : 'primary.main',
                    color: 'white',
                    opacity: copySuccess ? 1 : 0.7,
                  }
                }}
              >
                {copyButtonText}
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
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 