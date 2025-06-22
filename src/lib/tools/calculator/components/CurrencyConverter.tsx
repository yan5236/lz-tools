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
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
  Stack
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('CNY');
  const [result, setResult] = useState<number | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [rate, setRate] = useState<number | null>(null);

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
  const currencies: { [key: string]: { name: string; symbol: string; flag: string } } = {
    'USD': { name: '美元', symbol: '$', flag: '🇺🇸' },
    'EUR': { name: '欧元', symbol: '€', flag: '🇪🇺' },
    'GBP': { name: '英镑', symbol: '£', flag: '🇬🇧' },
    'JPY': { name: '日元', symbol: '¥', flag: '🇯🇵' },
    'CNY': { name: '人民币', symbol: '¥', flag: '🇨🇳' },
    'KRW': { name: '韩元', symbol: '₩', flag: '🇰🇷' },
    'HKD': { name: '港币', symbol: 'HK$', flag: '🇭🇰' },
    'AUD': { name: '澳元', symbol: 'A$', flag: '🇦🇺' },
    'CAD': { name: '加元', symbol: 'C$', flag: '🇨🇦' },
    'CHF': { name: '瑞士法郎', symbol: 'Fr', flag: '🇨🇭' },
    'SGD': { name: '新加坡元', symbol: 'S$', flag: '🇸🇬' },
    'NZD': { name: '新西兰元', symbol: 'NZ$', flag: '🇳🇿' }
  };

  // 获取汇率数据
  const fetchExchangeRates = useCallback(async (baseCurrency: string = 'USD') => {
    setLoading(true);
    setError('');
    
    try {
      // 使用frankfurter.dev获取基础汇率数据（免费无限制）
      const response = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);
      
      if (!response.ok) {
        throw new Error('获取汇率数据失败');
      }
      
      const data = await response.json();
      
      // 添加基础货币的汇率（自己对自己是1）
      const rates = { ...data.rates, [baseCurrency]: 1 };
      
      setExchangeRates(rates);
      setLastUpdated(new Date(data.date));
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取汇率数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化加载汇率数据
  useEffect(() => {
    fetchExchangeRates('USD');
  }, [fetchExchangeRates]);

  // 计算汇率转换
  const convertCurrency = useCallback(async () => {
    if (!amount || !fromCurrency || !toCurrency) {
      setResult(null);
      setRate(null);
      return;
    }

    if (fromCurrency === toCurrency) {
      setResult(amount);
      setRate(1);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 使用免费的frankfurter.dev API（无限制，无需API密钥）
      const response = await fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`);
      
      if (!response.ok) {
        throw new Error('获取汇率失败');
      }

      const data = await response.json();
      const exchangeRate = data.rates[toCurrency];
      
      if (!exchangeRate) {
        throw new Error('不支持的货币对');
      }

      const convertedAmount = amount * exchangeRate;
      setResult(convertedAmount);
      setRate(exchangeRate);
      
      // 添加到历史记录
      const fromCurrencyInfo = currencies[fromCurrency];
      const toCurrencyInfo = currencies[toCurrency];
      
      const formatNumber = (num: number) => {
        if (num === 0) return '0';
        if (Math.abs(num) >= 1000000) return num.toExponential(3);
        if (Math.abs(num) >= 1) return num.toFixed(2).replace(/\.?0+$/, '');
        return num.toFixed(4).replace(/\.?0+$/, '');
      };
      
      const historyEntry = `${formatNumber(amount)} ${fromCurrencyInfo?.name || fromCurrency} = ${formatNumber(convertedAmount)} ${toCurrencyInfo?.name || toCurrency}`;
      
      if (!history.includes(historyEntry)) {
        const newHistory = [historyEntry, ...history.slice(0, 9)];
        setHistory(newHistory);
        saveHistoryToLocal(newHistory);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '转换失败');
      setResult(null);
      setRate(null);
    } finally {
      setLoading(false);
    }
  }, [amount, fromCurrency, toCurrency, currencies, history, saveHistoryToLocal]);

  // 交换货币
  const swapCurrencies = useCallback(() => {
    const tempFrom = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tempFrom);
  }, [fromCurrency, toCurrency]);

  // 获取缓存的汇率数据
  const cachedRates = exchangeRates;

  return (
    <Box sx={{ maxWidth: isMobile ? '100%' : 1000, mx: 'auto' }}>
      <Typography variant={isSmallScreen ? "h6" : "h5"} gutterBottom align="center">
        汇率转换器
      </Typography>

      <Grid container spacing={isSmallScreen ? 1 : 2}>
        {/* 主要转换器 */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: isSmallScreen ? 1.5 : 2 }}>
              <Typography variant={isSmallScreen ? "subtitle1" : "h6"} gutterBottom>
                货币转换
              </Typography>

              <Stack spacing={isSmallScreen ? 1.5 : 2}>
                {/* 输入金额 */}
                <TextField
                  fullWidth
                  label="金额"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  size={isSmallScreen ? 'small' : 'medium'}
                />

                {/* 从货币选择 */}
                <FormControl fullWidth size={isSmallScreen ? 'small' : 'medium'}>
                  <InputLabel>从货币</InputLabel>
                  <Select
                    value={fromCurrency}
                    label="从货币"
                    onChange={(e) => setFromCurrency(e.target.value)}
                  >
                    {Object.entries(currencies).map(([code, info]) => (
                      <MenuItem key={code} value={code}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{info.flag}</span>
                          <span>{code}</span>
                          <span style={{ fontSize: isSmallScreen ? '0.8rem' : '0.9rem', color: 'text.secondary' }}>
                            - {info.name}
                          </span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 交换按钮 */}
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={swapCurrencies}
                    size={isSmallScreen ? 'small' : 'medium'}
                    sx={{ minWidth: isSmallScreen ? 60 : 80 }}
                  >
                    ⇄
                  </Button>
                </Box>

                {/* 到货币选择 */}
                <FormControl fullWidth size={isSmallScreen ? 'small' : 'medium'}>
                  <InputLabel>到货币</InputLabel>
                  <Select
                    value={toCurrency}
                    label="到货币"
                    onChange={(e) => setToCurrency(e.target.value)}
                  >
                    {Object.entries(currencies).map(([code, info]) => (
                      <MenuItem key={code} value={code}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{info.flag}</span>
                          <span>{code}</span>
                          <span style={{ fontSize: isSmallScreen ? '0.8rem' : '0.9rem', color: 'text.secondary' }}>
                            - {info.name}
                          </span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 转换按钮 */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={convertCurrency}
                  disabled={loading || !amount || fromCurrency === toCurrency}
                  fullWidth={isMobile}
                  size={isSmallScreen ? 'small' : 'medium'}
                  startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                  {loading ? '转换中...' : '转换货币'}
                </Button>

                {/* 错误提示 */}
                {error && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                  </Alert>
                )}

                {/* 结果显示 */}
                {result !== null && !error && (
                  <Box sx={{ 
                    p: isSmallScreen ? 1.5 : 2, 
                    bgcolor: 'success.light', 
                    borderRadius: 1, 
                    textAlign: 'center' 
                  }}>
                    <Typography variant={isSmallScreen ? "h5" : "h4"} color="success.contrastText">
                      {result.toFixed(2)}
                    </Typography>
                    <Typography variant={isSmallScreen ? "body2" : "body1"} color="success.contrastText">
                      {currencies[toCurrency]?.name} ({toCurrency})
                    </Typography>
                    {rate && (
                      <Typography variant="caption" color="success.contrastText" sx={{ display: 'block', mt: 1 }}>
                        汇率: 1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                      </Typography>
                    )}
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 历史记录和汇率信息 */}
        <Grid item xs={12} md={4}>
          <Stack spacing={isSmallScreen ? 1 : 2}>
            {/* 转换历史 */}
            <Card>
              <CardContent sx={{ p: isSmallScreen ? 1.5 : 2 }}>
                <Typography variant={isSmallScreen ? "subtitle1" : "h6"} gutterBottom>
                  转换历史
                </Typography>
                {history.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    暂无转换记录
                  </Typography>
                ) : (
                  <Box sx={{ maxHeight: isMobile ? 150 : 200, overflow: 'auto' }}>
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
                      localStorage.removeItem('currencyConverterHistory');
                    }}
                    sx={{ mt: 1 }}
                    fullWidth={isMobile}
                  >
                    清除历史
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 常用汇率 */}
            <Card>
              <CardContent sx={{ p: isSmallScreen ? 1.5 : 2 }}>
                <Typography variant={isSmallScreen ? "subtitle1" : "h6"} gutterBottom>
                  常用汇率 (相对 USD)
                </Typography>
                <Stack spacing={0.5}>
                  {['CNY', 'EUR', 'GBP', 'JPY', 'KRW'].map((currency) => (
                    <Box key={currency} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 0.5,
                      borderRadius: 1,
                      bgcolor: 'background.default'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{currencies[currency]?.flag}</span>
                        <Typography variant={isSmallScreen ? "caption" : "body2"}>
                          {currency}
                        </Typography>
                      </Box>
                      <Typography variant={isSmallScreen ? "caption" : "body2"} color="text.secondary">
                        {cachedRates[currency] ? cachedRates[currency].toFixed(4) : '-'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  最后更新: {lastUpdated ? lastUpdated.toLocaleString() : '未更新'}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* 快捷转换按钮 */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: isSmallScreen ? 1.5 : 2 }}>
              <Typography variant={isSmallScreen ? "subtitle1" : "h6"} gutterBottom>
                快捷转换
              </Typography>
              <Grid container spacing={1}>
                {[
                  { from: 'USD', to: 'CNY', label: '美元→人民币' },
                  { from: 'CNY', to: 'USD', label: '人民币→美元' },
                  { from: 'EUR', to: 'CNY', label: '欧元→人民币' },
                  { from: 'GBP', to: 'CNY', label: '英镑→人民币' },
                  { from: 'JPY', to: 'CNY', label: '日元→人民币' },
                  { from: 'KRW', to: 'CNY', label: '韩元→人民币' }
                ].map((preset, index) => (
                  <Grid item xs={6} sm={4} md={2} key={index}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size={isSmallScreen ? 'small' : 'medium'}
                      onClick={() => {
                        setFromCurrency(preset.from);
                        setToCurrency(preset.to);
                        setAmount(100);
                      }}
                      sx={{ 
                        fontSize: isSmallScreen ? '0.7rem' : '0.8rem',
                        p: isSmallScreen ? 0.5 : 1
                      }}
                    >
                      {preset.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
