import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

export default function DateCalculator() {
  const [baseDate, setBaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [addValue, setAddValue] = useState<number>(0);
  const [addUnit, setAddUnit] = useState<string>('days');
  const [addResult, setAddResult] = useState<string>('');

  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [diffResult, setDiffResult] = useState<any>(null);

  const [birthDate, setBirthDate] = useState<string>('');
  const [ageResult, setAgeResult] = useState<any>(null);

  const [history, setHistory] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // 从localStorage加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('dateCalculatorHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
      } catch (error) {
        console.error('加载计算历史失败:', error);
      }
    }
  }, []);

  // 实时更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // 每秒更新一次

    return () => clearInterval(timer);
  }, []);

  // 保存历史记录到localStorage
  const saveHistoryToLocal = useCallback((newHistory: string[]) => {
    try {
      localStorage.setItem('dateCalculatorHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('保存计算历史失败:', error);
    }
  }, []);

  const addToHistory = useCallback((entry: string) => {
    const newHistory = [entry, ...history.slice(0, 9)];
    setHistory(newHistory);
    saveHistoryToLocal(newHistory);
  }, [history, saveHistoryToLocal]);

  const calculateDateAdd = useCallback(() => {
    if (!baseDate || addValue === 0) return;

    const result = new Date(baseDate);
    
    switch (addUnit) {
      case 'years':
        result.setFullYear(result.getFullYear() + addValue);
        break;
      case 'months':
        result.setMonth(result.getMonth() + addValue);
        break;
      case 'days':
        result.setDate(result.getDate() + addValue);
        break;
      case 'hours':
        result.setHours(result.getHours() + addValue);
        break;
      case 'minutes':
        result.setMinutes(result.getMinutes() + addValue);
        break;
      case 'seconds':
        result.setSeconds(result.getSeconds() + addValue);
        break;
    }

    setAddResult(result.toLocaleDateString());
    
    const operation = addValue > 0 ? '加上' : '减去';
    const unitNames = {
      years: '年',
      months: '月',
      days: '天',
      hours: '小时',
      minutes: '分钟',
      seconds: '秒'
    };
    
    addToHistory(`${new Date(baseDate).toLocaleDateString()} ${operation} ${Math.abs(addValue)} ${unitNames[addUnit as keyof typeof unitNames]} = ${result.toLocaleDateString()}`);
  }, [baseDate, addValue, addUnit, addToHistory]);

  const calculateDateDiff = useCallback(() => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const diffMs = Math.abs(end.getTime() - start.getTime());
    
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    const result = {
      totalDays,
      totalHours,
      totalMinutes
    };

    setDiffResult(result);
    
    addToHistory(`${start.toLocaleDateString()} 到 ${end.toLocaleDateString()} 相差 ${totalDays} 天`);
  }, [startDate, endDate, addToHistory]);

  const calculateAge = useCallback(() => {
    if (!birthDate) return;

    const today = new Date();
    const birth = new Date(birthDate);
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

    const result = {
      years,
      months,
      days,
      totalDays
    };

    setAgeResult(result);
    
    addToHistory(`出生日期 ${birth.toLocaleDateString()}，现在 ${years} 岁 ${months} 个月 ${days} 天`);
  }, [birthDate, addToHistory]);

  const getCurrentTimeInfo = useCallback(() => {
    const timestamp = currentTime.getTime();
    const iso = currentTime.toISOString();
    const locale = currentTime.toLocaleString('zh-CN');
    
    return {
      timestamp,
      iso,
      locale,
      year: currentTime.getFullYear(),
      month: currentTime.getMonth() + 1,
      date: currentTime.getDate(),
      day: currentTime.getDay()
    };
  }, [currentTime]);

  const timeInfo = getCurrentTimeInfo();
  const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              当前时间信息
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">本地时间</Typography>
                <Typography variant="body1" fontFamily="monospace">{timeInfo.locale}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">时间戳</Typography>
                <Typography variant="body1" fontFamily="monospace">{timeInfo.timestamp}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">ISO格式</Typography>
                <Typography variant="body1" fontFamily="monospace" sx={{ fontSize: '0.8rem' }}>{timeInfo.iso}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">星期</Typography>
                <Typography variant="body1">{dayNames[timeInfo.day]}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              日期加减计算
            </Typography>
            
            <TextField
              fullWidth
              label="基准日期"
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="数值"
                  type="number"
                  value={addValue}
                  onChange={(e) => setAddValue(Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>单位</InputLabel>
                  <Select
                    value={addUnit}
                    label="单位"
                    onChange={(e) => setAddUnit(e.target.value)}
                  >
                    <MenuItem value="years">年</MenuItem>
                    <MenuItem value="months">月</MenuItem>
                    <MenuItem value="days">天</MenuItem>
                    <MenuItem value="hours">小时</MenuItem>
                    <MenuItem value="minutes">分钟</MenuItem>
                    <MenuItem value="seconds">秒</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Button
              fullWidth
              variant="contained"
              onClick={calculateDateAdd}
              sx={{ mb: 2 }}
            >
              计算
            </Button>
            
            {addResult && (
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">结果</Typography>
                <Typography variant="h6">{addResult}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              日期差计算
            </Typography>
            
            <TextField
              fullWidth
              label="开始日期"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="结束日期"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Button
              fullWidth
              variant="contained"
              onClick={calculateDateDiff}
              sx={{ mb: 2 }}
            >
              计算差值
            </Button>
            
            {diffResult && (
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>时间差</Typography>
                <Typography variant="body2">
                  总计：{diffResult.totalDays} 天
                </Typography>
                <Typography variant="body2">
                  总计：{diffResult.totalHours.toLocaleString()} 小时
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              年龄计算
            </Typography>
            
            <TextField
              fullWidth
              label="出生日期"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Button
              fullWidth
              variant="contained"
              onClick={calculateAge}
              sx={{ mb: 2 }}
            >
              计算年龄
            </Button>
            
            {ageResult && (
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>年龄</Typography>
                <Typography variant="h6">
                  {ageResult.years} 岁 {ageResult.months} 个月 {ageResult.days} 天
                </Typography>
                <Typography variant="body2">
                  总计：{ageResult.totalDays} 天
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              计算历史
            </Typography>
            {history.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                暂无计算记录
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {history.map((entry, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      py: 1,
                      borderBottom: index < history.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    {entry}
                  </Typography>
                ))}
              </Box>
            )}
            {history.length > 0 && (
              <Button
                size="small"
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem('dateCalculatorHistory');
                }}
                sx={{ mt: 1 }}
              >
                清除历史
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 