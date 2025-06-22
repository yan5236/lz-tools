import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  useTheme
} from '@mui/material';

export default function ScientificCalculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [isDegree, setIsDegree] = useState(true); // true for degrees, false for radians
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

  // 添加历史记录的统一函数
  const addToHistory = useCallback((entry: string) => {
    const newHistory = [entry, ...history.slice(0, 9)];
    setHistory(newHistory);
    saveHistoryToLocal(newHistory);
  }, [history, saveHistoryToLocal]);

  const theme = useTheme();

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

  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  const toDegrees = (radians: number) => radians * (180 / Math.PI);

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
        case 'log':
          result = Math.log10(inputValue);
          break;
        case 'ln':
          result = Math.log(inputValue);
          break;
        default:
          return;
      }

      const historyEntry = `${currentValue} ${operation} ${inputValue} = ${result}`;
      addToHistory(historyEntry);

      setDisplay(String(result));
      setExpression(`${result} ${nextOperation} `);
      setPreviousValue(result);
    } else {
      // 如果没有之前的运算，直接设置表达式
      setExpression(`${inputValue} ${nextOperation} `);
      setPreviousValue(inputValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation]);

  const calculate = useCallback(() => {
    performOperation('=');
    setOperation(null);
    setPreviousValue(null);
    setWaitingForNewValue(true);
  }, [performOperation]);

  // 三角函数
  const sin = useCallback(() => {
    const value = parseFloat(display);
    const angle = isDegree ? toRadians(value) : value;
    const result = Math.sin(angle);
    const sinExpression = `sin(${value}${isDegree ? '°' : ' rad'}) = ${result}`;
    
    setDisplay(String(result));
    setExpression(sinExpression);
    addToHistory(sinExpression);
    
    // 重置运算状态
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display, isDegree]);

  const cos = useCallback(() => {
    const value = parseFloat(display);
    const angle = isDegree ? toRadians(value) : value;
    const result = Math.cos(angle);
    setDisplay(String(result));
    addToHistory(`cos(${value}${isDegree ? '°' : ' rad'}) = ${result}`);
  }, [display, isDegree]);

  const tan = useCallback(() => {
    const value = parseFloat(display);
    const angle = isDegree ? toRadians(value) : value;
    const result = Math.tan(angle);
    setDisplay(String(result));
    addToHistory(`tan(${value}${isDegree ? '°' : ' rad'}) = ${result}`);
  }, [display, isDegree]);

  // 反三角函数
  const asin = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.asin(value);
    const displayResult = isDegree ? toDegrees(result) : result;
    setDisplay(String(displayResult));
    addToHistory(`asin(${value}) = ${displayResult}${isDegree ? '°' : ' rad'}`);
  }, [display, isDegree]);

  const acos = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.acos(value);
    const displayResult = isDegree ? toDegrees(result) : result;
    setDisplay(String(displayResult));
    addToHistory(`acos(${value}) = ${displayResult}${isDegree ? '°' : ' rad'}`);
  }, [display, isDegree]);

  const atan = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.atan(value);
    const displayResult = isDegree ? toDegrees(result) : result;
    setDisplay(String(displayResult));
    addToHistory(`atan(${value}) = ${displayResult}${isDegree ? '°' : ' rad'}`);
  }, [display, isDegree]);

  // 对数函数
  const log10 = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.log10(value);
    setDisplay(String(result));
    addToHistory(`log(${value}) = ${result}`);
  }, [display]);

  const ln = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.log(value);
    setDisplay(String(result));
    addToHistory(`ln(${value}) = ${result}`);
  }, [display]);

  // 指数函数
  const exp = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.exp(value);
    setDisplay(String(result));
    addToHistory(`e^${value} = ${result}`);
  }, [display]);

  const power10 = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.pow(10, value);
    setDisplay(String(result));
    addToHistory(`10^${value} = ${result}`);
  }, [display]);

  // 其他函数
  const sqrt = useCallback(() => {
    const value = parseFloat(display);
    const result = Math.sqrt(value);
    const sqrtExpression = `√${value} = ${result}`;
    
    setDisplay(String(result));
    setExpression(sqrtExpression);
    addToHistory(sqrtExpression);
    
    // 重置运算状态
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display]);

  const square = useCallback(() => {
    const value = parseFloat(display);
    const result = value * value;
    setDisplay(String(result));
    addToHistory(`${value}² = ${result}`);
  }, [display]);

  const factorial = useCallback(() => {
    const value = parseFloat(display);
    if (value >= 0 && value <= 170 && Number.isInteger(value)) {
      let result = 1;
      for (let i = 2; i <= value; i++) {
        result *= i;
      }
      setDisplay(String(result));
      addToHistory(`${value}! = ${result}`);
    }
  }, [display]);

  const reciprocal = useCallback(() => {
    const value = parseFloat(display);
    if (value !== 0) {
      const result = 1 / value;
      setDisplay(String(result));
      addToHistory(`1/${value} = ${result}`);
    }
  }, [display]);

  // 内存操作
  const memoryStore = useCallback(() => {
    setMemory(parseFloat(display));
  }, [display]);

  const memoryRecall = useCallback(() => {
    setDisplay(String(memory));
  }, [memory]);

  const memoryClear = useCallback(() => {
    setMemory(0);
  }, []);

  const memoryAdd = useCallback(() => {
    setMemory(prev => prev + parseFloat(display));
  }, [display]);

  // 常数
  const inputPi = useCallback(() => {
    setDisplay(String(Math.PI));
  }, []);

  const inputE = useCallback(() => {
    setDisplay(String(Math.E));
  }, []);

  const basicButtons = [
    [
      { text: 'C', action: clear, color: 'error' },
      { text: '(', action: () => inputNumber('(') },
      { text: ')', action: () => inputNumber(')') },
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
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Grid container spacing={2}>
        {/* 计算器主体 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
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
                    fontSize: '1rem',
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
                    fontSize: '2rem',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                  }
                }}
              />
            </Box>

            {/* 角度单位切换 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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

            <Grid container spacing={2}>
              {/* 科学函数按钮 */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  科学函数
                </Typography>
                <Grid container spacing={1}>
                  {scientificButtons.map((row, rowIndex) => (
                    row.map((btn, colIndex) => (
                      <Grid item xs={3} key={`sci-${rowIndex}-${colIndex}`}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={btn.action}
                          sx={{ minHeight: 48, fontSize: '0.8rem' }}
                        >
                          {btn.text}
                        </Button>
                      </Grid>
                    ))
                  ))}
                </Grid>
              </Grid>

              {/* 基本计算按钮 */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  基本运算
                </Typography>
                <Grid container spacing={1}>
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
                            minHeight: 56,
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
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
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              计算历史
            </Typography>
            {history.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                暂无计算记录
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
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
                          fontSize: '0.8rem'
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