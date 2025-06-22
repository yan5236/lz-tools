import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';

// 1. 将常量数据移到组件外部
// 这样它只会被创建一次，而不是在每次渲染时都创建
const unitCategories = {
  length: {
    name: '长度',
    units: {
      mm: { name: '毫米', factor: 0.001 },
      cm: { name: '厘米', factor: 0.01 },
      m: { name: '米', factor: 1 },
      km: { name: '千米', factor: 1000 },
      inch: { name: '英寸', factor: 0.0254 },
      ft: { name: '英尺', factor: 0.3048 }
    }
  },
  weight: {
    name: '重量',
    units: {
      g: { name: '克', factor: 0.001 },
      kg: { name: '千克', factor: 1 },
      ton: { name: '吨', factor: 1000 },
      lb: { name: '磅', factor: 0.453592 }
    }
  },
  temperature: {
    name: '温度',
    units: {
      celsius: { name: '摄氏度', factor: 1 },
      fahrenheit: { name: '华氏度', factor: 1 },
      kelvin: { name: '开尔文', factor: 1 }
    }
  },
  volume: {
    name: '容量',
    units: {
      ml: { name: '毫升', factor: 0.001 },
      l: { name: '升', factor: 1 },
      gallon: { name: '加仑', factor: 3.78541 }
    }
  }
};
const categoryKeys = Object.keys(unitCategories);


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function UnitConverter() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [inputValue, setInputValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<string>('');
  const [toUnit, setToUnit] = useState<string>('');
  const [result, setResult] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [lastConversion, setLastConversion] = useState<string>('');

  // 从localStorage加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('unitConverterHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
      } catch (error) {
        console.error('加载转换历史失败:', error);
      }
    }
  }, []);

  // 保存历史记录到localStorage
  const saveHistoryToLocal = useCallback((newHistory: string[]) => {
    try {
      localStorage.setItem('unitConverterHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('保存转换历史失败:', error);
    }
  }, []);

  // 添加历史记录的统一函数
  const addToHistory = useCallback((entry: string) => {
    // 避免重复添加相同的转换记录
    if (entry !== lastConversion && !history.includes(entry)) {
      const newHistory = [entry, ...history.slice(0, 9)];
      setHistory(newHistory);
      saveHistoryToLocal(newHistory);
      setLastConversion(entry);
    }
  }, [history, saveHistoryToLocal, lastConversion]);

  // 使用 useMemo 派生当前类别和单位，确保引用稳定
  const currentCategoryKey = useMemo(() => categoryKeys[tabValue], [tabValue]);
  const currentCategoryData = useMemo(() => unitCategories[currentCategoryKey as keyof typeof unitCategories], [currentCategoryKey]);
  const currentUnits = useMemo(() => currentCategoryData.units || {}, [currentCategoryData]);

  // 2. 修正 useEffect 依赖项
  // 这个 effect 的意图是当用户切换Tab（类别）时，重置单位选择。
  // 因此，它只应该依赖于 `tabValue` (或派生出的 `currentUnits`)。
  // 因为 currentUnits 现在是 memoized 的，它只会在 tabValue 改变时改变，所以这个 hook 现在可以正常工作了。
  // 我们可以将依赖项简化为 `[currentCategoryKey]` 或 `[tabValue]`，更清晰地表达意图。
  useEffect(() => {
    const unitKeys = Object.keys(currentUnits);
    if (unitKeys.length > 0) {
      const firstUnit = unitKeys[0];
      const secondUnit = unitKeys[1] || firstUnit;
      setFromUnit(firstUnit);
      setToUnit(secondUnit);
    }
  }, [currentCategoryKey, currentUnits]); // 依赖于类别 key

  // 3. 修正 convertValue 的 useCallback 依赖项
  // 之前的 [] 是错误的，因为它在闭包中使用了 unitCategories。
  // 但因为我们把 unitCategories 移到了外部，它成了不变量，所以空数组 [] 现在是安全的。
  const convertValue = useCallback((value: number, from: string, to: string, categoryKey: string) => {
    if (!value || !from || !to) return 0;
    
    // 确保我们从正确的常量中获取数据
    const categoryData = unitCategories[categoryKey as keyof typeof unitCategories];
    if (!categoryData) return 0;

    if (categoryKey === 'temperature') {
      if (from === to) return value;
      if (from === 'celsius' && to === 'fahrenheit') return (value * 9/5) + 32;
      if (from === 'fahrenheit' && to === 'celsius') return (value - 32) * 5/9;
      if (from === 'celsius' && to === 'kelvin') return value + 273.15;
      if (from === 'kelvin' && to === 'celsius') return value - 273.15;
      if (from === 'fahrenheit' && to === 'kelvin') return ((value - 32) * 5/9) + 273.15;
      if (from === 'kelvin' && to === 'fahrenheit') return ((value - 273.15) * 9/5) + 32;
      return value;
    }

    const fromFactor = (categoryData.units as any)[from]?.factor || 1;
    const toFactor = (categoryData.units as any)[to]?.factor || 1;
    
    return (value * fromFactor) / toFactor;
  }, []);

  // 只计算结果，不自动添加历史记录
  useEffect(() => {
    if (inputValue && fromUnit && toUnit) {
      const convertedValue = convertValue(inputValue, fromUnit, toUnit, currentCategoryKey);
      setResult(convertedValue);
    }
  }, [inputValue, fromUnit, toUnit, currentCategoryKey, convertValue]);

  // 格式化数字的辅助函数
  const formatNumber = (num: number) => {
    if (num === 0) return '0';
    if (Math.abs(num) >= 1000000 || Math.abs(num) < 0.0001) {
      return num.toExponential(3);
    }
    // 使用 toPrecision 来处理有效数字，避免过长的小数
    return parseFloat(num.toPrecision(6)).toString();
  };
  
  // 手动转换按钮，添加到历史记录
  const performConversion = useCallback(() => {
    if (inputValue && fromUnit && toUnit && fromUnit !== toUnit) {
      const convertedValue = convertValue(inputValue, fromUnit, toUnit, currentCategoryKey);
      const fromUnitName = (currentUnits as any)[fromUnit]?.name || fromUnit;
      const toUnitName = (currentUnits as any)[toUnit]?.name || toUnit;
      
      const historyEntry = `${formatNumber(inputValue)} ${fromUnitName} = ${formatNumber(convertedValue)} ${toUnitName}`;
      addToHistory(historyEntry);
    }
  }, [inputValue, fromUnit, toUnit, currentCategoryKey, convertValue, currentUnits, addToHistory]);

  const swapUnits = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }, [fromUnit, toUnit]);

  return (
    <Box sx={{ maxWidth: isMobile ? '100%' : 900, mx: 'auto' }}>
      <Typography variant={isSmallScreen ? "h6" : "h5"} gutterBottom align="center">
        单位转换器
      </Typography>

      <Paper sx={{ p: isSmallScreen ? 1.5 : 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider', 
            mb: 2,
            '& .MuiTab-root': {
              fontSize: isSmallScreen ? '0.8rem' : '0.9rem',
              minHeight: isSmallScreen ? 40 : 48
            }
          }}
        >
          {categoryKeys.map((key) => (
            <Tab 
              key={key} 
              label={unitCategories[key as keyof typeof unitCategories].name}
            />
          ))}
        </Tabs>

        {categoryKeys.map((key, index) => (
          <TabPanel key={key} value={tabValue} index={index}>
            <Grid container spacing={isSmallScreen ? 1 : 3}>
              <Grid item xs={12} md={isMobile ? 12 : 8}>
                <Stack spacing={isSmallScreen ? 1.5 : 2}>
                  <TextField
                    fullWidth
                    label="数值"
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(Number(e.target.value) || 0)}
                    size={isSmallScreen ? 'small' : 'medium'}
                  />

                  <FormControl fullWidth size={isSmallScreen ? 'small' : 'medium'}>
                    <InputLabel>从</InputLabel>
                    <Select
                      value={fromUnit}
                      label="从"
                      onChange={(e) => setFromUnit(e.target.value)}
                    >
                      {Object.entries(currentUnits).map(([unitKey, unit]) => (
                        <MenuItem key={unitKey} value={unitKey}>
                          {(unit as any).name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={swapUnits}
                      size={isSmallScreen ? 'small' : 'medium'}
                      sx={{ minWidth: isSmallScreen ? 60 : 80 }}
                    >
                      ⇄
                    </Button>
                  </Box>

                  <FormControl fullWidth size={isSmallScreen ? 'small' : 'medium'}>
                    <InputLabel>到</InputLabel>
                    <Select
                      value={toUnit}
                      label="到"
                      onChange={(e) => setToUnit(e.target.value)}
                    >
                      {Object.entries(currentUnits).map(([unitKey, unit]) => (
                        <MenuItem key={unitKey} value={unitKey}>
                          {(unit as any).name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ 
                    p: isSmallScreen ? 1.5 : 2, 
                    bgcolor: 'primary.light', 
                    borderRadius: 1, 
                    textAlign: 'center' 
                  }}>
                    <Typography variant={isSmallScreen ? "h5" : "h4"} color="primary.contrastText" sx={{wordBreak: 'break-all'}}>
                      {formatNumber(result)}
                    </Typography>
                    <Typography variant={isSmallScreen ? "body2" : "body1"} color="primary.contrastText">
                      {(currentUnits as any)[toUnit]?.name}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={performConversion}
                      disabled={!inputValue || fromUnit === toUnit}
                      size={isSmallScreen ? 'small' : 'medium'}
                      fullWidth={isMobile}
                      sx={{ minWidth: isMobile ? 'auto' : 120 }}
                    >
                      添加到历史
                    </Button>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} md={isMobile ? 12 : 4}>
                <Typography variant={isSmallScreen ? "subtitle1" : "h6"} gutterBottom>
                  转换历史
                </Typography>
                {history.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    暂无转换记录
                  </Typography>
                ) : (
                  <Box sx={{ maxHeight: isMobile ? 200 : 300, overflow: 'auto' }}>
                    {history.map((entry, index) => (
                      <Typography
                        key={index}
                        variant="body2"
                        sx={{
                          py: 1,
                          px: 1,
                          mb: 1,
                          bgcolor: 'background.default',
                          borderRadius: 1,
                          fontSize: isSmallScreen ? '0.7rem' : '0.8rem',
                          wordBreak: 'break-all'
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
                      saveHistoryToLocal([]); // Also clear from local storage
                    }}
                    sx={{ mt: 1 }}
                    fullWidth={isMobile}
                  >
                    清除历史
                  </Button>
                )}
              </Grid>
            </Grid>
          </TabPanel>
        ))}
      </Paper>
    </Box>
  );
}