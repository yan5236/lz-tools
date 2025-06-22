import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

type NumberBase = 'BIN' | 'OCT' | 'DEC' | 'HEX';

interface ButtonConfig {
  text: string;
  action: () => void;
  span?: number;
  color?: 'error' | 'warning' | 'primary' | 'success' | 'inherit';
  disabled?: boolean;
}

export default function ProgrammerCalculator() {
  const [display, setDisplay] = useState('0');
  const [base, setBase] = useState<NumberBase>('DEC');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // 从localStorage加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('programmerCalculatorHistory');
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
      localStorage.setItem('programmerCalculatorHistory', JSON.stringify(newHistory));
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

  const convertToBase = useCallback((value: number, targetBase: NumberBase): string => {
    switch (targetBase) {
      case 'BIN':
        return value.toString(2);
      case 'OCT':
        return value.toString(8);
      case 'DEC':
        return value.toString(10);
      case 'HEX':
        return value.toString(16).toUpperCase();
      default:
        return value.toString(10);
    }
  }, []);

  const parseFromBase = useCallback((value: string, fromBase: NumberBase): number => {
    switch (fromBase) {
      case 'BIN':
        return parseInt(value, 2);
      case 'OCT':
        return parseInt(value, 8);
      case 'DEC':
        return parseInt(value, 10);
      case 'HEX':
        return parseInt(value, 16);
      default:
        return parseInt(value, 10);
    }
  }, []);

  const getCurrentValue = useCallback((): number => {
    return parseFromBase(display, base);
  }, [display, base, parseFromBase]);

  const updateDisplay = useCallback((value: number) => {
    setDisplay(convertToBase(Math.floor(value), base));
  }, [base, convertToBase]);

  const inputDigit = useCallback((digit: string) => {
    const validDigits = {
      'BIN': '01',
      'OCT': '01234567',
      'DEC': '0123456789',
      'HEX': '0123456789ABCDEF'
    };

    if (!validDigits[base].includes(digit.toUpperCase())) {
      return;
    }

    if (waitingForNewValue) {
      setDisplay(digit);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  }, [display, base, waitingForNewValue]);

  const clear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  }, []);

  const changeBase = useCallback((newBase: NumberBase) => {
    const currentValue = getCurrentValue();
    setBase(newBase);
    setDisplay(convertToBase(currentValue, newBase));
  }, [getCurrentValue, convertToBase]);

  const performOperation = useCallback((nextOperation: string) => {
    const inputValue = getCurrentValue();

    if (previousValue === null) {
      setPreviousValue(inputValue);
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
          result = inputValue !== 0 ? Math.floor(currentValue / inputValue) : 0;
          break;
        case 'AND':
          result = currentValue & inputValue;
          break;
        case 'OR':
          result = currentValue | inputValue;
          break;
        case 'XOR':
          result = currentValue ^ inputValue;
          break;
        default:
          return;
      }

      const historyEntry = `${convertToBase(currentValue, base)} ${operation} ${convertToBase(inputValue, base)} = ${convertToBase(result, base)} (${base})`;
      addToHistory(historyEntry);

      updateDisplay(result);
      setPreviousValue(result);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  }, [getCurrentValue, previousValue, operation, base, convertToBase, updateDisplay]);

  const calculate = useCallback(() => {
    performOperation('=');
    setOperation(null);
    setPreviousValue(null);
    setWaitingForNewValue(true);
  }, [performOperation]);

  const getAllBaseValues = useCallback(() => {
    const value = getCurrentValue();
    return {
      BIN: convertToBase(value, 'BIN'),
      OCT: convertToBase(value, 'OCT'),
      DEC: convertToBase(value, 'DEC'),
      HEX: convertToBase(value, 'HEX')
    };
  }, [getCurrentValue, convertToBase]);

  const allValues = getAllBaseValues();

  const digitButtons: ButtonConfig[][] = [
    [
      { text: 'C', action: clear, color: 'error' },
      { text: 'A', action: () => inputDigit('A'), disabled: base !== 'HEX' },
      { text: 'B', action: () => inputDigit('B'), disabled: base !== 'HEX' },
      { text: '÷', action: () => performOperation('÷'), color: 'primary' }
    ],
    [
      { text: 'D', action: () => inputDigit('D'), disabled: base !== 'HEX' },
      { text: 'E', action: () => inputDigit('E'), disabled: base !== 'HEX' },
      { text: 'F', action: () => inputDigit('F'), disabled: base !== 'HEX' },
      { text: '×', action: () => performOperation('×'), color: 'primary' }
    ],
    [
      { text: '7', action: () => inputDigit('7'), disabled: base === 'BIN' },
      { text: '8', action: () => inputDigit('8'), disabled: ['BIN', 'OCT'].includes(base) },
      { text: '9', action: () => inputDigit('9'), disabled: ['BIN', 'OCT'].includes(base) },
      { text: '-', action: () => performOperation('-'), color: 'primary' }
    ],
    [
      { text: '4', action: () => inputDigit('4'), disabled: base === 'BIN' },
      { text: '5', action: () => inputDigit('5'), disabled: base === 'BIN' },
      { text: '6', action: () => inputDigit('6'), disabled: base === 'BIN' },
      { text: '+', action: () => performOperation('+'), color: 'primary' }
    ],
    [
      { text: '1', action: () => inputDigit('1') },
      { text: '2', action: () => inputDigit('2'), disabled: base === 'BIN' },
      { text: '3', action: () => inputDigit('3'), disabled: base === 'BIN' },
      { text: '=', action: calculate, color: 'success' }
    ],
    [
      { text: '0', action: () => inputDigit('0'), span: 3 },
      { text: 'AND', action: () => performOperation('AND') }
    ]
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <TextField
              fullWidth
              value={display}
              InputProps={{
                readOnly: true,
                style: {
                  fontSize: '2rem',
                  textAlign: 'right',
                  fontFamily: 'monospace'
                }
              }}
              sx={{ mb: 2 }}
            />

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">进制选择</FormLabel>
              <RadioGroup
                row
                value={base}
                onChange={(e) => changeBase(e.target.value as NumberBase)}
              >
                <FormControlLabel value="BIN" control={<Radio />} label="二进制" />
                <FormControlLabel value="OCT" control={<Radio />} label="八进制" />
                <FormControlLabel value="DEC" control={<Radio />} label="十进制" />
                <FormControlLabel value="HEX" control={<Radio />} label="十六进制" />
              </RadioGroup>
            </FormControl>

            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6} md={3}>
                <Box sx={{ p: 1, bgcolor: base === 'BIN' ? 'primary.light' : 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption">BIN: {allValues.BIN}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ p: 1, bgcolor: base === 'OCT' ? 'primary.light' : 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption">OCT: {allValues.OCT}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ p: 1, bgcolor: base === 'DEC' ? 'primary.light' : 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption">DEC: {allValues.DEC}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ p: 1, bgcolor: base === 'HEX' ? 'primary.light' : 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption">HEX: {allValues.HEX}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={1}>
              {digitButtons.map((row, rowIndex) => (
                row.map((btn, colIndex) => (
                  <Grid 
                    item 
                    xs={btn.span || 3} 
                    key={`${rowIndex}-${colIndex}`}
                  >
                    <Button
                      fullWidth
                      variant={btn.color ? 'contained' : 'outlined'}
                      color={btn.color as any || 'inherit'}
                      onClick={btn.action}
                      disabled={btn.disabled}
                      sx={{ 
                        minHeight: 48,
                        fontSize: '1rem'
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
                  localStorage.removeItem('programmerCalculatorHistory');
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