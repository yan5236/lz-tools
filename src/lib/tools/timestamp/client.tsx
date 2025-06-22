'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Stack, useTheme, useMediaQuery, Chip, Divider, InputAdornment, IconButton } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';

// 设置dayjs为中文
dayjs.locale('zh-cn');

export default function TimestampConverter() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(currentTime.getTime() / 1000));
  const [inputTimestamp, setInputTimestamp] = useState('');
  const [inputDateTime, setInputDateTime] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState<Dayjs | null>(null);
  const [useTextInput, setUseTextInput] = useState(false);
  const [convertedDateTime, setConvertedDateTime] = useState('');
  const [convertedTimestamp, setConvertedTimestamp] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [timeFormat, setTimeFormat] = useState('ISO');
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      // 同步更新日期选择器
      setSelectedDateTime(dayjs(ts * 1000));
      setError(null);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('转换失败，请检查输入');
      }
    }
  };

  // 处理日期时间转时间戳（文本输入）
  const handleDateTimeToTimestamp = () => {
    if (!inputDateTime && !selectedDateTime) {
      setError('请输入日期时间或使用日期选择器');
      return;
    }
    
    try {
      let ts: number;
      
      if (useTextInput && inputDateTime) {
        // 使用文本输入
        ts = dateTimeToTimestamp(inputDateTime);
      } else if (selectedDateTime) {
        // 使用日期选择器
        ts = Math.floor(selectedDateTime.valueOf() / 1000);
        // 同步更新文本输入
        setInputDateTime(timestampToDateTime(ts));
      } else {
        throw new Error('请选择有效的日期时间');
      }
      
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

  // 处理日期选择器变化
  const handleDateTimePickerChange = (newValue: Dayjs | null) => {
    setSelectedDateTime(newValue);
    if (newValue) {
      const ts = Math.floor(newValue.valueOf() / 1000);
      const dateTimeValue = timestampToDateTime(ts);
      setInputDateTime(dateTimeValue);
      setError(null);
    }
  };

  // 处理文本输入变化
  const handleTextInputChange = (value: string) => {
    setInputDateTime(value);
    // 尝试同步到日期选择器
    if (value) {
      try {
        const ts = dateTimeToTimestamp(value);
        setSelectedDateTime(dayjs(ts * 1000));
      } catch (e) {
        // 忽略解析错误，保持用户输入
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
    setSelectedDateTime(dayjs(now));
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
          const newDateTime = timestampToDateTime(ts);
          setConvertedDateTime(newDateTime);
          setInputDateTime(newDateTime);
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
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch(err => {
        console.error('复制失败:', err);
        setSnackbarMessage('复制失败，请手动复制');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
      <Box>
        <Stack spacing={isMobile ? 2 : 3}>
          {/* 使用说明 */}
          <Paper elevation={0} sx={{ 
            p: isMobile ? 2 : 3, 
            bgcolor: 'background.default', 
            borderRadius: 2 
          }}>
            <Typography 
              variant={isMobile ? "body2" : "subtitle2"} 
              gutterBottom
              sx={{ lineHeight: 1.5 }}
            >
              使用说明：时间戳转换工具支持Unix时间戳与可读日期时间格式的互相转换。支持日期选择器和文本输入两种方式。
            </Typography>
          </Paper>
          
          {/* 当前时间戳 */}
          <Paper elevation={1} sx={{ 
            p: isMobile ? 2 : 3, 
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText'
          }}>
            <Stack spacing={2}>
              <Typography variant={isMobile ? "subtitle2" : "subtitle1"} fontWeight="bold">
                当前时间戳
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                flexWrap: isMobile ? 'wrap' : 'nowrap'
              }}>
                <Chip 
                  label={currentTimestamp}
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'inherit',
                    '& .MuiChip-label': {
                      px: 2
                    }
                  }}
                />
                <Stack direction={isMobile ? "column" : "row"} spacing={1} sx={{ minWidth: 0 }}>
                  <Button 
                    size="small" 
                    variant="contained"
                    color="secondary"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => copyResult(currentTimestamp.toString(), '当前时间戳已复制到剪贴板')}
                    sx={{ minWidth: isMobile ? '100%' : 'auto' }}
                  >
                    复制
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={useCurrentTimestamp}
                    sx={{ 
                      minWidth: isMobile ? '100%' : 'auto',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      color: 'inherit',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.8)',
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    使用当前时间
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Paper>
          
          {/* 转换区域 */}
          <Grid container spacing={isMobile ? 2 : 3}>
            {/* 时间戳转日期时间 */}
            <Grid item xs={12} lg={6}>
              <Paper elevation={1} sx={{ 
                p: isMobile ? 2 : 3, 
                borderRadius: 2,
                height: '100%'
              }}>
                <Stack spacing={2}>
                  <Typography variant="h6" gutterBottom>
                    时间戳 → 日期时间
                  </Typography>
                  
                  <TextField
                    label="Unix时间戳（秒）"
                    value={inputTimestamp}
                    onChange={(e) => setInputTimestamp(e.target.value)}
                    fullWidth
                    variant="outlined"
                    placeholder="例如：1609459200"
                    error={!!error && !inputDateTime}
                    helperText={!!error && !inputDateTime ? error : ''}
                    size={isMobile ? "medium" : "medium"}
                  />
                  
                  <Stack 
                    direction={isMobile ? "column" : "row"} 
                    spacing={2} 
                    alignItems={isMobile ? "stretch" : "flex-end"}
                  >
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleTimestampToDateTime}
                      sx={{ 
                        minWidth: isMobile ? '100%' : 'auto',
                        order: isMobile ? 2 : 1
                      }}
                    >
                      转换为日期时间
                    </Button>
                    
                    <FormControl 
                      sx={{ 
                        minWidth: isMobile ? '100%' : 200,
                        order: isMobile ? 1 : 2
                      }}
                    >
                      <InputLabel id="time-format-label">日期时间格式</InputLabel>
                      <Select
                        labelId="time-format-label"
                        value={timeFormat}
                        label="日期时间格式"
                        onChange={handleFormatChange}
                        size={isMobile ? "medium" : "medium"}
                      >
                        <MenuItem value="ISO">ISO (2021-01-01T00:00:00.000Z)</MenuItem>
                        <MenuItem value="Local">本地 (2021-01-01 08:00:00)</MenuItem>
                        <MenuItem value="UTC">UTC (2021-01-01 00:00:00 UTC)</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
            
            {/* 日期时间转时间戳 */}
            <Grid item xs={12} lg={6}>
              <Paper elevation={1} sx={{ 
                p: isMobile ? 2 : 3, 
                borderRadius: 2,
                height: '100%'
              }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" gutterBottom>
                      日期时间 → 时间戳
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={useTextInput ? <CalendarTodayIcon /> : <EditIcon />}
                      onClick={() => setUseTextInput(!useTextInput)}
                      sx={{ mb: 1 }}
                    >
                      {useTextInput ? '日期选择器' : '文本输入'}
                    </Button>
                  </Box>
                  
                  {!useTextInput ? (
                    // 日期时间选择器
                    <DateTimePicker
                      label="选择日期时间"
                      value={selectedDateTime}
                      onChange={handleDateTimePickerChange}
                      format="YYYY-MM-DD HH:mm:ss"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          size: isMobile ? "medium" : "medium",
                          error: !!error && !!inputDateTime,
                          helperText: !!error && !!inputDateTime ? error : '点击选择日期和时间'
                        }
                      }}
                    />
                  ) : (
                    // 文本输入
                    <TextField
                      label="日期时间"
                      value={inputDateTime}
                      onChange={(e) => handleTextInputChange(e.target.value)}
                      fullWidth
                      variant="outlined"
                      placeholder={`例如：${timestampToDateTime(currentTimestamp)}`}
                      error={!!error && !!inputDateTime}
                      helperText={!!error && !!inputDateTime ? error : '支持多种日期时间格式'}
                      size={isMobile ? "medium" : "medium"}
                      multiline={isMobile}
                      rows={isMobile ? 2 : 1}
                    />
                  )}
                  
                  <Stack 
                    direction={isMobile ? "column" : "row"} 
                    spacing={2} 
                    justifyContent="space-between"
                  >
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleDateTimeToTimestamp}
                      sx={{ minWidth: isMobile ? '100%' : 'auto' }}
                    >
                      转换为时间戳
                    </Button>
                    
                    <Button 
                      variant="outlined"
                      startIcon={<SwapVertIcon />}
                      onClick={() => {
                        if (inputTimestamp && (inputDateTime || selectedDateTime)) {
                          handleDateTimeToTimestamp();
                        } else if (inputTimestamp) {
                          handleTimestampToDateTime();
                        }
                      }}
                      sx={{ minWidth: isMobile ? '100%' : 'auto' }}
                    >
                      反向转换
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
          
          {/* 转换结果 */}
          <Paper elevation={1} sx={{ 
            p: isMobile ? 2 : 3, 
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              转换结果
            </Typography>
            
            <Grid container spacing={isMobile ? 2 : 3}>
              {/* 时间戳结果 */}
              <Grid item xs={12} sm={6}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'background.default', 
                    borderRadius: 1,
                    position: 'relative',
                    minHeight: isMobile ? 120 : 100
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                      时间戳
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        wordBreak: 'break-all',
                        fontSize: isMobile ? '0.875rem' : '1rem',
                        lineHeight: 1.4,
                        pr: isMobile ? 0 : 6
                      }}
                    >
                      {inputTimestamp || '-'}
                    </Typography>
                    {inputTimestamp && (
                      <Button 
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => copyResult(inputTimestamp, '时间戳已复制到剪贴板')}
                        sx={{ 
                          position: isMobile ? 'static' : 'absolute',
                          top: isMobile ? 'auto' : 8,
                          right: isMobile ? 'auto' : 8,
                          alignSelf: isMobile ? 'flex-start' : 'auto',
                          mt: isMobile ? 1 : 0
                        }}
                      >
                        复制
                      </Button>
                    )}
                  </Stack>
                </Paper>
              </Grid>
              
              {/* 日期时间结果 */}
              <Grid item xs={12} sm={6}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'background.default', 
                    borderRadius: 1,
                    position: 'relative',
                    minHeight: isMobile ? 120 : 100
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                      日期时间
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        wordBreak: 'break-all',
                        fontSize: isMobile ? '0.875rem' : '1rem',
                        lineHeight: 1.4,
                        pr: isMobile ? 0 : 6
                      }}
                    >
                      {inputDateTime || '-'}
                    </Typography>
                    {inputDateTime && (
                      <Button 
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => copyResult(inputDateTime, '日期时间已复制到剪贴板')}
                        sx={{ 
                          position: isMobile ? 'static' : 'absolute',
                          top: isMobile ? 'auto' : 8,
                          right: isMobile ? 'auto' : 8,
                          alignSelf: isMobile ? 'flex-start' : 'auto',
                          mt: isMobile ? 1 : 0
                        }}
                      >
                        复制
                      </Button>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Stack>

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
    </LocalizationProvider>
  );
} 