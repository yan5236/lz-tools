import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  FormControlLabel,
  Switch
} from '@mui/material';

export default function ScientificCalculator() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [isDegree, setIsDegree] = useState(true);
  const [memory, setMemory] = useState(0);

  // 从localStorage加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('scientificCalculatorHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
      } catch (error) {
        console.error('加载计算历史失败:', error);
      }
    }
  }, []);

  // 保存历史记录到localStorage
  const saveHistoryToLocal = useCallback((newHistory: string[]) => {
    try {
      localStorage.setItem('scientificCalculatorHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('保存计算历史失败:', error);
    }
  }, []);

  const inputNumber = useCallback((num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      if (operation && previousValue !== null) {
        setExpression(`${previousValue} ${operation} ${num}`);
      } else {
        setExpression(num);
      }
      setWaitingForNewValue(false);
    } else {
      const newDisplay = display === '0' ? num : display + num;
      setDisplay(newDisplay);
      if (operation && previousValue !== null) {
        setExpression(`${previousValue} ${operation} ${newDisplay}`);
      } else {
        setExpression(newDisplay);
      }
    }
  }, [display, waitingForNewValue, operation, previousValue]);

  const inputDecimal = useCallback(() => {
    if (waitingForNewValue) {
      setDisplay('0.');
      if (operation && previousValue !== null) {
        setExpression(`${previousValue} ${operation} 0.`);
      } else {
        setExpression('0.');
      }
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      const newDisplay = display + '.';
      setDisplay(newDisplay);
      if (operation && previousValue !== null) {
        setExpression(`${previousValue} ${operation} ${newDisplay}`);
      } else {
        setExpression(newDisplay);
      }
    }
  }, [display, waitingForNewValue, operation, previousValue]);

  const clear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay('0');
    if (operation && previousValue !== null) {
      setExpression(`${previousValue} ${operation} 0`);
    } else {
      setExpression('0');
    }
  }, [operation, previousValue]);

  const backspace = useCallback(() => {
    if (display.length > 1) {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);
      if (operation && previousValue !== null) {
        setExpression(`${previousValue} ${operation} ${newDisplay}`);
      } else {
        setExpression(newDisplay);
      }
    } else {
      setDisplay('0');
      if (operation && previousValue !== null) {
        setExpression(`${previousValue} ${operation} 0`);
      } else {
        setExpression('0');
      }
    }
  }, [display, operation, previousValue]);

  const performOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setExpression(`${inputValue} ${nextOperation} `);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result: number;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        case '^':
          result = Math.pow(currentValue, inputValue);
          break;
        default:
          return;
      }

      const historyEntry = `${currentValue} ${operation} ${inputValue} = ${result}`;
      const newHistory = [historyEntry, ...history.slice(0, 9)];
      setHistory(newHistory);
      saveHistoryToLocal(newHistory);

      setDisplay(String(result));
      setExpression(`${result} ${nextOperation} `);
      setPreviousValue(result);
    } else {
      setExpression(`${inputValue} ${nextOperation} `);
      setPreviousValue(inputValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation, history, saveHistoryToLocal]);

  const calculate = useCallback(() => {
    if (operation && previousValue !== null) {
      const inputValue = parseFloat(display);
      const currentValue = previousValue;
      let result: number;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        case '^':
          result = Math.pow(currentValue, inputValue);
          break;
        default:
          return;
      }

      const fullExpression = `${currentValue} ${operation} ${inputValue} = ${result}`;
      const newHistory = [fullExpression, ...history.slice(0, 9)];
      setHistory(newHistory);
      saveHistoryToLocal(newHistory);
      
      setDisplay(String(result));
      setExpression(fullExpression);
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  }, [display, previousValue, operation, history, saveHistoryToLocal]);

  // 角度转换函数
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  const toDegrees = (radians: number) => radians * (180 / Math.PI);

  // 科学函数
  const sin = useCallback(() => {
    const value = parseFloat(display);
    const angle = isDegree ? toRadians(value) : value;
    const result = Math.sin(angle);
    const sinExpression = `sin(${value}${isDegree ? '°' : ''}) = ${result}`;
    
    setDisplay(String(result));
    setExpression(sinExpression);
    const newHistory = [sinExpression, ...history.slice(0, 9)];
    setHistory(newHistory);
    saveHistoryToLocal(newHistory);
    
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display, isDegree, history, saveHistoryToLocal]);

  const cos = useCallback(() => {
    const value = parseFloat(display);
    const angle = isDegree ? toRadians(value) : value;
    const result = Math.cos(angle);
    const cosExpression = `cos(${value}${isDegree ? '°' : ''}) = ${result}`;
    
    setDisplay(String(result));
    setExpression(cosExpression);
    const newHistory = [cosExpression, ...history.slice(0, 9)];
    setHistory(newHistory);
    saveHistoryToLocal(newHistory);
    
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display, isDegree, history, saveHistoryToLocal]);

  const tan = useCallback(() => {
    const value = parseFloat(display);
    const angle = isDegree ? toRadians(value) : value;
    const result = Math.tan(angle);
    const tanExpression = `tan(${value}${isDegree ? '°' : ''}) = ${result}`;
    
    setDisplay(String(result));
    setExpression(tanExpression);
    const newHistory = [tanExpression, ...history.slice(0, 9)];
    setHistory(newHistory);
    saveHistoryToLocal(newHistory);
    
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display, isDegree, history, saveHistoryToLocal]);

  const asin = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.asin(value);
    const finalResult = isDegree ? toDegrees(result) : result;
    const asinExpression = `asin(${value}) = ${finalResult}${isDegree ? '°' : ''}`;
    
    setDisplay(String(finalResult));
    setExpression(asinExpression);
    const newHistory = [asinExpression, ...history.slice(0, 9)];
    setHistory(newHistory);
    saveHistoryToLocal(newHistory);
    
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display, isDegree, history, saveHistoryToLocal]);

  const acos = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.acos(value);
    const finalResult = isDegree ? toDegrees(result) : result;
    const acosExpression = `acos(${value}) = ${finalResult}${isDegree ? '°' : ''}`;
    
    setDisplay(String(finalResult));
    setExpression(acosExpression);
    const newHistory = [acosExpression, ...history.slice(0, 9)];
    setHistory(newHistory);
    saveHistoryToLocal(newHistory);
    
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display, isDegree, history, saveHistoryToLocal]);

  const atan = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.atan(value);
    const finalResult = isDegree ? toDegrees(result) : result;
    const atanExpression = `atan(${value}) = ${finalResult}${isDegree ? '°' : ''}`;
    
    setDisplay(String(finalResult));
    setExpression(atanExpression);
    const newHistory = [atanExpression, ...history.slice(0, 9)];
    setHistory(newHistory);
    saveHistoryToLocal(newHistory);
    
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display, isDegree, history, saveHistoryToLocal]);

  const log10 = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.log10(value);
    const logExpression = `log(${value}) = ${result}`;
    
    setDisplay(String(result));
    setExpression(logExpression);
    const newHistory = [logExpression, ...history.slice(0, 9)];
    setHistory(newHistory);
    saveHistoryToLocal(newHistory);
    
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display, history, saveHistoryToLocal]);

  const ln = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.log(value);
    const lnExpression = `ln(${value}) = ${result}`;
    
    setDisplay(String(result));
    setExpression(lnExpression);
    const newHistory = [lnExpression, ...history.slice(0, 9)];
    setHistory(newHistory);
    saveHistoryToLocal(newHistory);
    
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display, history, saveHistoryToLocal]);

  const exp = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.exp(value);
    const expExpression = `e^${value} = ${result}`;
    
    setDisplay(String(result));
    setExpression(expExpression);
    const newHistory = [expExpression, ...history.slice(0, 9)];
    setHistory(newHistory);
    saveHistoryToLocal(newHistory);
    
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display, history, saveHistoryToLocal]);

  const power10 = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.pow(10, value);
    const power10Expression = `10^${value} = ${result}`;
    
    setDisplay(String(result));
    setExpression(power10Expression);
    const newHistory = [power10Expression, ...history.slice(0, 9)];
    setHistory(newHistory);
    saveHistoryToLocal(newHistory);
    
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display, history, saveHistoryToLocal]);

  const sqrt = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.sqrt(value);
    const sqrtExpression = `√${value} = ${result}`;
    
    setDisplay(String(result));
    setExpression(sqrtExpression);
    const newHistory = [sqrtExpression, ...history.slice(0, 9)];
    setHistory(newHistory);
    saveHistoryToLocal(newHistory);
    
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display, history, saveHistoryToLocal]);

  const square = useCallback(() => {
    const value = parseFloat(display);
    const result = value * value;
    const squareExpression = `${value}² = ${result}`;
    
    setDisplay(String(result));
    setExpression(squareExpression);
    const newHistory = [squareExpression, ...history.slice(0, 9)];
    setHistory(newHistory);
    saveHistoryToLocal(newHistory);
    
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display, history, saveHistoryToLocal]);

  const factorial = useCallback(() => {
    const value = parseInt(display);
    if (value < 0) return;
    
    let result = 1;
    for (let i = 2; i <= value; i++) {
      result *= i;
    }
    
    const factorialExpression = `${value}! = ${result}`;
    
    setDisplay(String(result));
    setExpression(factorialExpression);
    const newHistory = [factorialExpression, ...history.slice(0, 9)];
    setHistory(newHistory);
    saveHistoryToLocal(newHistory);
    
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display, history, saveHistoryToLocal]);

  const inputPi = useCallback(() => {
    setDisplay(String(Math.PI));
    setExpression(String(Math.PI));
    setWaitingForNewValue(true);
  }, []);

  const inputE = useCallback(() => {
    setDisplay(String(Math.E));
    setExpression(String(Math.E));
    setWaitingForNewValue(true);
  }, []);

  // 内存函数
  const memoryClear = useCallback(() => {
    setMemory(0);
  }, []);

  const memoryRecall = useCallback(() => {
    setDisplay(String(memory));
    setExpression(String(memory));
    setWaitingForNewValue(true);
  }, [memory]);

  const memoryStore = useCallback(() => {
    setMemory(parseFloat(display));
  }, [display]);

  const memoryAdd = useCallback(() => {
    setMemory(memory + parseFloat(display));
  }, [memory, display]);

  const basicButtons = [
    [
      { text: 'C', action: clear, color: 'error' },
      { text: 'CE', action: clearEntry, color: 'warning' },
      { text: '⌫', action: backspace, color: 'warning' },
      { text: '÷', action: () => performOperation('÷'), color: 'primary' }
    ],
    [
      { text: '7', action: () => inputNumber('7') },
      { text: '8', action: () => inputNumber('8') },
      { text: '9', action: () => inputNumber('9') },
      { text: '×', action: () => performOperation('×'), color: 'primary' }
    ],
    [
      { text: '4', action: () => inputNumber('4') },
      { text: '5', action: () => inputNumber('5') },
      { text: '6', action: () => inputNumber('6') },
      { text: '-', action: () => performOperation('-'), color: 'primary' }
    ],
    [
      { text: '1', action: () => inputNumber('1') },
      { text: '2', action: () => inputNumber('2') },
      { text: '3', action: () => inputNumber('3') },
      { text: '+', action: () => performOperation('+'), color: 'primary' }
    ],
    [
      { text: '0', action: () => inputNumber('0'), span: 2 },
      { text: '.', action: inputDecimal },
      { text: '=', action: calculate, color: 'success' }
    ]
  ];

  const scientificButtons = [
    [
      { text: 'sin', action: sin },
      { text: 'cos', action: cos },
      { text: 'tan', action: tan },
      { text: 'π', action: inputPi }
    ],
    [
      { text: 'asin', action: asin },
      { text: 'acos', action: acos },
      { text: 'atan', action: atan },
      { text: 'e', action: inputE }
    ],
    [
      { text: 'log', action: log10 },
      { text: 'ln', action: ln },
      { text: 'exp', action: exp },
      { text: '10^x', action: power10 }
    ],
    [
      { text: '√x', action: sqrt },
      { text: 'x²', action: square },
      { text: 'x^y', action: () => performOperation('^') },
      { text: 'x!', action: factorial }
    ],
    [
      { text: 'MC', action: memoryClear },
      { text: 'MR', action: memoryRecall },
      { text: 'MS', action: memoryStore },
      { text: 'M+', action: memoryAdd }
    ]
  ];

  return (
    <Box sx={{ maxWidth: isMobile ? '100%' : 800, mx: 'auto' }}>
      <Grid container spacing={isSmallScreen ? 1 : 2}>
        {/* 计算器主体 */}
        <Grid item xs={12}>
          <Paper sx={{ p: isSmallScreen ? 1.5 : 2 }}>
            {/* 显示区域 */}
            <Box sx={{ mb: 2 }}>
              {/* 表达式显示 */}
              <TextField
                fullWidth
                value={expression}
                placeholder="输入表达式..."
                InputProps={{
                  readOnly: true,
                  style: {
                    fontSize: isSmallScreen ? '0.9rem' : '1rem',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    color: theme.palette.text.secondary
                  }
                }}
                sx={{ mb: 1 }}
              />
              
              {/* 结果显示 */}
              <TextField
                fullWidth
                value={display}
                InputProps={{
                  readOnly: true,
                  style: {
                    fontSize: isSmallScreen ? '1.5rem' : '2rem',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                  }
                }}
              />
            </Box>

            {/* 角度单位切换 */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2,
              flexDirection: isSmallScreen ? 'column' : 'row',
              gap: isSmallScreen ? 1 : 0
            }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isDegree}
                    onChange={(e) => setIsDegree(e.target.checked)}
                  />
                }
                label={isDegree ? '角度 (°)' : '弧度 (rad)'}
              />
              <Typography variant="body2" color="text.secondary">
                内存: {memory}
              </Typography>
            </Box>

            <Grid container spacing={isSmallScreen ? 1 : 2}>
              {/* 科学函数按钮 */}
              <Grid item xs={12} md={isMobile ? 12 : 6}>
                <Typography variant={isSmallScreen ? "subtitle1" : "h6"} gutterBottom>
                  科学函数
                </Typography>
                <Grid container spacing={isSmallScreen ? 0.5 : 1}>
                  {scientificButtons.map((row, rowIndex) => (
                    row.map((btn, colIndex) => (
                      <Grid item xs={3} key={`sci-${rowIndex}-${colIndex}`}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={btn.action}
                          sx={{ 
                            minHeight: isSmallScreen ? 36 : 48, 
                            fontSize: isSmallScreen ? '0.7rem' : '0.8rem',
                            p: isSmallScreen ? 0.25 : 0.5
                          }}
                        >
                          {btn.text}
                        </Button>
                      </Grid>
                    ))
                  ))}
                </Grid>
              </Grid>

              {/* 基本计算按钮 */}
              <Grid item xs={12} md={isMobile ? 12 : 6}>
                <Typography variant={isSmallScreen ? "subtitle1" : "h6"} gutterBottom>
                  基本运算
                </Typography>
                <Grid container spacing={isSmallScreen ? 0.5 : 1}>
                  {basicButtons.map((row, rowIndex) => (
                    row.map((btn, colIndex) => (
                      <Grid 
                        item 
                        xs={btn.span || 3} 
                        key={`basic-${rowIndex}-${colIndex}`}
                      >
                        <Button
                          fullWidth
                          variant={btn.color ? 'contained' : 'outlined'}
                          color={btn.color as any || 'inherit'}
                          onClick={btn.action}
                          sx={{ 
                            minHeight: isSmallScreen ? 48 : 56,
                            fontSize: isSmallScreen ? '1rem' : '1.1rem',
                            fontWeight: 'bold',
                            p: isSmallScreen ? 0.5 : 1
                          }}
                        >
                          {btn.text}
                        </Button>
                      </Grid>
                    ))
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 历史记录 */}
        <Grid item xs={12}>
          <Paper sx={{ p: isSmallScreen ? 1.5 : 2 }}>
            <Typography variant={isSmallScreen ? "subtitle1" : "h6"} gutterBottom>
              计算历史
            </Typography>
            {history.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                暂无计算记录
              </Typography>
            ) : (
              <Box sx={{ maxHeight: isMobile ? 150 : 200, overflow: 'auto' }}>
                <Grid container spacing={1}>
                  {history.map((entry, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          p: 1,
                          backgroundColor: 'background.default',
                          borderRadius: 1,
                          fontSize: isSmallScreen ? '0.7rem' : '0.8rem',
                          wordBreak: 'break-all'
                        }}
                      >
                        {entry}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            {history.length > 0 && (
              <Button
                size="small"
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem('scientificCalculatorHistory');
                }}
                sx={{ mt: 1 }}
                fullWidth={isMobile}
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