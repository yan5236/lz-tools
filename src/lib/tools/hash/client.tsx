'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  Paper,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplayIcon from '@mui/icons-material/Replay';
import SecurityIcon from '@mui/icons-material/Security';

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [algorithm, setAlgorithm] = useState('md5');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isFile, setIsFile] = useState(false);
  const [fileName, setFileName] = useState('');

  // 处理算法改变
  const handleAlgorithmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAlgorithm(event.target.value);
    if (input) {
      generateHash(input, event.target.value);
    }
  };

  // 处理输入改变
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInput(value);
    if (value) {
      generateHash(value, algorithm);
    } else {
      setOutput('');
    }
  };

  // 生成哈希
  const generateHash = async (text: string, algo: string) => {
    try {
      // 如果是空字符串，直接返回
      if (!text.trim()) {
        setOutput('');
        return;
      }

      // 将文本编码为 UTF-8
      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      // 使用 Web Crypto API 计算哈希
      let hashBuffer: ArrayBuffer | null = null;
      
      switch (algo) {
        case 'md5':
          // Web Crypto API 不直接支持 MD5，简化实现使用自定义方法
          setOutput('MD5 计算中...');
          // 注意：浏览器的 Web Crypto API 不直接支持 MD5
          // 在实际应用中应该使用第三方库如 CryptoJS
          setOutput('暂不支持MD5，未集成第三方库');
          break;
        case 'sha-1':
          hashBuffer = await crypto.subtle.digest('SHA-1', data);
          break;
        case 'sha-256':
          hashBuffer = await crypto.subtle.digest('SHA-256', data);
          break;
        case 'sha-384':
          hashBuffer = await crypto.subtle.digest('SHA-384', data);
          break;
        case 'sha-512':
          hashBuffer = await crypto.subtle.digest('SHA-512', data);
          break;
        default:
          setOutput('不支持的哈希算法');
          return;
      }

      if (algo !== 'md5' && hashBuffer) {
        // 将哈希值转换为十六进制字符串
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setOutput(hashHex);
      }
    } catch (error) {
      console.error('生成哈希时出错:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('生成哈希时发生错误');
      setSnackbarOpen(true);
    }
  };

  // 文件处理
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsFile(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          setInput(content.substring(0, 1000) + (content.length > 1000 ? '...(文件内容已截断)' : ''));
          generateHashFromFile(content, algorithm);
        } else if (content) {
          // 处理二进制数据
          const buffer = content as ArrayBuffer;
          try {
            let hashBuffer: ArrayBuffer | null = null;
            
            switch (algorithm) {
              case 'md5':
                setOutput('MD5 计算中...');
                setOutput('暂不支持MD5，未集成第三方库');
                break;
              case 'sha-1':
                hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
                break;
              case 'sha-256':
                hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
                break;
              case 'sha-384':
                hashBuffer = await crypto.subtle.digest('SHA-384', buffer);
                break;
              case 'sha-512':
                hashBuffer = await crypto.subtle.digest('SHA-512', buffer);
                break;
              default:
                setOutput('不支持的哈希算法');
                return;
            }

            if (algorithm !== 'md5' && hashBuffer) {
              const hashArray = Array.from(new Uint8Array(hashBuffer));
              const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
              setOutput(hashHex);
            }
          } catch (error) {
            console.error('处理文件时出错:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('处理文件时发生错误');
            setSnackbarOpen(true);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // 从文件生成哈希
  const generateHashFromFile = async (content: string, algo: string) => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);

      let hashBuffer: ArrayBuffer | null = null;
      
      switch (algo) {
        case 'md5':
          setOutput('暂不支持MD5，未集成第三方库');
          break;
        case 'sha-1':
          hashBuffer = await crypto.subtle.digest('SHA-1', data);
          break;
        case 'sha-256':
          hashBuffer = await crypto.subtle.digest('SHA-256', data);
          break;
        case 'sha-384':
          hashBuffer = await crypto.subtle.digest('SHA-384', data);
          break;
        case 'sha-512':
          hashBuffer = await crypto.subtle.digest('SHA-512', data);
          break;
        default:
          setOutput('不支持的哈希算法');
          return;
      }

      if (algo !== 'md5' && hashBuffer) {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setOutput(hashHex);
      }
    } catch (error) {
      console.error('生成哈希时出错:', error);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output).then(
      () => {
        setSnackbarSeverity('success');
        setSnackbarMessage('哈希值已复制到剪贴板');
        setSnackbarOpen(true);
      },
      () => {
        setSnackbarSeverity('error');
        setSnackbarMessage('复制失败，请手动复制');
        setSnackbarOpen(true);
      }
    );
  };

  // 清除输入和输出
  const clearFields = () => {
    setInput('');
    setOutput('');
    setIsFile(false);
    setFileName('');
  };

  // 处理文件上传按钮点击
  const handleFileButtonClick = () => {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="primary" /> 哈希生成器
            </Typography>
            <Typography variant="body2" color="text.secondary">
              使用不同算法为文本或文件生成安全的哈希值。哈希是将数据映射为固定长度值的过程，通常用于验证数据完整性。
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          {/* 选择算法 */}
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">哈希算法</FormLabel>
            <RadioGroup
              row
              name="algorithm"
              value={algorithm}
              onChange={handleAlgorithmChange}
            >
              <FormControlLabel value="md5" control={<Radio />} label="MD5 (不推荐)" />
              <FormControlLabel value="sha-1" control={<Radio />} label="SHA-1" />
              <FormControlLabel value="sha-256" control={<Radio />} label="SHA-256" />
              <FormControlLabel value="sha-384" control={<Radio />} label="SHA-384" />
              <FormControlLabel value="sha-512" control={<Radio />} label="SHA-512" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          {/* 隐藏的文件输入 */}
          <input
            type="file"
            id="file-input"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          
          {/* 文件处理UI */}
          {isFile ? (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">已选择文件: {fileName}</Typography>
                <Button 
                  color="error" 
                  variant="outlined"
                  size="small" 
                  startIcon={<DeleteIcon />}
                  onClick={clearFields}
                >
                  移除文件
                </Button>
              </Box>
            </Paper>
          ) : (
            <TextField
              label="输入文本"
              multiline
              rows={6}
              value={input}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              placeholder="输入要生成哈希值的文本"
            />
          )}
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {!isFile && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => generateHash(input, algorithm)}
                disabled={!input}
              >
                计算哈希
              </Button>
            )}
            <Button 
              variant="outlined" 
              onClick={handleFileButtonClick}
              disabled={isFile}
            >
              选择文件
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={clearFields}
              startIcon={<DeleteIcon />}
              sx={{ ml: 'auto' }}
              disabled={!input && !output && !isFile}
            >
              清空
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ position: 'relative' }}>
            <TextField
              label="哈希结果"
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
                onClick={copyToClipboard}
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
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 