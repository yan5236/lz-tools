'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  Paper,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  InputAdornment,
  IconButton,
  Slider,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import RefreshIcon from '@mui/icons-material/Refresh';

// 颜色格式类型
type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla';

// 颜色存储对象
interface ColorValues {
  hex: string;
  rgb: { r: number; g: number; b: number; a: number };
  hsl: { h: number; s: number; l: number; a: number };
}

// 初始化颜色值
const initialColorValues: ColorValues = {
  hex: '#1976d2',
  rgb: { r: 25, g: 118, b: 210, a: 1 },
  hsl: { h: 210, s: 79, l: 46, a: 1 },
};

export default function ColorConverter() {
  const [inputFormat, setInputFormat] = useState<ColorFormat>('hex');
  const [colorValues, setColorValues] = useState<ColorValues>(initialColorValues);
  const [hexInput, setHexInput] = useState('#1976d2');
  const [rgbInput, setRgbInput] = useState({ r: 25, g: 118, b: 210, a: 1 });
  const [hslInput, setHslInput] = useState({ h: 210, s: 79, l: 46, a: 1 });
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // 格式化 RGB 值为字符串
  const formatRgb = (r: number, g: number, b: number, a: number = 1) => {
    return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  };

  // 格式化 HSL 值为字符串
  const formatHsl = (h: number, s: number, l: number, a: number = 1) => {
    return a === 1 ? `hsl(${h}deg, ${s}%, ${l}%)` : `hsla(${h}deg, ${s}%, ${l}%, ${a.toFixed(2)})`;
  };

  // 将十六进制转换为 RGB
  const hexToRgb = (hex: string) => {
    // 移除 # 号
    hex = hex.replace('#', '');

    // 标准化为六位十六进制
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }

    // 解析 RGB 值
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b, a: 1 };
  };

  // 将 RGB 转换为十六进制
  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + 
      Math.round(r).toString(16).padStart(2, '0') + 
      Math.round(g).toString(16).padStart(2, '0') + 
      Math.round(b).toString(16).padStart(2, '0');
  };

  // 将 RGB 转换为 HSL
  const rgbToHsl = (r: number, g: number, b: number, a: number = 1) => {
    // 将 RGB 转换为 [0, 1] 范围
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }

      h /= 6;
    }

    // 转换为常用单位
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return { h, s, l, a };
  };

  // 将 HSL 转换为 RGB
  const hslToRgb = (h: number, s: number, l: number, a: number = 1) => {
    // 转换为 [0, 1] 范围
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    // 转换为 [0, 255] 范围
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
      a
    };
  };

  // 更新所有颜色值
  const updateAllColorValues = (format: ColorFormat, value: any) => {
    try {
      let rgb, hsl, hex;

      switch (format) {
        case 'hex':
          hex = value;
          rgb = hexToRgb(hex);
          hsl = rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a);
          break;
        case 'rgb':
        case 'rgba':
          rgb = value;
          hex = rgbToHex(rgb.r, rgb.g, rgb.b);
          hsl = rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a);
          break;
        case 'hsl':
        case 'hsla':
          hsl = value;
          rgb = hslToRgb(hsl.h, hsl.s, hsl.l, hsl.a);
          hex = rgbToHex(rgb.r, rgb.g, rgb.b);
          break;
      }

      setColorValues({ hex, rgb, hsl });
      setHexInput(hex);
      setRgbInput(rgb);
      setHslInput(hsl);
      setError('');
    } catch (err) {
      setError('颜色格式无效，请检查输入。');
    }
  };

  // 处理输入格式变化
  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputFormat(event.target.value as ColorFormat);
  };

  // 处理十六进制输入变化
  const handleHexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setHexInput(value);

    if (/^#?[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(value)) {
      const formattedHex = value.startsWith('#') ? value : `#${value}`;
      updateAllColorValues('hex', formattedHex);
    }
  };

  // 处理 RGB 滑块变化
  const handleRgbSliderChange = (component: keyof typeof rgbInput) => (event: Event, newValue: number | number[]) => {
    const value = typeof newValue === 'number' ? newValue : newValue[0];
    const newRgb = { ...rgbInput, [component]: value };
    setRgbInput(newRgb);
    updateAllColorValues('rgb', newRgb);
  };

  // 处理 RGB 输入变化
  const handleRgbInputChange = (component: keyof typeof rgbInput) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      const newRgb = { ...rgbInput, [component]: value };
      setRgbInput(newRgb);
      updateAllColorValues('rgb', newRgb);
    }
  };

  // 处理 HSL 滑块变化
  const handleHslSliderChange = (component: keyof typeof hslInput) => (event: Event, newValue: number | number[]) => {
    const value = typeof newValue === 'number' ? newValue : newValue[0];
    const newHsl = { ...hslInput, [component]: value };
    setHslInput(newHsl);
    updateAllColorValues('hsl', newHsl);
  };

  // 处理 HSL 输入变化
  const handleHslInputChange = (component: keyof typeof hslInput) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      const newHsl = { ...hslInput, [component]: value };
      setHslInput(newHsl);
      updateAllColorValues('hsl', newHsl);
    }
  };

  // 复制颜色值到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setSnackbarSeverity('success');
        setSnackbarMessage('颜色值已复制到剪贴板');
        setSnackbarOpen(true);
      },
      () => {
        setSnackbarSeverity('error');
        setSnackbarMessage('复制失败，请手动复制');
        setSnackbarOpen(true);
      }
    );
  };

  // 重置为默认颜色
  const resetToDefault = () => {
    setColorValues(initialColorValues);
    setHexInput(initialColorValues.hex);
    setRgbInput(initialColorValues.rgb);
    setHslInput(initialColorValues.hsl);
    setError('');
  };

  // 使用随机颜色
  const useRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const randomRgb = { r, g, b, a: 1 };
    setRgbInput(randomRgb);
    updateAllColorValues('rgb', randomRgb);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ColorLensIcon color="primary" /> 颜色格式转换器
            </Typography>
            <Typography variant="body2" color="text.secondary">
              在HEX、RGB和HSL颜色格式之间轻松转换。可以使用滑块直观地调整颜色，或直接输入颜色值。
            </Typography>
          </Paper>
        </Grid>

        {/* 颜色预览 */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  height: 100,
                  bgcolor: `rgba(${colorValues.rgb.r}, ${colorValues.rgb.g}, ${colorValues.rgb.b}, ${colorValues.rgb.a})`,
                  borderRadius: 2,
                  boxShadow: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: colorValues.hsl.l > 50 ? '#000' : '#fff',
                    fontWeight: 'bold',
                    textShadow: '0px 0px 2px rgba(0,0,0,0.2)'
                  }}
                >
                  当前颜色预览
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  height: 100,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<RefreshIcon />}
                    onClick={useRandomColor}
                  >
                    随机颜色
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<DeleteIcon />}
                    onClick={resetToDefault}
                  >
                    重置
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      HEX
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', cursor: 'pointer' }} onClick={() => copyToClipboard(colorValues.hex)}>
                      {colorValues.hex}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      RGB
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', cursor: 'pointer' }} onClick={() => copyToClipboard(formatRgb(colorValues.rgb.r, colorValues.rgb.g, colorValues.rgb.b))}>
                      {formatRgb(colorValues.rgb.r, colorValues.rgb.g, colorValues.rgb.b)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      HSL
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', cursor: 'pointer' }} onClick={() => copyToClipboard(formatHsl(colorValues.hsl.h, colorValues.hsl.s, colorValues.hsl.l))}>
                      {formatHsl(colorValues.hsl.h, colorValues.hsl.s, colorValues.hsl.l)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              颜色值一览
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1, p: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    HEX
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}>
                    {colorValues.hex}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1, p: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    RGB
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}>
                    {formatRgb(colorValues.rgb.r, colorValues.rgb.g, colorValues.rgb.b)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1, p: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    HSL
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}>
                    {formatHsl(colorValues.hsl.h, colorValues.hsl.s, colorValues.hsl.l)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 颜色格式选择 */}
        <Grid item xs={12}>
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">输入格式</FormLabel>
            <RadioGroup
              row
              name="format"
              value={inputFormat}
              onChange={handleFormatChange}
            >
              <FormControlLabel value="hex" control={<Radio />} label="HEX" />
              <FormControlLabel value="rgb" control={<Radio />} label="RGB" />
              <FormControlLabel value="hsl" control={<Radio />} label="HSL" />
            </RadioGroup>
          </FormControl>

          {/* 错误提示 */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Grid>

        <Grid item xs={12}>
          {/* HEX 输入 */}
          {inputFormat === 'hex' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                HEX 颜色值
              </Typography>
              <TextField
                value={hexInput}
                onChange={handleHexChange}
                placeholder="#RRGGBB"
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">#</InputAdornment>,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                输入3位(#RGB)或6位(#RRGGBB)十六进制颜色码
              </Typography>
            </Box>
          )}

          {/* RGB 输入 */}
          {inputFormat === 'rgb' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                RGB 颜色值
              </Typography>
              
              {/* R 分量 */}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={1}>
                  <Typography variant="body2" color="error">R:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Slider
                    value={rgbInput.r}
                    onChange={handleRgbSliderChange('r')}
                    min={0}
                    max={255}
                    valueLabelDisplay="auto"
                    color="error"
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    value={rgbInput.r}
                    onChange={handleRgbInputChange('r')}
                    type="number"
                    variant="outlined"
                    InputProps={{ inputProps: { min: 0, max: 255 } }}
                  />
                </Grid>
              </Grid>
              
              {/* G 分量 */}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={1}>
                  <Typography variant="body2" color="success">G:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Slider
                    value={rgbInput.g}
                    onChange={handleRgbSliderChange('g')}
                    min={0}
                    max={255}
                    valueLabelDisplay="auto"
                    color="success"
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    value={rgbInput.g}
                    onChange={handleRgbInputChange('g')}
                    type="number"
                    variant="outlined"
                    InputProps={{ inputProps: { min: 0, max: 255 } }}
                  />
                </Grid>
              </Grid>
              
              {/* B 分量 */}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={1}>
                  <Typography variant="body2" color="primary">B:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Slider
                    value={rgbInput.b}
                    onChange={handleRgbSliderChange('b')}
                    min={0}
                    max={255}
                    valueLabelDisplay="auto"
                    color="primary"
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    value={rgbInput.b}
                    onChange={handleRgbInputChange('b')}
                    type="number"
                    variant="outlined"
                    InputProps={{ inputProps: { min: 0, max: 255 } }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* HSL 输入 */}
          {inputFormat === 'hsl' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                HSL 颜色值
              </Typography>
              
              {/* H 分量 */}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={1}>
                  <Typography variant="body2">H:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Slider
                    value={hslInput.h}
                    onChange={handleHslSliderChange('h')}
                    min={0}
                    max={360}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    value={hslInput.h}
                    onChange={handleHslInputChange('h')}
                    type="number"
                    variant="outlined"
                    InputProps={{ 
                      inputProps: { min: 0, max: 360 },
                      endAdornment: <InputAdornment position="end">°</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
              
              {/* S 分量 */}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={1}>
                  <Typography variant="body2">S:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Slider
                    value={hslInput.s}
                    onChange={handleHslSliderChange('s')}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    value={hslInput.s}
                    onChange={handleHslInputChange('s')}
                    type="number"
                    variant="outlined"
                    InputProps={{ 
                      inputProps: { min: 0, max: 100 },
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
              
              {/* L 分量 */}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={1}>
                  <Typography variant="body2">L:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Slider
                    value={hslInput.l}
                    onChange={handleHslSliderChange('l')}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    value={hslInput.l}
                    onChange={handleHslInputChange('l')}
                    type="number"
                    variant="outlined"
                    InputProps={{ 
                      inputProps: { min: 0, max: 100 },
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </Grid>
          
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => copyToClipboard(
                inputFormat === 'hex' ? colorValues.hex : 
                inputFormat === 'rgb' ? formatRgb(colorValues.rgb.r, colorValues.rgb.g, colorValues.rgb.b) :
                formatHsl(colorValues.hsl.h, colorValues.hsl.s, colorValues.hsl.l)
              )}
              startIcon={<ContentCopyIcon />}
            >
              复制{inputFormat.toUpperCase()}值
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={resetToDefault}
              startIcon={<DeleteIcon />}
              sx={{ ml: 'auto' }}
            >
              重置
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 