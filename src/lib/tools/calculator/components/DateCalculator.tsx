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
  MenuItem,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

export default function DateCalculator() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().add(30, 'day'));
  const [addSubtractDate, setAddSubtractDate] = useState<Dayjs | null>(dayjs());
  const [addSubtractValue, setAddSubtractValue] = useState<number>(30);
  const [addSubtractUnit, setAddSubtractUnit] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [birthDate, setBirthDate] = useState<Dayjs | null>(dayjs().subtract(25, 'year'));
  
  const calculateDateDifference = useCallback(() => {
    if (!startDate || !endDate) return null;
    
    const diffInDays = endDate.diff(startDate, 'day');
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = endDate.diff(startDate, 'month');
    const diffInYears = endDate.diff(startDate, 'year');
    
    return {
      days: Math.abs(diffInDays),
      weeks: Math.abs(diffInWeeks),
      months: Math.abs(diffInMonths),
      years: Math.abs(diffInYears),
      isNegative: diffInDays < 0
    };
  }, [startDate, endDate]);

  const calculateAddSubtract = useCallback(() => {
    if (!addSubtractDate) return null;
    
    const result = operation === 'add' 
      ? addSubtractDate.add(addSubtractValue, addSubtractUnit)
      : addSubtractDate.subtract(addSubtractValue, addSubtractUnit);
    
    return result;
  }, [addSubtractDate, addSubtractValue, addSubtractUnit, operation]);

  const getAgeInfo = useCallback((birthDate: Dayjs) => {
    const now = dayjs();
    const years = now.diff(birthDate, 'year');
    const months = now.diff(birthDate.add(years, 'year'), 'month');
    const days = now.diff(birthDate.add(years, 'year').add(months, 'month'), 'day');
    
    const totalDays = now.diff(birthDate, 'day');
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = now.diff(birthDate, 'month');
    
    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths
    };
  }, []);

  const difference = calculateDateDifference();
  const addSubtractResult = calculateAddSubtract();
  const ageInfo = birthDate ? getAgeInfo(birthDate) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
      <Box sx={{ maxWidth: isMobile ? '100%' : 1000, mx: 'auto' }}>
        <Grid container spacing={isSmallScreen ? 1 : 2}>
          {/* 日期差值计算 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ p: isSmallScreen ? 1.5 : 2 }}>
                <Typography variant={isSmallScreen ? "subtitle1" : "h6"} gutterBottom>
                  日期差值计算
                </Typography>
                
                <Stack spacing={isSmallScreen ? 1.5 : 2}>
                  <DatePicker
                    label="开始日期"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: isSmallScreen ? 'small' : 'medium'
                      }
                    }}
                  />
                  
                  <DatePicker
                    label="结束日期"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: isSmallScreen ? 'small' : 'medium'
                      }
                    }}
                  />
                  
                  {difference && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant={isSmallScreen ? "body2" : "subtitle2"} gutterBottom>
                        {difference.isNegative ? '结束日期早于开始日期' : '时间差值'}:
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6} sm={3}>
                          <Paper sx={{ p: 1, textAlign: 'center' }}>
                            <Typography variant={isSmallScreen ? "caption" : "body2"} color="textSecondary">
                              天数
                            </Typography>
                            <Typography variant={isSmallScreen ? "body2" : "h6"}>
                              {difference.days}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Paper sx={{ p: 1, textAlign: 'center' }}>
                            <Typography variant={isSmallScreen ? "caption" : "body2"} color="textSecondary">
                              周数
                            </Typography>
                            <Typography variant={isSmallScreen ? "body2" : "h6"}>
                              {difference.weeks}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Paper sx={{ p: 1, textAlign: 'center' }}>
                            <Typography variant={isSmallScreen ? "caption" : "body2"} color="textSecondary">
                              月数
                            </Typography>
                            <Typography variant={isSmallScreen ? "body2" : "h6"}>
                              {difference.months}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Paper sx={{ p: 1, textAlign: 'center' }}>
                            <Typography variant={isSmallScreen ? "caption" : "body2"} color="textSecondary">
                              年数
                            </Typography>
                            <Typography variant={isSmallScreen ? "body2" : "h6"}>
                              {difference.years}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* 日期加减计算 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ p: isSmallScreen ? 1.5 : 2 }}>
                <Typography variant={isSmallScreen ? "subtitle1" : "h6"} gutterBottom>
                  日期加减计算
                </Typography>
                
                <Stack spacing={isSmallScreen ? 1.5 : 2}>
                  <DatePicker
                    label="基准日期"
                    value={addSubtractDate}
                    onChange={setAddSubtractDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: isSmallScreen ? 'small' : 'medium'
                      }
                    }}
                  />
                  
                  <Stack direction={isSmallScreen ? "column" : "row"} spacing={1}>
                    <FormControl size={isSmallScreen ? 'small' : 'medium'} sx={{ minWidth: 80 }}>
                      <InputLabel>操作</InputLabel>
                      <Select
                        value={operation}
                        label="操作"
                        onChange={(e) => setOperation(e.target.value as 'add' | 'subtract')}
                      >
                        <MenuItem value="add">加上</MenuItem>
                        <MenuItem value="subtract">减去</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <TextField
                      label="数值"
                      type="number"
                      value={addSubtractValue}
                      onChange={(e) => setAddSubtractValue(Number(e.target.value))}
                      size={isSmallScreen ? 'small' : 'medium'}
                      sx={{ flexGrow: 1 }}
                    />
                    
                    <FormControl size={isSmallScreen ? 'small' : 'medium'} sx={{ minWidth: 80 }}>
                      <InputLabel>单位</InputLabel>
                      <Select
                        value={addSubtractUnit}
                        label="单位"
                        onChange={(e) => setAddSubtractUnit(e.target.value as 'day' | 'week' | 'month' | 'year')}
                      >
                        <MenuItem value="day">天</MenuItem>
                        <MenuItem value="week">周</MenuItem>
                        <MenuItem value="month">月</MenuItem>
                        <MenuItem value="year">年</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                  
                  {addSubtractResult && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant={isSmallScreen ? "body2" : "subtitle2"} gutterBottom>
                        计算结果:
                      </Typography>
                      <Paper sx={{ p: isSmallScreen ? 1.5 : 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                        <Typography variant={isSmallScreen ? "body1" : "h6"}>
                          {addSubtractResult.format('YYYY年MM月DD日 dddd')}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* 年龄计算 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ p: isSmallScreen ? 1.5 : 2 }}>
                <Typography variant={isSmallScreen ? "subtitle1" : "h6"} gutterBottom>
                  年龄计算器
                </Typography>
                
                <Stack spacing={isSmallScreen ? 1.5 : 2}>
                  <DatePicker
                    label="出生日期"
                    value={birthDate}
                    onChange={setBirthDate}
                    maxDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: isSmallScreen ? 'small' : 'medium',
                        helperText: '请选择您的出生日期'
                      }
                    }}
                  />
                  
                  {ageInfo && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant={isSmallScreen ? "body2" : "subtitle2"} gutterBottom>
                        您的年龄信息:
                      </Typography>
                      
                      {/* 精确年龄显示 */}
                      <Paper sx={{ 
                        p: isSmallScreen ? 1.5 : 2, 
                        mb: 2, 
                        textAlign: 'center',
                        bgcolor: 'primary.light'
                      }}>
                        <Typography variant={isSmallScreen ? "h6" : "h5"} color="primary.contrastText">
                          {ageInfo.years}岁 {ageInfo.months}个月 {ageInfo.days}天
                        </Typography>
                        <Typography variant="caption" color="primary.contrastText">
                          精确年龄
                        </Typography>
                      </Paper>
                      
                      {/* 其他统计信息 */}
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 1, textAlign: 'center' }}>
                            <Typography variant={isSmallScreen ? "caption" : "body2"} color="textSecondary">
                              总天数
                            </Typography>
                            <Typography variant={isSmallScreen ? "body2" : "h6"}>
                              {ageInfo.totalDays.toLocaleString()}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 1, textAlign: 'center' }}>
                            <Typography variant={isSmallScreen ? "caption" : "body2"} color="textSecondary">
                              总周数
                            </Typography>
                            <Typography variant={isSmallScreen ? "body2" : "h6"}>
                              {ageInfo.totalWeeks.toLocaleString()}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 1, textAlign: 'center' }}>
                            <Typography variant={isSmallScreen ? "caption" : "body2"} color="textSecondary">
                              总月数
                            </Typography>
                            <Typography variant={isSmallScreen ? "body2" : "h6"}>
                              {ageInfo.totalMonths}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 1, textAlign: 'center' }}>
                            <Typography variant={isSmallScreen ? "caption" : "body2"} color="textSecondary">
                              生日
                            </Typography>
                            <Typography variant={isSmallScreen ? "body2" : "h6"}>
                              {birthDate?.format('MM-DD')}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                      
                      {/* 下次生日倒计时 */}
                      {(() => {
                        if (!birthDate) return null;
                        const today = dayjs();
                        const thisYearBirthday = birthDate.year(today.year());
                        const nextBirthday = thisYearBirthday.isBefore(today) 
                          ? thisYearBirthday.add(1, 'year') 
                          : thisYearBirthday;
                        const daysUntilBirthday = nextBirthday.diff(today, 'day');
                        
                        return (
                          <Paper sx={{ 
                            p: isSmallScreen ? 1 : 1.5, 
                            mt: 1, 
                            textAlign: 'center',
                            bgcolor: 'secondary.light'
                          }}>
                            <Typography variant={isSmallScreen ? "caption" : "body2"} color="secondary.contrastText">
                              距离下次生日还有
                            </Typography>
                            <Typography variant={isSmallScreen ? "body1" : "h6"} color="secondary.contrastText">
                              {daysUntilBirthday === 0 ? '今天就是生日！🎉' : `${daysUntilBirthday} 天`}
                            </Typography>
                            <Typography variant="caption" color="secondary.contrastText">
                              {nextBirthday.format('YYYY年MM月DD日')}
                            </Typography>
                          </Paper>
                        );
                      })()}
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>


        </Grid>
      </Box>
    </LocalizationProvider>
  );
} 