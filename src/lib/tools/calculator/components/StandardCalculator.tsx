import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  useTheme
} from '@mui/material';

export default function StandardCalculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // 从localStorage加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('standardCalculatorHistory');
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
      localStorage.setItem('standardCalculatorHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('保存计算历史失败:', error);
    }
  }, []);
  
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
        case '%':
          result = currentValue % inputValue;
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
      // 如果没有之前的运算，直接设置表达式
      setExpression(`${inputValue} ${nextOperation} `);
      setPreviousValue(inputValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation]);

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
        case '%':
          result = currentValue % inputValue;
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
  }, [display, previousValue, operation]);

  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    const newValue = -value;
    setDisplay(String(newValue));
    
    if (operation && previousValue !== null) {
      setExpression(`${previousValue} ${operation} ${newValue}`);
    } else {
      setExpression(String(newValue));
    }
  }, [display, operation, previousValue]);

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
  }, [display]);

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
  }, [display]);

  const reciprocal = useCallback(() => {
    const value = parseFloat(display);
    if (value !== 0) {
      const result = 1 / value;
      const reciprocalExpression = `1/${value} = ${result}`;
      
      setDisplay(String(result));
      setExpression(reciprocalExpression);
      const newHistory = [reciprocalExpression, ...history.slice(0, 9)];
      setHistory(newHistory);
      saveHistoryToLocal(newHistory);
      
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  }, [display]);

  const buttons = [
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
      { text: '±', action: toggleSign },
      { text: '0', action: () => inputNumber('0') },
      { text: '.', action: inputDecimal },
      { text: '=', action: calculate, color: 'success' }
    ]
  ];

  const functionButtons = [
    { text: '√x', action: sqrt },
    { text: 'x²', action: square },
    { text: '1/x', action: reciprocal },
    { text: '%', action: () => performOperation('%') }
  ];

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Grid container spacing={2}>
        {/* 计算器主体 */}
        <Grid item xs={12} md={8}>
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

            {/* 功能按钮 */}
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {functionButtons.map((btn, index) => (
                <Grid item xs={3} key={index}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={btn.action}
                    sx={{ minHeight: 48 }}
                  >
                    {btn.text}
                  </Button>
                </Grid>
              ))}
            </Grid>

            {/* 数字和运算按钮 */}
            <Grid container spacing={1}>
              {buttons.map((row, rowIndex) => (
                row.map((btn, colIndex) => (
                  <Grid item xs={3} key={`${rowIndex}-${colIndex}`}>
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
          </Paper>
        </Grid>

        {/* 历史记录 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 'fit-content' }}>
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
                      fontFamily: 'monospace',
                      py: 0.5,
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
                  localStorage.removeItem('standardCalculatorHistory');
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