'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import SwapVertIcon from '@mui/icons-material/SwapVert';

export default function TimestampConverter() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(currentTime.getTime() / 1000));
  const [inputTimestamp, setInputTimestamp] = useState('');
  const [inputDateTime, setInputDateTime] = useState('');
  const [convertedDateTime, setConvertedDateTime] = useState('');
  const [convertedTimestamp, setConvertedTimestamp] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [timeFormat, setTimeFormat] = useState('ISO');
  const [error, setError] = useState<string | null>(null);

  // 更新当前时间和时间戳
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setCurrentTimestamp(Math.floor(now.getTime() / 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // 验证日期是否有效
  const isValidDate = (date: Date): boolean => {
    return !isNaN(date.getTime());
  };

  // 将时间戳转换为日期时间字符串
  const timestampToDateTime = (ts: number) => {
    const date = new Date(ts * 1000);
    
    switch (timeFormat) {
      case 'ISO':
        return date.toISOString();
      case 'Local':
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
      case 'UTC':
        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} UTC`;
      default:
        return date.toISOString();
    }
  };

  // 将日期时间字符串转换为时间戳
  const dateTimeToTimestamp = (dt: string) => {
    let date: Date | undefined;

    // 尝试解析不同格式的日期字符串
    try {
      // 尝试ISO格式
      if (dt.includes('T') && dt.includes('Z')) {
        date = new Date(dt);
      }
      // 尝试UTC格式
      else if (dt.includes('UTC')) {
        const withoutUTC = dt.replace(' UTC', '');
        const [datePart, timePart] = withoutUTC.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute, second] = timePart.split(':').map(Number);
        date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
      }
      // 尝试本地格式
      else if (dt.includes('-') && dt.includes(':')) {
        const [datePart, timePart] = dt.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute, second] = timePart.split(':').map(Number);
        date = new Date(year, month - 1, day, hour, minute, second);
      }
      // 如果上述都失败，尝试直接解析
      else {
        date = new Date(dt);
      }

      if (!date || isNaN(date.getTime())) {
        throw new Error('无效的日期时间格式');
      }

      return Math.floor(date.getTime() / 1000);
    } catch (e) {
      throw new Error('无法解析日期时间，请确保格式正确');
    }
  };

  // 补零函数
  const pad = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  // 处理时间戳转日期时间
  const handleTimestampToDateTime = () => {
    if (!inputTimestamp) {
      setError('请输入时间戳');
      return;
    }
    
    try {
      const ts = parseInt(inputTimestamp, 10);
      if (isNaN(ts)) {
        setError('请输入有效的数字时间戳');
        return;
      }
      
      const dateTimeValue = timestampToDateTime(ts);
      setInputDateTime(dateTimeValue);
      setConvertedDateTime(dateTimeValue);
      setConvertedTimestamp(ts.toString());
      setError(null);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('转换失败，请检查输入');
      }
    }
  };

  // 处理日期时间转时间戳
  const handleDateTimeToTimestamp = () => {
    if (!inputDateTime) {
      setError('请输入日期时间');
      return;
    }
    
    try {
      const ts = dateTimeToTimestamp(inputDateTime);
      setInputTimestamp(ts.toString());
      setConvertedTimestamp(ts.toString());
      setError(null);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('转换失败，请检查输入');
      }
    }
  };

  // 使用当前时间戳
  const useCurrentTimestamp = () => {
    const now = new Date();
    setCurrentTime(now);
    setCurrentTimestamp(Math.floor(now.getTime() / 1000));
    setInputTimestamp(Math.floor(now.getTime() / 1000).toString());
    setInputDateTime(timestampToDateTime(Math.floor(now.getTime() / 1000)));
    setError(null);
  };

  // 处理时间格式变化
  const handleFormatChange = (event: SelectChangeEvent) => {
    setTimeFormat(event.target.value);
    
    // 如果已有时间戳，更新日期时间显示
    if (inputTimestamp) {
      try {
        const ts = parseInt(inputTimestamp, 10);
        if (!isNaN(ts)) {
          setConvertedDateTime(timestampToDateTime(ts));
        }
      } catch (e) {
        // 忽略转换错误
      }
    }
  };

  // 复制结果
  const copyResult = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              使用说明：时间戳转换工具支持Unix时间戳与可读日期时间格式的互相转换。
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="subtitle1">当前时间戳：</Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              {currentTimestamp}
            </Typography>
            <Button 
              size="small" 
              startIcon={<ContentCopyIcon />}
              onClick={() => copyResult(currentTimestamp.toString(), '当前时间戳已复制到剪贴板')}
            >
              复制
            </Button>
            <Button 
              size="small" 
              startIcon={<RefreshIcon />}
              onClick={useCurrentTimestamp}
            >
              使用当前时间
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>时间戳 → 日期时间</Typography>
            <TextField
              label="Unix时间戳（秒）"
              value={inputTimestamp}
              onChange={(e) => setInputTimestamp(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              placeholder="例如：1609459200"
              error={!!error && !inputDateTime}
              helperText={!!error && !inputDateTime ? error : ''}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleTimestampToDateTime}
              >
                转换为日期时间
              </Button>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="time-format-label">日期时间格式</InputLabel>
                <Select
                  labelId="time-format-label"
                  value={timeFormat}
                  label="日期时间格式"
                  onChange={handleFormatChange}
                >
                  <MenuItem value="ISO">ISO</MenuItem>
                  <MenuItem value="Local">Local</MenuItem>
                  <MenuItem value="UTC">UTC</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>日期时间 → 时间戳</Typography>
            <TextField
              label="日期时间"
              value={inputDateTime}
              onChange={(e) => setInputDateTime(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              placeholder={`例如：${timestampToDateTime(currentTimestamp)}`}
              error={!!error && !!inputDateTime}
              helperText={!!error && !!inputDateTime ? error : ''}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleDateTimeToTimestamp}
              >
                转换为时间戳
              </Button>
              <Button 
                variant="outlined"
                startIcon={<SwapVertIcon />}
                onClick={() => {
                  if (inputTimestamp && inputDateTime) {
                    handleDateTimeToTimestamp();
                  } else if (inputTimestamp) {
                    handleTimestampToDateTime();
                  }
                }}
              >
                反向转换
              </Button>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>转换结果</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, position: 'relative' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    时间戳
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {inputTimestamp || '-'}
                  </Typography>
                  {inputTimestamp && (
                    <Button 
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => copyResult(inputTimestamp, '时间戳已复制到剪贴板')}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      复制
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, position: 'relative' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    日期时间
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {inputDateTime || '-'}
                  </Typography>
                  {inputDateTime && (
                    <Button 
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => copyResult(inputDateTime, '日期时间已复制到剪贴板')}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      复制
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
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