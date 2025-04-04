'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import {
  FileUploadOutlined as UploadIcon,
  FileDownloadOutlined as DownloadIcon,
  DeleteOutline as DeleteIcon,
  AutorenewOutlined as ConvertIcon,
  CheckCircleOutlined as CheckCircleIcon,
  CancelOutlined as CancelIcon,
  FolderZipOutlined as ZipIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import ImageIcon from '@mui/icons-material/Image';
import JSZip from 'jszip';

// 文件大小格式化
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 支持的图片格式
const supportedFormats = [
  { value: 'image/jpeg', label: 'JPEG', extension: 'jpg' },
  { value: 'image/png', label: 'PNG', extension: 'png' },
  { value: 'image/webp', label: 'WebP', extension: 'webp' },
  { value: 'image/gif', label: 'GIF', extension: 'gif' },
  { value: 'image/bmp', label: 'BMP', extension: 'bmp' }
];

// 从MIME类型获取扩展名
const getExtensionFromMimeType = (mimeType: string): string => {
  const format = supportedFormats.find(f => f.value === mimeType);
  return format ? format.extension : 'jpg';
};

// 从文件名获取扩展名
const getExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

interface ProcessedFile {
  name: string;
  originalSize: number;
  convertedSize: number;
  originalFormat: string;
  convertedFormat: string;
  convertedUrl?: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  error?: string;
}

