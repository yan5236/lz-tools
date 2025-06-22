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
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyData {
  base: string;
  date: string;
  rates: ExchangeRates;
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('CNY');
  const [result, setResult] = useState<number>(0);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [fromSelectOpen, setFromSelectOpen] = useState<boolean>(false);
  const [toSelectOpen, setToSelectOpen] = useState<boolean>(false);
  const [lastConversion, setLastConversion] = useState<string>('');

  // 从localStorage加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('currencyConverterHistory');
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
      localStorage.setItem('currencyConverterHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('保存转换历史失败:', error);
    }
  }, []);

  // 常用货币列表
  const currencies = [
    { code: 'USD', name: '美元', symbol: '$' },
    { code: 'EUR', name: '欧元', symbol: '€' },
    { code: 'GBP', name: '英镑', symbol: '£' },
    { code: 'JPY', name: '日元', symbol: '¥' },
    { code: 'CNY', name: '人民币', symbol: '¥' },
    { code: 'KRW', name: '韩元', symbol: '₩' },
    { code: 'HKD', name: '港币', symbol: 'HK$' },
    { code: 'AUD', name: '澳元', symbol: 'A$' },
    { code: 'CAD', name: '加元', symbol: 'C$' },
    { code: 'CHF', name: '瑞士法郎', symbol: 'Fr' },
    { code: 'SGD', name: '新加坡元', symbol: 'S$' },
    { code: 'NZD', name: '新西兰元', symbol: 'NZ$' }
  ];

  // 获取汇率数据
  const fetchExchangeRates = useCallback(async (baseCurrency: string = 'EUR') => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${baseCurrency}`);
      
      if (!response.ok) {
        throw new Error('获取汇率数据失败');
      }
      
      const data: CurrencyData = await response.json();
      
      // 添加基础货币的汇率（自己对自己是1）
      const rates = { ...data.rates, [baseCurrency]: 1 };
      
      setExchangeRates(rates);
      setLastUpdated(data.date);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取汇率数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化加载汇率数据
  useEffect(() => {
    fetchExchangeRates('EUR');
  }, [fetchExchangeRates]);

  // 计算汇率转换（只计算，不添加历史记录）
  const calculateConversion = useCallback(() => {
    if (!amount || !fromCurrency || !toCurrency || Object.keys(exchangeRates).length === 0) {
      setResult(0);
      return;
    }

    // 如果基础货币不是EUR，需要先转换为EUR再转换为目标货币
    let convertedAmount: number;
    
    if (fromCurrency === 'EUR') {
      // 从EUR转换
      convertedAmount = amount * (exchangeRates[toCurrency] || 1);
    } else if (toCurrency === 'EUR') {
      // 转换为EUR
      convertedAmount = amount / (exchangeRates[fromCurrency] || 1);
    } else {
      // 两种非EUR货币之间转换：先转为EUR，再转为目标货币
      const eurAmount = amount / (exchangeRates[fromCurrency] || 1);
      convertedAmount = eurAmount * (exchangeRates[toCurrency] || 1);
    }

    setResult(convertedAmount);
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  // 自动计算
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateConversion();
    }, 100); // 添加小延迟避免频繁计算

    return () => clearTimeout(timer);
  }, [calculateConversion]);

  // 手动添加到历史记录
  const addToHistory = useCallback(() => {
    if (!amount || !fromCurrency || !toCurrency || result <= 0) return;

    const fromCurrencyInfo = currencies.find(c => c.code === fromCurrency);
    const toCurrencyInfo = currencies.find(c => c.code === toCurrency);
    
    // 智能格式化数字显示
    const formatNumber = (num: number) => {
      if (num === 0) return '0';
      if (Math.abs(num) >= 1000000) return num.toExponential(3);
      if (Math.abs(num) >= 1) return num.toFixed(2).replace(/\.?0+$/, '');
      return num.toFixed(4).replace(/\.?0+$/, '');
    };
    
    const historyEntry = `${formatNumber(amount)} ${fromCurrencyInfo?.name || fromCurrency} = ${formatNumber(result)} ${toCurrencyInfo?.name || toCurrency}`;
    
    // 避免重复添加相同的转换记录
    if (historyEntry !== lastConversion && !history.includes(historyEntry)) {
      const newHistory = [historyEntry, ...history.slice(0, 9)];
      setHistory(newHistory);
      saveHistoryToLocal(newHistory);
      setLastConversion(historyEntry);
    }
  }, [amount, fromCurrency, toCurrency, result, currencies, history, lastConversion, saveHistoryToLocal]);

  // 交换货币
  const swapCurrencies = useCallback(() => {
    // 先添加当前转换到历史记录
    addToHistory();
    
    const tempFrom = fromCurrency;
    const tempTo = toCurrency;
    setFromCurrency(tempTo);
    setToCurrency(tempFrom);
    // 关闭所有选择框
    setFromSelectOpen(false);
    setToSelectOpen(false);
  }, [fromCurrency, toCurrency, addToHistory]);

  // 获取汇率
  const getExchangeRate = useCallback(() => {
    if (!fromCurrency || !toCurrency || Object.keys(exchangeRates).length === 0) {
      return 0;
    }

    if (fromCurrency === toCurrency) {
      return 1;
    }

    if (fromCurrency === 'EUR') {
      return exchangeRates[toCurrency] || 1;
    } else if (toCurrency === 'EUR') {
      return 1 / (exchangeRates[fromCurrency] || 1);
    } else {
      const eurRate = 1 / (exchangeRates[fromCurrency] || 1);
      return eurRate * (exchangeRates[toCurrency] || 1);
    }
  }, [fromCurrency, toCurrency, exchangeRates]);

  // 处理源货币选择
  const handleFromCurrencyChange = useCallback((value: string) => {
    setFromCurrency(value);
    setFromSelectOpen(false);
  }, []);

  // 处理目标货币选择
  const handleToCurrencyChange = useCallback((value: string) => {
    setToCurrency(value);
    setToSelectOpen(false);
  }, []);

  // 快速选择目标货币
  const handleQuickSelectCurrency = useCallback((currencyCode: string) => {
    setToCurrency(currencyCode);
    setToSelectOpen(false);
  }, []);

  const exchangeRate = getExchangeRate();

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom align="center">
        汇率转换器
      </Typography>

      <Grid container spacing={3}>
        {/* 主转换器 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
                <Button size="small" onClick={() => fetchExchangeRates('EUR')} sx={{ ml: 1 }}>
                  重试
                </Button>
              </Alert>
            )}

            <Grid container spacing={2} alignItems="center">
              {/* 金额输入 */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="金额"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  inputProps={{ step: 'any', min: 0 }}
                />
              </Grid>

              {/* 源货币 */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>从</InputLabel>
                  <Select
                    value={fromCurrency}
                    label="从"
                    open={fromSelectOpen}
                    onOpen={() => setFromSelectOpen(true)}
                    onClose={() => setFromSelectOpen(false)}
                    onChange={(e) => handleFromCurrencyChange(e.target.value)}
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* 交换按钮 */}
              <Grid item xs={12} sm={12} md={2} sx={{ textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={swapCurrencies}
                  disabled={loading}
                  sx={{ minWidth: 80 }}
                >
                  ⇄
                </Button>
              </Grid>

              {/* 目标货币 */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>到</InputLabel>
                  <Select
                    value={toCurrency}
                    label="到"
                    open={toSelectOpen}
                    onOpen={() => setToSelectOpen(true)}
                    onClose={() => setToSelectOpen(false)}
                    onChange={(e) => handleToCurrencyChange(e.target.value)}
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* 结果显示 */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1, textAlign: 'center' }}>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Typography variant="h4" color="primary.contrastText">
                    {(() => {
                      if (result === 0) return '0';
                      if (Math.abs(result) >= 1000000) return result.toExponential(3);
                      if (Math.abs(result) >= 1) return result.toFixed(2).replace(/\.?0+$/, '');
                      return result.toFixed(4).replace(/\.?0+$/, '');
                    })()}
                  </Typography>
                  <Typography variant="body2" color="primary.contrastText">
                    {currencies.find(c => c.code === toCurrency)?.name || toCurrency}
                  </Typography>
                </>
              )}
            </Box>

            {/* 添加到历史按钮 */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={addToHistory}
                disabled={!amount || fromCurrency === toCurrency || result <= 0 || loading}
                sx={{ minWidth: 120 }}
              >
                添加到历史
              </Button>
            </Box>

            {/* 汇率信息 */}
            {!loading && exchangeRate > 0 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  汇率：1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
                </Typography>
                {lastUpdated && (
                  <Typography variant="caption" color="text.secondary">
                    数据更新时间：{lastUpdated}
                  </Typography>
                )}
              </Box>
            )}

            {/* 刷新按钮 */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => fetchExchangeRates('EUR')}
                disabled={loading}
                size="small"
              >
                {loading ? <CircularProgress size={16} /> : '刷新汇率'}
              </Button>
            </Box>

            {/* 常用货币快捷选择 */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom>
                快速选择目标货币：
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {currencies.slice(0, 8).map((currency) => (
                  <Chip
                    key={currency.code}
                    label={`${currency.symbol} ${currency.code}`}
                    onClick={() => handleQuickSelectCurrency(currency.code)}
                    variant={toCurrency === currency.code ? 'filled' : 'outlined'}
                    size="small"
                    disabled={loading}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* 历史记录 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              转换历史
            </Typography>
            {history.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                暂无转换记录
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
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
                      fontSize: '0.8rem'
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
                  setLastConversion('');
                  localStorage.removeItem('currencyConverterHistory');
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
