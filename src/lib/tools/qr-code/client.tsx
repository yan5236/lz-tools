'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Slider,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import QrCodeIcon from '@mui/icons-material/QrCode';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorizeIcon from '@mui/icons-material/Colorize';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

// 样式组件
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const QRCodeCanvas = styled('canvas')(({ theme }) => ({
  maxWidth: '100%',
  height: 'auto',
  border: `2px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

const PreviewCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
}));

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
      id={`qr-tabpanel-${index}`}
      aria-labelledby={`qr-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function QRCodeTool() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // 标签页状态
  const [tabValue, setTabValue] = useState(0);
  
  // 生成二维码相关状态
  const [text, setText] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [qrOptions, setQrOptions] = useState({
    errorCorrectionLevel: 'M' as 'L' | 'M' | 'Q' | 'H',
    quality: 0.92,
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    width: 256
  });
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg'>('png');
  
  // 解码二维码相关状态
  const [decodedText, setDecodedText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  
  // 通用状态
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 标签页切换
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 生成二维码
  const generateQRCode = useCallback(async () => {
    if (!text.trim()) {
      showSnackbar('请输入要生成二维码的内容', 'warning');
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await QRCode.toCanvas(canvas, text, {
        errorCorrectionLevel: qrOptions.errorCorrectionLevel,
        margin: qrOptions.margin,
        color: qrOptions.color,
        width: qrOptions.width,
      });

      const mimeType = imageFormat === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, qrOptions.quality);
      setQrCodeDataUrl(dataUrl);
      showSnackbar('二维码生成成功！', 'success');
    } catch (error) {
      console.error('生成二维码失败:', error);
      showSnackbar('生成二维码失败，请检查输入内容', 'error');
    }
  }, [text, qrOptions]);

  // 下载二维码
  const downloadQRCode = () => {
    if (!qrCodeDataUrl) {
      showSnackbar('请先生成二维码', 'warning');
      return;
    }

    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.${imageFormat}`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar('二维码下载成功！', 'success');
  };

  // 文件上传处理
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showSnackbar('请上传图片文件', 'error');
      return;
    }

    setImageFile(file);
    
    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  // 解码二维码
  const decodeQRCode = useCallback(async () => {
    if (!imageFile) {
      showSnackbar('请先上传二维码图片', 'warning');
      return;
    }

    setIsDecoding(true);
    setDecodedText('');

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法获取canvas上下文');

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          setDecodedText(code.data);
          showSnackbar('二维码解码成功！', 'success');
        } else {
          showSnackbar('未能识别到二维码，请确保图片清晰且包含有效的二维码', 'warning');
        }
        setIsDecoding(false);
      };
      
      img.onerror = () => {
        showSnackbar('图片加载失败', 'error');
        setIsDecoding(false);
      };
      
      img.src = imagePreview;
    } catch (error) {
      console.error('解码二维码失败:', error);
      showSnackbar('解码二维码失败', 'error');
      setIsDecoding(false);
    }
  }, [imageFile, imagePreview]);

  // 显示通知
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // 清空数据
  const clearGeneratorData = () => {
    setText('');
    setQrCodeDataUrl('');
  };

  const clearDecoderData = () => {
    setDecodedText('');
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 选项变更处理器
  const handleSliderChange = (field: string) => (
    event: Event,
    value: number | number[]
  ) => {
    if (typeof value === 'number') {
      if (field === 'width') {
        setQrOptions(prev => ({ ...prev, width: value }));
      } else if (field === 'margin') {
        setQrOptions(prev => ({ ...prev, margin: value }));
      } else if (field === 'quality') {
        setQrOptions(prev => ({ ...prev, quality: value / 100 }));
      }
    }
  };

  const handleSelectChange = (field: string) => (event: SelectChangeEvent) => {
    const value = event.target.value;
    if (field === 'errorCorrectionLevel') {
      setQrOptions(prev => ({ ...prev, errorCorrectionLevel: value as 'L' | 'M' | 'Q' | 'H' }));
    } else if (field === 'imageFormat') {
      setImageFormat(value as 'png' | 'jpeg');
    }
  };

  const handleColorChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (field === 'color.dark') {
      setQrOptions(prev => ({ ...prev, color: { ...prev.color, dark: value } }));
    } else if (field === 'color.light') {
      setQrOptions(prev => ({ ...prev, color: { ...prev.color, light: value } }));
    }
  };

  return (
    <Box>
      {/* 工具标题和说明 */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              二维码工具：支持生成自定义二维码（调整颜色、尺寸、容错级别等）和解码二维码图片。
            </Typography>
          </Paper>
        </Grid>

        {/* 标签页 */}
        <Grid item xs={12}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant={isMobile ? 'fullWidth' : 'standard'}
              centered={!isMobile}
            >
              <Tab 
                icon={<QrCodeIcon />} 
                label="生成二维码" 
                iconPosition="start"
                sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
              />
              <Tab 
                icon={<QrCodeScannerIcon />} 
                label="解码二维码" 
                iconPosition="start"
                sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
              />
            </Tabs>
          </Box>
        </Grid>

        {/* 生成二维码标签页 */}
        <Grid item xs={12}>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* 输入区域 */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="输入内容"
                  multiline
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  fullWidth
                  variant="outlined"
                  placeholder="输入要生成二维码的文本、网址或其他内容..."
                  sx={{ mb: 2 }}
                />

                {/* 自定义选项 */}
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ColorizeIcon fontSize="small" />
                    自定义选项
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>容错级别</InputLabel>
                        <Select
                          value={qrOptions.errorCorrectionLevel}
                          label="容错级别"
                          onChange={handleSelectChange('errorCorrectionLevel')}
                        >
                          <MenuItem value="L">低 (7%)</MenuItem>
                          <MenuItem value="M">中 (15%)</MenuItem>
                          <MenuItem value="Q">较高 (25%)</MenuItem>
                          <MenuItem value="H">高 (30%)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>图片格式</InputLabel>
                        <Select
                          value={imageFormat}
                          label="图片格式"
                          onChange={handleSelectChange('imageFormat')}
                        >
                                                      <MenuItem value="png">PNG</MenuItem>
                            <MenuItem value="jpeg">JPEG</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                                              <TextField
                          label="前景色"
                          type="color"
                          value={qrOptions.color.dark}
                          onChange={handleColorChange('color.dark')}
                          fullWidth
                          size="small"
                          InputProps={{
                            sx: { height: 40 }
                          }}
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                                              <TextField
                          label="背景色"
                          type="color"
                          value={qrOptions.color.light}
                          onChange={handleColorChange('color.light')}
                          fullWidth
                          size="small"
                          InputProps={{
                            sx: { height: 40 }
                          }}
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography gutterBottom>二维码尺寸: {qrOptions.width}px</Typography>
                      <Slider
                        value={qrOptions.width}
                        onChange={handleSliderChange('width')}
                        min={128}
                        max={512}
                        step={16}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography gutterBottom>边距: {qrOptions.margin}px</Typography>
                      <Slider
                        value={qrOptions.margin}
                        onChange={handleSliderChange('margin')}
                        min={0}
                        max={10}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                    
                                         {imageFormat === 'jpeg' && (
                       <Grid item xs={12}>
                         <Typography gutterBottom>图片质量: {Math.round(qrOptions.quality * 100)}%</Typography>
                         <Slider
                           value={qrOptions.quality * 100}
                           onChange={handleSliderChange('quality')}
                           min={10}
                           max={100}
                           step={5}
                           marks
                           valueLabelDisplay="auto"
                         />
                       </Grid>
                     )}
                  </Grid>
                </Paper>

                                 {/* 操作按钮 */}
                 <Box sx={{ 
                   display: 'flex', 
                   gap: { xs: 1, sm: 2 }, 
                   flexWrap: 'wrap',
                   flexDirection: { xs: 'column', sm: 'row' }
                 }}>
                   <Button
                     variant="contained"
                     color="primary"
                     onClick={generateQRCode}
                     startIcon={<QrCodeIcon />}
                     disabled={!text.trim()}
                     fullWidth={isMobile}
                     size={isMobile ? 'large' : 'medium'}
                   >
                     生成二维码
                   </Button>
                   <Button
                     variant="outlined"
                     color="primary"
                     onClick={downloadQRCode}
                     startIcon={<DownloadIcon />}
                     disabled={!qrCodeDataUrl}
                     fullWidth={isMobile}
                     size={isMobile ? 'large' : 'medium'}
                   >
                     下载
                   </Button>
                   <Button
                     variant="outlined"
                     color="error"
                     onClick={clearGeneratorData}
                     startIcon={<DeleteIcon />}
                     fullWidth={isMobile}
                     size={isMobile ? 'large' : 'medium'}
                   >
                     清空
                   </Button>
                 </Box>
              </Grid>

                             {/* 预览区域 */}
               <Grid item xs={12} md={6}>
                 <PreviewCard>
                   <CardContent>
                     <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                       二维码预览
                     </Typography>
                     <Box 
                       sx={{ 
                         minHeight: { xs: 250, sm: 300 }, 
                         display: 'flex', 
                         alignItems: 'center', 
                         justifyContent: 'center',
                         flexDirection: 'column',
                         gap: 2,
                         p: 2
                       }}
                     >
                       {qrCodeDataUrl ? (
                         <canvas 
                           ref={canvasRef} 
                           style={{ 
                             maxWidth: '100%', 
                             height: 'auto',
                             borderRadius: 8,
                             boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                           }} 
                         />
                       ) : (
                         <Box sx={{ 
                           display: 'flex', 
                           flexDirection: 'column', 
                           alignItems: 'center', 
                           justifyContent: 'center',
                           textAlign: 'center',
                           gap: 2,
                           p: 3,
                           backgroundColor: 'grey.50',
                           borderRadius: 2,
                           border: '2px dashed',
                           borderColor: 'grey.300',
                           minHeight: { xs: 200, sm: 250 },
                           width: '100%'
                         }}>
                           <QrCodeIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'grey.400' }} />
                           <Typography 
                             color="text.secondary" 
                             variant="body1"
                             sx={{ 
                               fontSize: { xs: '0.875rem', sm: '1rem' },
                               lineHeight: 1.5,
                               maxWidth: '280px'
                             }}
                           >
                             输入内容并点击"生成二维码"按钮开始创建您的专属二维码
                           </Typography>
                         </Box>
                       )}
                     </Box>
                   </CardContent>
                 </PreviewCard>
               </Grid>
            </Grid>
          </TabPanel>
        </Grid>

        {/* 解码二维码标签页 */}
        <Grid item xs={12}>
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {/* 上传区域 */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: imageFile ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    mb: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover'
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    上传二维码图片
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    支持 PNG、JPEG、GIF 等常见图片格式
                  </Typography>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{ pointerEvents: 'none' }}
                  >
                    选择文件
                    <VisuallyHiddenInput
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </Button>
                </Paper>

                                 {/* 操作按钮 */}
                 <Box sx={{ 
                   display: 'flex', 
                   gap: { xs: 1, sm: 2 }, 
                   flexWrap: 'wrap',
                   flexDirection: { xs: 'column', sm: 'row' }
                 }}>
                   <Button
                     variant="contained"
                     color="primary"
                     onClick={decodeQRCode}
                     startIcon={isDecoding ? <CircularProgress size={20} /> : <QrCodeScannerIcon />}
                     disabled={!imageFile || isDecoding}
                     fullWidth={isMobile}
                     size={isMobile ? 'large' : 'medium'}
                   >
                     {isDecoding ? '解码中...' : '解码二维码'}
                   </Button>
                   <Button
                     variant="outlined"
                     color="error"
                     onClick={clearDecoderData}
                     startIcon={<DeleteIcon />}
                     fullWidth={isMobile}
                     size={isMobile ? 'large' : 'medium'}
                   >
                     清空
                   </Button>
                 </Box>

                {/* 解码结果 */}
                {decodedText && (
                  <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      解码结果：
                    </Typography>
                    <TextField
                      multiline
                      rows={4}
                      value={decodedText}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                )}
              </Grid>

                             {/* 图片预览区域 */}
               <Grid item xs={12} md={6}>
                 <PreviewCard>
                   <CardContent>
                     <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                       图片预览
                     </Typography>
                     <Box 
                       sx={{ 
                         minHeight: { xs: 250, sm: 300 }, 
                         display: 'flex', 
                         alignItems: 'center', 
                         justifyContent: 'center',
                         flexDirection: 'column',
                         gap: 2,
                         p: 2
                       }}
                     >
                       {imagePreview ? (
                         <Box
                           component="img"
                           src={imagePreview}
                           alt="二维码预览"
                           sx={{
                             maxWidth: '100%',
                             maxHeight: { xs: 250, sm: 300 },
                             objectFit: 'contain',
                             borderRadius: 2,
                             boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                           }}
                         />
                       ) : (
                         <Box sx={{ 
                           display: 'flex', 
                           flexDirection: 'column', 
                           alignItems: 'center', 
                           justifyContent: 'center',
                           textAlign: 'center',
                           gap: 2,
                           p: 3,
                           backgroundColor: 'grey.50',
                           borderRadius: 2,
                           border: '2px dashed',
                           borderColor: 'grey.300',
                           minHeight: { xs: 200, sm: 250 },
                           width: '100%'
                         }}>
                           <QrCodeScannerIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'grey.400' }} />
                           <Typography 
                             color="text.secondary" 
                             variant="body1"
                             sx={{ 
                               fontSize: { xs: '0.875rem', sm: '1rem' },
                               lineHeight: 1.5,
                               maxWidth: '280px'
                             }}
                           >
                             选择包含二维码的图片文件进行预览和解码
                           </Typography>
                         </Box>
                       )}
                     </Box>
                   </CardContent>
                 </PreviewCard>
               </Grid>
            </Grid>
          </TabPanel>
        </Grid>
      </Grid>

      {/* 通知 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}