export default function ImageConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('image/jpeg');
  const [converting, setConverting] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [activeTab, setActiveTab] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileList = Array.from(event.target.files);
      
      // 检查所有文件类型
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
      
      setFiles(validFiles);
      
      // 初始化处理文件列表
      const newProcessedFiles = validFiles.map(file => {
        const formatLabel = supportedFormats.find(f => f.value === file.type)?.label || '未知';
        return {
          name: file.name,
          originalSize: file.size,
          convertedSize: 0,
          originalFormat: formatLabel,
          convertedFormat: '',
          status: 'waiting' as const
        };
      });
      
      setProcessedFiles(newProcessedFiles);
      setActiveTab(1); // 切换到文件列表标签
    }
  };

  // 处理选择文件按钮点击
  const handleSelectFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 处理格式变更
  const handleFormatChange = (event: any) => {
    setSelectedFormat(event.target.value);
  };

  // 开始转换所有文件
  const handleConvertAll = async () => {
    if (files.length === 0) {
      setSnackbarSeverity('error');
      setSnackbarMessage('请先选择图片文件');
      setSnackbarOpen(true);
      return;
    }

    const targetFormatLabel = supportedFormats.find(f => f.value === selectedFormat)?.label || '未知';
    
    // 更新所有文件的转换格式
    setProcessedFiles(prevFiles => 
      prevFiles.map(file => ({
        ...file,
        convertedFormat: targetFormatLabel,
        status: 'waiting' as const
      }))
    );
    
    setConverting(true);
    setCurrentIndex(0);
    setProgress(0);
    
    // 开始处理第一个文件
    await processFile(0);
  };

  // 处理单个文件
  const processFile = async (index: number) => {
    if (index >= files.length) {
      setConverting(false);
      setSnackbarSeverity('success');
      setSnackbarMessage(`已成功转换 ${files.length} 个文件`);
      setSnackbarOpen(true);
      return;
    }
    
    setCurrentIndex(index);
    setProgress(Math.round((index / files.length) * 100));
    
    // 更新当前文件状态为处理中
    setProcessedFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles[index] = { ...newFiles[index], status: 'processing' };
      return newFiles;
    });
    
    try {
      const file = files[index];
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            handleFileError(index, '无法创建Canvas上下文');
            return;
          }
          
          // 绘制图像
          ctx.drawImage(img, 0, 0);
          
          // 转换为目标格式
          try {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  handleFileError(index, '转换失败');
                  return;
                }
                
                const url = URL.createObjectURL(blob);
                
                // 更新已处理文件信息
                setProcessedFiles(prevFiles => {
                  const newFiles = [...prevFiles];
                  newFiles[index] = {
                    ...newFiles[index],
                    convertedSize: blob.size,
                    convertedUrl: url,
                    status: 'completed'
                  };
                  return newFiles;
                });
                
                // 处理下一个文件
                processFile(index + 1);
              },
              selectedFormat,
              1.0 // 保持最高质量
            );
          } catch (err) {
            handleFileError(index, '转换过程中出错');
          }
        };
        
        img.onerror = () => {
          handleFileError(index, '无法加载图片');
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        handleFileError(index, '读取文件失败');
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      handleFileError(index, '处理文件时出错');
    }
  };

  // 处理文件错误
  const handleFileError = (index: number, errorMessage: string) => {
    setProcessedFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles[index] = {
        ...newFiles[index],
        status: 'error',
        error: errorMessage
      };
      return newFiles;
    });
    
    // 继续处理下一个文件
    processFile(index + 1);
  };

  // 取消转换
  const handleCancelConversion = () => {
    setConverting(false);
    setSnackbarSeverity('info');
    setSnackbarMessage('已取消转换');
    setSnackbarOpen(true);
  };

  // 下载单个转换后的文件
  const handleDownloadFile = (index: number) => {
    const file = processedFiles[index];
    if (file.status !== 'completed' || !file.convertedUrl) {
      setSnackbarSeverity('error');
      setSnackbarMessage('文件尚未转换完成，无法下载');
      setSnackbarOpen(true);
      return;
    }
    
    const extension = getExtensionFromMimeType(selectedFormat);
    const originalName = file.name;
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const newFileName = `${baseName}.${extension}`;
    
    const link = document.createElement('a');
    link.href = file.convertedUrl;
    link.download = newFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 下载所有转换后的文件
  const handleDownloadAll = async () => {
    const completedFiles = processedFiles.filter(file => file.status === 'completed' && file.convertedUrl);
    
    if (completedFiles.length === 0) {
      setSnackbarSeverity('error');
      setSnackbarMessage('没有可下载的文件');
      setSnackbarOpen(true);
      return;
    }
    
    if (completedFiles.length === 1) {
      // 只有一个文件，直接下载
      handleDownloadFile(processedFiles.findIndex(file => file.status === 'completed' && file.convertedUrl));
      return;
    }
    
    // 多个文件，创建ZIP压缩包
    try {
      setSnackbarSeverity('info');
      setSnackbarMessage('正在准备ZIP压缩包...');
      setSnackbarOpen(true);
      
      const zip = new JSZip();
      const extension = getExtensionFromMimeType(selectedFormat);
      
      // 添加所有文件到ZIP
      for (let i = 0; i < completedFiles.length; i++) {
        const file = completedFiles[i];
        if (!file.convertedUrl) continue;
        
        // 获取Blob数据
        const response = await fetch(file.convertedUrl);
        const blob = await response.blob();
        
        // 生成新文件名
        const originalName = file.name;
        const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        const newFileName = `${baseName}.${extension}`;
        
        // 添加到ZIP
        zip.file(newFileName, blob);
      }
      
      // 生成ZIP文件
      const content = await zip.generateAsync({ type: 'blob' });
      
      // 下载ZIP
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `images-converted-to-${extension}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbarSeverity('success');
      setSnackbarMessage('已成功下载ZIP压缩包');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('创建ZIP失败', err);
      setSnackbarSeverity('error');
      setSnackbarMessage('创建ZIP压缩包失败');
      setSnackbarOpen(true);
    }
  };

  // 清除所有文件
  const handleClear = () => {
    // 释放所有URL
    processedFiles.forEach(file => {
      if (file.convertedUrl) {
        URL.revokeObjectURL(file.convertedUrl);
      }
    });
    
    setFiles([]);
    setProcessedFiles([]);
    setCurrentIndex(0);
    setProgress(0);
    setConverting(false);
    setActiveTab(0); // 切换回上传标签
  };

  // 处理标签切换
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 获取状态标签
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Chip size="small" label="等待中" color="default" />;
      case 'processing':
        return <Chip size="small" label="处理中" color="primary" icon={<CircularProgress size={14} />} />;
      case 'completed':
        return <Chip size="small" label="已完成" color="success" icon={<CheckCircleIcon />} />;
      case 'error':
        return <Chip size="small" label="错误" color="error" icon={<CancelIcon />} />;
      default:
        return <Chip size="small" label="未知" />;
    }
  };

  return (
    <Box>
      {/* 隐藏的文件输入 */}
      <input
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      
      {/* 隐藏的Canvas用于处理图片 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* 标签页 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="上传图片" />
          <Tab label={`文件列表 (${files.length})`} disabled={files.length === 0} />
        </Tabs>
      </Box>
      
      {/* 上传标签页内容 */}
      {activeTab === 0 && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            border: '2px dashed #ccc',
            borderRadius: 2,
            textAlign: 'center',
            bgcolor: 'background.default'
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>上传图片</Typography>
            <Typography variant="body2" color="text.secondary">
              支持JPEG、PNG、WebP、GIF、BMP等常见图片格式，可多选
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Button 
              variant="contained" 
              startIcon={<UploadIcon />}
              onClick={handleSelectFilesClick}
            >
              选择图片文件
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <InfoIcon fontSize="small" sx={{ mr: 0.5 }} />
            最大支持上传的单个文件大小为10MB
          </Typography>
        </Paper>
      )}
      
      {/* 文件列表标签页内容 */}
      {activeTab === 1 && (
        <Box>
          {/* 转换设置 */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>转换设置</Typography>
                <FormControl fullWidth>
                  <InputLabel>目标格式</InputLabel>
                  <Select
                    value={selectedFormat}
                    onChange={handleFormatChange}
                    label="目标格式"
                    disabled={converting}
                  >
                    {supportedFormats.map((format) => (
                      <MenuItem key={format.value} value={format.value}>
                        {format.label} (.{format.extension})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ConvertIcon />}
                    onClick={handleConvertAll}
                    disabled={converting || files.length === 0}
                  >
                    开始转换
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={handleClear}
                    disabled={converting}
                  >
                    清除所有
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          
          {/* 转换进度 */}
          {converting && (
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">转换进度：{`${currentIndex + 1}/${files.length}`}</Typography>
                  <Typography variant="body2">{progress}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    variant="outlined" 
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelConversion}
                  >
                    取消转换
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}
          
          {/* 文件列表 */}
          <Paper elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>文件名</TableCell>
                    <TableCell>原始格式</TableCell>
                    <TableCell>目标格式</TableCell>
                    <TableCell>原始大小</TableCell>
                    <TableCell>转换后大小</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {processedFiles.map((file, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </TableCell>
                      <TableCell>{file.originalFormat}</TableCell>
                      <TableCell>{file.convertedFormat}</TableCell>
                      <TableCell>{formatFileSize(file.originalSize)}</TableCell>
                      <TableCell>
                        {file.status === 'completed' ? formatFileSize(file.convertedSize) : '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusChip(file.status)}
                        {file.error && (
                          <Typography variant="caption" color="error" display="block">
                            {file.error}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          color="primary"
                          disabled={file.status !== 'completed'}
                          onClick={() => handleDownloadFile(index)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
          {/* 批量下载按钮 */}
          {processedFiles.some(file => file.status === 'completed') && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ZipIcon />}
                onClick={handleDownloadAll}
                disabled={converting}
              >
                下载全部已转换的文件
              </Button>
            </Box>
          )}
        </Box>
      )}
      
      {/* 通知信息 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 