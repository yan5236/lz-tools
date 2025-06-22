'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Link,
  LinearProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
} from '@mui/material';
import {
  CompressOutlined as CompressIcon,
  FileDownloadOutlined as FileDownloadIcon,
  DeleteOutline as DeleteIcon,
  AutorenewOutlined as AutorenewIcon,
  CheckCircleOutlined as CheckCircleIcon,
  VisibilityOutlined as VisibilityIcon,
  VisibilityOffOutlined as VisibilityOffIcon,
  CancelOutlined as CancelIcon,
  FolderZipOutlined as ZipIcon,
} from '@mui/icons-material';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import JSZip from 'jszip';

// 文件大小格式化
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 计算base64数据URL的字节大小
const calculateBase64Size = (dataURL: string): number => {
  const base64 = dataURL.split(',')[1];
  if (!base64) return 0;
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
};

export default function ImageCompress() {
  const [files, setFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(-1);
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressionRatio, setCompressionRatio] = useState<number>(0);

  const [quality, setQuality] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);
  const [format, setFormat] = useState<string>('image/jpeg');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [batchProcessing, setBatchProcessing] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [batchTotal, setBatchTotal] = useState<number>(0);
  const [processingComplete, setProcessingComplete] = useState<boolean>(false);
  const [processedFiles, setProcessedFiles] = useState<{name: string, originalSize: number, compressedSize: number, compressionRatio: number, fileIndex: number, compressedUrl?: string}[]>([]);
  
  const [viewMode, setViewMode] = useState<'original' | 'compressed'>('original');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedFile = files[currentFileIndex] || null;

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileList = Array.from(event.target.files);
      const validFiles = fileList.filter(file => file.type.match('image.*'));
      
      if (validFiles.length === 0) {
        setSnackbarSeverity('error');
        setSnackbarMessage('请选择图片文件（JPEG, PNG, GIF等）');
        setSnackbarOpen(true);
        return;
      }
      
      if (validFiles.length !== fileList.length) {
        setSnackbarSeverity('warning');
        setSnackbarMessage(`已过滤掉 ${fileList.length - validFiles.length} 个非图片文件`);
        setSnackbarOpen(true);
      }
      
      handleClear(true); // Soft clear, keep settings

      setFiles(validFiles);
      setBatchTotal(validFiles.length);
      setCurrentFileIndex(0);
      
      if (validFiles.length > 1) {
        setBatchMode(true);
      } else {
        setBatchMode(false);
      }
      
      loadFilePreview(validFiles[0]);
    }
  };

  // 加载文件预览
  const loadFilePreview = (file: File) => {
    setOriginalSize(file.size);
    setCompressedUrl(null);
    setCompressedSize(0);
    setCompressionRatio(0);
    setViewMode('original');
    
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.onerror = () => {
      console.error('无法读取文件:', file.name);
      if (batchProcessing) {
        processNextFile(currentFileIndex);
      }
    };
    reader.readAsDataURL(file);
  };

  // 移动到下一个文件 (在批量处理链中使用)
  const processNextFile = (currentIndex: number) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= files.length) {
        finishBatchProcessing();
        return;
    }
    // 使用setTimeout确保状态更新和UI响应
    setTimeout(() => {
        processFileAtIndex(nextIndex);
    }, 50); // 短暂延迟以避免UI卡顿
  };

  // 完成批处理
  const finishBatchProcessing = () => {
    setBatchProcessing(false);
    setProcessingComplete(true);
    setLoading(false);
    setSnackbarSeverity('success');
    setSnackbarMessage(`批量处理完成! 共处理 ${processedFiles.length} 个文件`);
    setSnackbarOpen(true);
  };

  // 统一的压缩核心函数
  const runCompression = () => {
    if (!selectedFile || !previewUrl) {
      setSnackbarSeverity('error');
      setSnackbarMessage('请先选择图片');
      setSnackbarOpen(true);
      return;
    }

    if (!batchProcessing) { // 只有在非自动批量处理时才显示独立加载状态
        setLoading(true);
    }
    
    const img = new Image();
    img.src = previewUrl;

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;
        let needResize = false;

        if (width > maxWidth) {
          height = Math.floor(height * (maxWidth / width));
          width = maxWidth;
          needResize = true;
        }

        if (height > maxHeight) {
          width = Math.floor(width * (maxHeight / height));
          height = maxHeight;
          needResize = true;
        }

        const canvas = canvasRef.current;
        if (!canvas) throw new Error('Canvas 元素不存在');
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('无法获取 Canvas 上下文');

        if (format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.clearRect(0, 0, width, height);
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        const actualQuality = format === 'image/png' ? 1.0 : quality / 100;
        const compressedDataUrl = canvas.toDataURL(format, actualQuality);
        const compSize = calculateBase64Size(compressedDataUrl);

        let snackbarMsg = '图片压缩成功!';
        let snackbarSev: 'success' | 'info' | 'warning' = 'success';
        let currentCompressedUrl = compressedDataUrl;
        let currentCompressedSize = compSize;
        let currentRatio = Math.round((1 - compSize / originalSize) * 100);

        if (compSize >= originalSize && !needResize && format === selectedFile.type) {
          currentCompressedUrl = previewUrl;
          currentCompressedSize = originalSize;
          currentRatio = 0;
          snackbarMsg = '图片已经是最优化的，无需进一步压缩';
          snackbarSev = 'info';
        } else if (compSize > originalSize) {
          currentRatio = Math.round((compSize / originalSize - 1) * 100) * -1;
          snackbarMsg = '调整后图片大小增加，请考虑使用不同的设置';
          snackbarSev = 'warning';
        }

        setCompressedUrl(currentCompressedUrl);
        setCompressedSize(currentCompressedSize);
        setCompressionRatio(currentRatio);
        setViewMode('compressed');

        const processedFile = {
            name: selectedFile.name,
            originalSize: originalSize,
            compressedSize: currentCompressedSize,
            compressionRatio: currentRatio,
            fileIndex: currentFileIndex,
            compressedUrl: currentCompressedUrl
        };

        setProcessedFiles(prev => {
            const existingIndex = prev.findIndex(f => f.fileIndex === currentFileIndex);
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = processedFile;
              return updated;
            } else {
              return [...prev, processedFile];
            }
        });
        
        if (!batchProcessing) {
            setLoading(false);
            setSnackbarSeverity(snackbarSev);
            setSnackbarMessage(snackbarMsg);
            setSnackbarOpen(true);
        } else {
            // *** 这是关键的修复点 ***
            // 成功处理完一个文件后，调用 processNextFile 继续处理链条
            processNextFile(currentFileIndex);
        }

      } catch (error) {
        console.error('压缩过程中发生错误:', error);
        if (!batchProcessing) {
            setLoading(false);
            setSnackbarSeverity('error');
            setSnackbarMessage('图片压缩过程中发生错误');
            setSnackbarOpen(true);
        } else {
            processNextFile(currentFileIndex); // 出错了也要继续下一个
        }
      }
    };

    img.onerror = () => {
      console.error('图片加载失败:', selectedFile.name);
      if (!batchProcessing) {
        setLoading(false);
        setSnackbarSeverity('error');
        setSnackbarMessage('图片加载失败');
        setSnackbarOpen(true);
      } else {
        processNextFile(currentFileIndex); // 加载失败，继续下一个
      }
    };
  };

  // 全部压缩
  const handleCompressAll = () => {
    if (files.length === 0) return;
    
    setBatchProcessing(true);
    setProcessingComplete(false);
    setProcessedFiles([]);
    setBatchProgress(0);
    
    // 从第一个文件开始处理
    processFileAtIndex(0);
  };
  
  // 处理指定索引的文件
  const processFileAtIndex = (index: number) => {
    setBatchProgress(index);
    setCurrentFileIndex(index);
    
    const file = files[index];
    const reader = new FileReader();
    
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
      setOriginalSize(file.size);
      
      // 使用 setTimeout 确保 previewUrl 状态更新后才执行压缩
      // 这有助于UI预览的同步
      setTimeout(() => {
        runCompression();
      }, 0);
    };
    reader.onerror = () => {
      console.error('无法读取文件:', file.name);
      processNextFile(index);
    };
    
    reader.readAsDataURL(file);
  };
  
  // 切换预览模式
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'original' ? 'compressed' : 'original');
  };

  // 处理选择特定文件
  const handleSelectFile = (index: number) => {
    if (index >= 0 && index < files.length) {
      setCurrentFileIndex(index);
      loadFilePreview(files[index]);
      
      const processed = processedFiles.find(f => f.fileIndex === index);
      if (processed && processed.compressedUrl) {
        setCompressedUrl(processed.compressedUrl);
        setCompressedSize(processed.compressedSize);
        setCompressionRatio(processed.compressionRatio);
        setViewMode('compressed');
      }
    }
  };

  // 处理下载所有压缩后的图片
  const handleDownloadAll = () => {
    if (processedFiles.length === 0) {
      setSnackbarSeverity('warning');
      setSnackbarMessage('没有可下载的文件');
      setSnackbarOpen(true);
      return;
    }
    
    setLoading(true);
    setSnackbarSeverity('info');
    setSnackbarMessage('正在创建压缩包...');
    setSnackbarOpen(true);
    
    try {
      const zip = new JSZip();
      let fileCount = 0;
      
      processedFiles.forEach(file => {
        if (!file.compressedUrl) return;
        
        try {
          const imageData = file.compressedUrl.split(',')[1];
          const fileType = file.compressedUrl.substring(file.compressedUrl.indexOf(':') + 1, file.compressedUrl.indexOf(';'));

          const fileExtension = fileType === 'image/jpeg' ? 'jpg' : 
                              fileType === 'image/png' ? 'png' : 
                              fileType === 'image/webp' ? 'webp' : 'jpg';
          
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const fileName = `${baseName}_compressed.${fileExtension}`;
          
          zip.file(fileName, imageData, {base64: true});
          fileCount++;
        } catch (error) {
          console.error(`添加文件 ${file.name} 到压缩包时出错:`, error);
        }
      });
      
      if (fileCount === 0) {
        setLoading(false);
        setSnackbarSeverity('error');
        setSnackbarMessage('创建压缩包失败：没有有效的文件可添加');
        setSnackbarOpen(true);
        return;
      }
      
      zip.generateAsync({type: 'blob'})
        .then(content => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = `compressed_images_${new Date().getTime()}.zip`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setTimeout(() => URL.revokeObjectURL(link.href), 100);
          
          setLoading(false);
          setSnackbarSeverity('success');
          setSnackbarMessage(`成功打包下载 ${fileCount} 个文件`);
          setSnackbarOpen(true);
        })
        .catch(error => {
          console.error('生成ZIP文件时出错:', error);
          setLoading(false);
          setSnackbarSeverity('error');
          setSnackbarMessage('创建压缩包失败');
          setSnackbarOpen(true);
        });
        
    } catch (error) {
      console.error('创建ZIP文件时出错:', error);
      setLoading(false);
      setSnackbarSeverity('error');
      setSnackbarMessage('创建压缩包失败');
      setSnackbarOpen(true);
    }
  };

  // 取消批处理
  const handleCancelBatchProcessing = () => {
    setBatchProcessing(false);
    setLoading(false);
    setSnackbarSeverity('info');
    setSnackbarMessage('批量处理已取消');
    setSnackbarOpen(true);
  };

  // 处理清除
  const handleClear = (soft = false) => {
    setFiles([]);
    setCurrentFileIndex(-1);
    setPreviewUrl(null);
    setCompressedUrl(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setCompressionRatio(0);
    setBatchMode(false);
    setBatchProgress(0);
    setBatchTotal(0);
    setProcessedFiles([]);
    setViewMode('original');
    setBatchProcessing(false);
    setProcessingComplete(false);
    
    if (!soft && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 渲染函数和其他UI部分保持不变
  // ...
  // UI代码从这里开始，与您提供的代码基本相同，除了几个按钮的onClick事件
  // 和disabled状态的逻辑调整。

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CompressIcon color="primary" /> 图片压缩工具
            </Typography>
            <Typography variant="body2" color="text.secondary">
              通过调整图片质量和尺寸来减小图片文件大小，适用于网站优化和社交媒体分享。支持批量压缩多个图片。
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
          />
          <label htmlFor="image-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ 
                py: 2, 
                height: selectedFile ? 'auto' : 150,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed',
                borderColor: 'primary.main',
                bgcolor: 'background.default',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderStyle: 'dashed'
                }
              }}
            >
              {selectedFile ? (
                <Typography variant="body2">
                  {batchMode ? `已选择 ${files.length} 个文件，当前处理: ${selectedFile.name}` : `选择的文件: ${selectedFile.name}`} ({formatFileSize(originalSize)})
                </Typography>
              ) : (
                <>
                  <ImageIcon sx={{ fontSize: 48, mb: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">选择或拖放图片</Typography>
                  <Typography variant="caption" color="text.secondary">
                    支持 JPEG, PNG, GIF 等格式，可选择多个文件
                  </Typography>
                </>
              )}
            </Button>
          </label>
        </Grid>

        {batchMode && files.length > 0 && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                批量文件列表 (点击选择处理)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {files.map((file, index) => {
                  const isProcessed = processedFiles.some(p => p.fileIndex === index);
                  const isSelected = currentFileIndex === index;
                  
                  return (
                    <Chip
                      key={index}
                      label={`${index + 1}. ${file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name}`}
                      onClick={() => handleSelectFile(index)}
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      icon={isProcessed ? <CheckCircleIcon fontSize="small" /> : undefined}
                      sx={{ 
                        bgcolor: isProcessed ? 'success.lightest' : undefined,
                        borderColor: isProcessed ? 'success.main' : undefined,
                        mb: 1,
                        '& .MuiChip-icon': { color: 'success.main' }
                      }}
                    />
                  );
                })}
              </Box>
              <Box sx={{ display: 'flex', mt: 2, gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCompressAll}
                  disabled={batchProcessing}
                  startIcon={batchProcessing ? <CircularProgress size={20} /> : <AutorenewIcon />}
                >
                  {batchProcessing ? '批量压缩中...' : '全部压缩'}
                </Button>
                {processedFiles.length > 0 && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<ZipIcon />}
                    onClick={handleDownloadAll}
                    disabled={loading || batchProcessing}
                  >
                    打包下载
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleClear(false)}
                >
                  清除全部
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}

        {selectedFile && (
          <>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle2" gutterBottom>
                  压缩设置
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography id="quality-slider" gutterBottom>
                    压缩质量: {quality}%
                  </Typography>
                  <Slider
                    value={quality}
                    onChange={(_event: Event, newValue: number | number[]) => setQuality(newValue as number)}
                    aria-labelledby="quality-slider"
                    min={10}
                    max={100}
                    step={5}
                    marks={[
                      { value: 10, label: '低' },
                      { value: 50, label: '中' },
                      { value: 100, label: '高' }
                    ]}
                  />
                  <Typography variant="caption" color="text.secondary">
                    注：对于PNG格式，质量设置不会产生影响，因为PNG使用无损压缩
                  </Typography>
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <TextField
                      label="最大宽度"
                      type="number"
                      value={maxWidth}
                      onChange={(e) => setMaxWidth(parseInt(e.target.value) || 1)}
                      fullWidth
                      variant="outlined"
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="最大高度"
                      type="number"
                      value={maxHeight}
                      onChange={(e) => setMaxHeight(parseInt(e.target.value) || 1)}
                      fullWidth
                      variant="outlined"
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>
                </Grid>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="format-select-label">输出格式</InputLabel>
                  <Select
                    labelId="format-select-label"
                    value={format}
                    label="输出格式"
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <MenuItem value="image/jpeg">JPEG (有损压缩，适合照片)</MenuItem>
                    <MenuItem value="image/png">PNG (无损压缩，适合图标/插图)</MenuItem>
                    <MenuItem value="image/webp">WebP (高压缩率，但兼容性较低)</MenuItem>
                  </Select>
                </FormControl>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={runCompression}
                  disabled={loading || batchProcessing}
                  startIcon={loading ? <CircularProgress size={20} /> : <CompressIcon />}
                  fullWidth
                >
                  {loading ? '压缩中...' : '压缩当前图片'}
                </Button>
                
                {compressedUrl && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      原始大小: {formatFileSize(originalSize)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {compressionRatio >= 0 ? (
                        <>压缩后: {formatFileSize(compressedSize)} (减小了 {compressionRatio}%)</>
                      ) : (
                        <>压缩后: {formatFileSize(compressedSize)} (增加了 {Math.abs(compressionRatio)}%)</>
                      )}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => {
                          if (!compressedUrl) return;
                          
                          const link = document.createElement('a');
                          link.href = compressedUrl;
                          
                          const extension = format === 'image/jpeg' ? 'jpg' : 
                                           format === 'image/png' ? 'png' : 
                                           format === 'image/webp' ? 'webp' : 'jpg';
                          
                          const originalName = selectedFile?.name || 'compressed_image';
                          const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
                          link.download = `${baseName}_compressed.${extension}`;
                          
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        下载
                      </Button>
                      <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={viewMode === 'original' ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        onClick={toggleViewMode}
                      >
                        {viewMode === 'original' ? '查看压缩图' : '查看原图'}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">
                    {compressedUrl && viewMode === 'compressed' ? '压缩后预览' : '原始图片预览'}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    mt: 2, 
                    width: '100%', 
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    bgcolor: '#f5f5f5',
                    borderRadius: 1
                  }}
                >
                  {(compressedUrl && viewMode === 'compressed') ? (
                    <img src={compressedUrl} alt="压缩后预览" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
                  ) : previewUrl ? (
                    <img src={previewUrl} alt="原始图片预览" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
                  ) : (
                    <Typography variant="body2" color="text.secondary">无图片预览</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </>
        )}

        {batchMode && batchProcessing && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" gutterBottom>
                批量处理进度: {batchProgress + 1}/{batchTotal}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={((batchProgress + 1) / batchTotal) * 100} 
                sx={{ mb: 2 }}
              />
              <Typography variant="caption" sx={{ display: 'block', mb: 2 }}>
                正在处理: {files[currentFileIndex]?.name || '...'}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleCancelBatchProcessing}
              >
                取消批处理
              </Button>
            </Paper>
          </Grid>
        )}

        {processedFiles.length > 0 && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>处理结果:</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>文件名</TableCell>
                      <TableCell align="right">原始大小</TableCell>
                      <TableCell align="right">压缩后大小</TableCell>
                      <TableCell align="right">压缩率</TableCell>
                      <TableCell align="right">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {processedFiles.sort((a,b) => a.fileIndex - b.fileIndex).map((file) => (
                      <TableRow key={file.fileIndex} selected={file.fileIndex === currentFileIndex}>
                        <TableCell component="th" scope="row">
                          <Button 
                            color="inherit" 
                            onClick={() => handleSelectFile(file.fileIndex)}
                            sx={{ textTransform: 'none', justifyContent: 'flex-start', px: 0, textAlign: 'left' }}
                          >
                            {file.name}
                          </Button>
                        </TableCell>
                        <TableCell align="right">{formatFileSize(file.originalSize)}</TableCell>
                        <TableCell align="right">{formatFileSize(file.compressedSize)}</TableCell>
                        <TableCell align="right">
                          {file.compressionRatio >= 0 ? (
                            <Typography variant="body2" color="success.main">-{file.compressionRatio}%</Typography>
                          ) : (
                            <Typography variant="body2" color="error.main">+{Math.abs(file.compressionRatio)}%</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {file.compressedUrl && (
                            <IconButton
                              size="small"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = file.compressedUrl!;
                                const fileType = file.compressedUrl!.substring(file.compressedUrl!.indexOf(':') + 1, file.compressedUrl!.indexOf(';'));
                                const extension = fileType === 'image/jpeg' ? 'jpg' : fileType === 'image/png' ? 'png' : 'webp';
                                const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                                link.download = `${baseName}_compressed.${extension}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <FileDownloadIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}

        {processingComplete && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.lightest' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <CheckCircleIcon color="success" />
                <Typography variant="body1" color="success.main">
                  批量处理已完成! 共处理 {processedFiles.length} 个文件。
                </Typography>
                {processedFiles.length > 0 && (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<ZipIcon />}
                    onClick={handleDownloadAll}
                    disabled={loading || batchProcessing}
                    sx={{ ml: 'auto' }}
                  >
                    打包下载所有图片
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
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