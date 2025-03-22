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

export default function ImageCompress() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);
  const [loading, setLoading] = useState<boolean>(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressionRatio, setCompressionRatio] = useState<number>(0);
  const [format, setFormat] = useState<string>('image/jpeg');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [originalImageBlob, setOriginalImageBlob] = useState<Blob | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(-1);
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [batchTotal, setBatchTotal] = useState<number>(0);
  const [processedFiles, setProcessedFiles] = useState<{name: string, originalSize: number, compressedSize: number, compressionRatio: number, fileIndex: number, compressedUrl?: string}[]>([]);
  const [viewMode, setViewMode] = useState<'original' | 'compressed'>('original');
  const [batchProcessing, setBatchProcessing] = useState<boolean>(false);
  const [processingComplete, setProcessingComplete] = useState<boolean>(false);
  const [processingTimeout, setProcessingTimeout] = useState<NodeJS.Timeout | null>(null);

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
      setBatchTotal(validFiles.length);
      
      if (validFiles.length > 1) {
        // 批量模式
        setBatchMode(true);
        setCurrentFileIndex(0);
        setProcessedFiles([]);
        
        // 加载第一个文件预览
        loadFilePreview(validFiles[0]);
      } else {
        // 单文件模式
        setBatchMode(false);
        setCurrentFileIndex(-1);
        loadFilePreview(validFiles[0]);
      }
    }
  };

  // 加载文件预览
  const loadFilePreview = (file: File) => {
    setSelectedFile(file);
    setOriginalSize(file.size);
    setOriginalImageBlob(file);
    setCompressedUrl(null);
    setCompressedSize(0);
    setCompressionRatio(0);
    
    // 创建预览
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.onerror = () => {
      console.error('无法读取文件:', file.name);
      
      // 如果在批处理模式下，跳过这个文件继续处理下一个
      if (batchProcessing && currentFileIndex < files.length - 1) {
        moveToNextFile();
      } else if (batchProcessing) {
        finishBatchProcessing();
      }
    };
    reader.readAsDataURL(file);
  };

  // 移动到下一个文件
  const moveToNextFile = () => {
    if (currentFileIndex >= files.length - 1) {
      finishBatchProcessing();
      return;
    }
    
    const nextIndex = currentFileIndex + 1;
    setCurrentFileIndex(nextIndex);
    setBatchProgress(prev => prev + 1);
    
    // 清除之前的超时
    if (processingTimeout) {
      clearTimeout(processingTimeout);
    }
    
    // 使用setTimeout避免状态更新问题
    const timeout = setTimeout(() => {
      if (nextIndex < files.length) {
        loadFilePreview(files[nextIndex]);
        // 设置一个超时保护，如果10秒后还没处理完，就继续下一个
        const protectionTimeout = setTimeout(() => {
          if (batchProcessing) {
            console.log('处理超时，跳到下一个文件');
            moveToNextFile();
          }
        }, 10000);
        setProcessingTimeout(protectionTimeout);
      }
    }, 300);
  };

  // 完成批处理
  const finishBatchProcessing = () => {
    console.log('开始完成批处理流程');
    
    // 捕获当前处理文件数组的引用
    setProcessedFiles(currentProcessedFiles => {
      const processedCount = currentProcessedFiles.length;
      console.log('批量处理完成，当前共处理', processedCount, '个文件');
      
      // 使用当前处理文件数组更新UI
      setBatchProcessing(false);
      setProcessingComplete(true);
      setLoading(false);
      setSnackbarSeverity('success');
      setSnackbarMessage(`批量处理完成! 共处理 ${processedCount} 个文件`);
      setSnackbarOpen(true);
      
      // 返回原数组，不做修改
      return currentProcessedFiles;
    });
    
    // 清除超时
    if (processingTimeout) {
      clearTimeout(processingTimeout);
      setProcessingTimeout(null);
    }
  };

  // 单张图片压缩
  const handleSingleCompress = () => {
    if (!selectedFile || !previewUrl) {
      setSnackbarSeverity('error');
      setSnackbarMessage('请先选择图片');
      setSnackbarOpen(true);
      return;
    }
    handleCompress();
  };

  // 处理压缩质量滑块变化
  const handleQualityChange = (_event: Event, newValue: number | number[]) => {
    setQuality(newValue as number);
  };

  // 处理最大宽度输入变化
  const handleMaxWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setMaxWidth(value);
    }
  };

  // 处理最大高度输入变化
  const handleMaxHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setMaxHeight(value);
    }
  };

  // 处理格式变化
  const handleFormatChange = (event: any) => {
    setFormat(event.target.value);
  };

  // 全部压缩
  const handleCompressAll = () => {
    if (files.length === 0) return;
    
    console.log('开始批量处理，重置状态');
    
    // 复位状态 - 重要：先设置其他状态，再设置处理文件数组
    setBatchProcessing(true);
    setProcessingComplete(false);
    setCurrentFileIndex(0);
    setBatchProgress(0);
    
    // 清空处理文件数组 - 使用单独的setState以确保状态更新
    setProcessedFiles([]);
    
    // 清除之前的超时
    if (processingTimeout) {
      clearTimeout(processingTimeout);
      setProcessingTimeout(null);
    }
    
    // 给状态一些时间更新
    setTimeout(() => {
      console.log('开始批量处理，共', files.length, '个文件');
      processFileAtIndex(0);
    }, 100);
  };
  
  // 处理指定索引的文件
  const processFileAtIndex = (index: number) => {
    if (index >= files.length) {
      console.log("所有文件处理完毕，调用finishBatchProcessing");
      finishBatchProcessing();
      return;
    }
    
    console.log(`处理第 ${index + 1}/${files.length} 个文件：${files[index].name}`);
    setCurrentFileIndex(index);
    setBatchProgress(index);
    
    // 直接处理文件，不进行异步预览加载
    const file = files[index];
    setSelectedFile(file);
    setOriginalSize(file.size);
    
    // 创建文件的数据URL
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
      
      // 预览加载完成后直接开始压缩
      console.log('文件预览已加载，开始压缩');
      compressImage(dataUrl, file, index);
    };
    reader.onerror = () => {
      console.error('无法读取文件:', file.name);
      processNextFile(index);
    };
    
    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('读取文件时出错:', error);
      processNextFile(index);
    }
  };
  
  // 处理下一个文件
  const processNextFile = (currentIndex: number) => {
    // 更新进度
    setBatchProgress(prev => currentIndex + 1);
    // 直接处理下一个文件
    processFileAtIndex(currentIndex + 1);
  };
  
  // 压缩图片核心逻辑
  const compressImage = (imageUrl: string, file: File, fileIndex: number) => {
    console.log(`开始压缩文件[${fileIndex}]: ${file.name}`);
    setLoading(true);
    
    // 创建图像对象
    const img = new Image();
    
    // 图片加载成功处理
    img.onload = () => {
      console.log(`文件[${fileIndex}] ${file.name} 加载成功，尺寸:`, img.width, 'x', img.height);
      
      try {
        // 检查是否需要调整大小
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
        
        // 创建canvas元素
        const canvas = canvasRef.current;
        if (!canvas) {
          console.error(`文件[${fileIndex}] Canvas元素不存在`);
          processNextFile(fileIndex);
          return;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制图像到canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error(`文件[${fileIndex}] 无法获取Canvas上下文`);
          processNextFile(fileIndex);
          return;
        }
        
        // 对于PNG和WebP，使用透明背景；对于JPEG，使用白色背景
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.clearRect(0, 0, width, height);
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // 确定实际使用的压缩质量
        // PNG格式使用lossless压缩，所以quality参数不影响PNG
        const actualQuality = format === 'image/png' ? 1.0 : quality / 100;
        
        // 将canvas转换为压缩后的数据URL
        const compressedDataUrl = canvas.toDataURL(format, actualQuality);
        
        // 计算压缩后的大小 - 使用blob方式
        const byteString = atob(compressedDataUrl.split(',')[1]);
        const mimeType = compressedDataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], {type: mimeType});
        const compSize = blob.size;
        
        console.log(`文件[${fileIndex}] ${file.name} 压缩完成，原始大小:`, formatFileSize(file.size), '压缩后:', formatFileSize(compSize));
        
        // 保存处理结果
        const compressionRatio = compSize < file.size ? 
          Math.round((1 - compSize / file.size) * 100) : 
          Math.round((compSize / file.size - 1) * 100) * -1;
          
        const processedFile = {
          name: file.name,
          originalSize: file.size,
          compressedSize: compSize,
          compressionRatio: compressionRatio,
          fileIndex: fileIndex,
          compressedUrl: compressedDataUrl
        };
        
        // 更新UI状态
        if (fileIndex === currentFileIndex) {
          setCompressedUrl(compressedDataUrl);
          setCompressedSize(compSize);
          setCompressionRatio(compressionRatio);
          setViewMode('compressed');
        }
        
        // 直接更新全局处理文件数组 - 使用函数形式确保获取最新状态
        setProcessedFiles(prev => {
          console.log(`添加/更新处理文件[${fileIndex}], 当前列表长度:`, prev.length);
          const existingIndex = prev.findIndex(f => f.fileIndex === fileIndex);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = processedFile;
            return updated;
          } else {
            return [...prev, processedFile];
          }
        });
        
        // 继续处理下一个文件
        processNextFile(fileIndex);
      } catch (error) {
        console.error(`文件[${fileIndex}] ${file.name} 处理过程中出错:`, error);
        processNextFile(fileIndex);
      }
    };
    
    // 图片加载失败处理
    img.onerror = (error) => {
      console.error(`文件[${fileIndex}] ${file.name} 加载失败:`, error);
      processNextFile(fileIndex);
    };
    
    // 设置图片加载超时处理
    const imgLoadTimeout = setTimeout(() => {
      if (!img.complete) {
        console.log(`文件[${fileIndex}] ${file.name} 加载超时`);
        img.src = ''; // 中止当前加载
        processNextFile(fileIndex);
      }
    }, 5000); // 5秒超时
    
    // 修复类型错误，确保imageUrl不为空
    if (imageUrl) {
      img.src = imageUrl;
    } else {
      console.error(`文件[${fileIndex}] 没有有效的图像URL`);
      processNextFile(fileIndex);
      return;
    }
    
    // 如果图片已经加载完成，立即清除超时
    if (img.complete) {
      clearTimeout(imgLoadTimeout);
    }
  };

  // 处理压缩
  const handleCompress = () => {
    if (!selectedFile || !previewUrl) {
      console.error('没有选择文件或预览不可用');
      return;
    }
    
    setLoading(true);
    console.log('开始压缩单个图片:', selectedFile.name);
    
    // 创建图像对象
    const img = new Image();
    
    img.onload = () => {
      console.log('图片加载成功，尺寸:', img.width, 'x', img.height);
      // 检查是否需要调整大小
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
      
      // 创建canvas元素
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas元素不存在');
        setLoading(false);
        return;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 绘制图像到canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('无法获取Canvas上下文');
        setLoading(false);
        return;
      }
      
      // 对于PNG和WebP，使用透明背景；对于JPEG，使用白色背景
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      console.log('图片已绘制到Canvas');
      
      // 确定实际使用的压缩质量
      // PNG格式使用lossless压缩，所以quality参数不影响PNG
      const actualQuality = format === 'image/png' ? 1.0 : quality / 100;
      
      try {
        // 将canvas转换为压缩后的数据URL
        const compressedDataUrl = canvas.toDataURL(format, actualQuality);
        console.log('Canvas已转换为数据URL');
        
        // 计算压缩后的大小
        fetch(compressedDataUrl)
          .then(res => res.blob())
          .then(blob => {
            console.log('压缩完成，原始大小:', formatFileSize(originalSize), '压缩后:', formatFileSize(blob.size));
            const compSize = blob.size;
            
            // 比较压缩前后的大小，如果压缩后更大，则保留原始图片
            if (compSize >= originalSize && !needResize && format === selectedFile.type) {
              // 压缩后反而变大，使用原始图片
              setCompressedUrl(previewUrl);
              setCompressedSize(originalSize);
              setCompressionRatio(0);
              setSnackbarSeverity('info');
              setSnackbarMessage('图片已经是最优化的，无需进一步压缩');
            } else if (compSize > originalSize) {
              // 如果仍然变大，但格式或尺寸发生了变化，告知用户
              setCompressedUrl(compressedDataUrl);
              setCompressedSize(compSize);
              setCompressionRatio(Math.round((compSize / originalSize - 1) * 100) * -1);
              setSnackbarSeverity('warning');
              setSnackbarMessage('调整后图片大小增加，请考虑使用不同的设置');
            } else {
              // 正常情况，压缩成功且变小了
              setCompressedUrl(compressedDataUrl);
              setCompressedSize(compSize);
              setCompressionRatio(Math.round((1 - compSize / originalSize) * 100));
              setSnackbarSeverity('success');
              setSnackbarMessage('图片压缩成功!');
            }
            
            // 切换到压缩图像预览
            setViewMode('compressed');
            
            // 如果是批量模式，保存处理结果并处理下一个
            if (batchMode && currentFileIndex >= 0) {
              const processedFile = {
                name: selectedFile.name,
                originalSize: originalSize,
                compressedSize: compSize,
                compressionRatio: compSize < originalSize ? 
                  Math.round((1 - compSize / originalSize) * 100) : 
                  Math.round((compSize / originalSize - 1) * 100) * -1,
                fileIndex: currentFileIndex,
                compressedUrl: compressedDataUrl
              };
              
              // 更新或添加处理结果
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
              
              // 如果是自动批处理模式，继续处理下一个文件
              if (batchProcessing) {
                moveToNextFile();
              } else {
                setLoading(false);
                setSnackbarOpen(true);
              }
            } else {
              setLoading(false);
              setSnackbarOpen(true);
            }
          })
          .catch(err => {
            console.error('压缩图片时出错:', err);
            setLoading(false);
            
            setSnackbarSeverity('error');
            setSnackbarMessage('压缩图片时发生错误');
            setSnackbarOpen(true);
            
            // 如果在批处理模式下，跳过这个文件继续处理下一个
            if (batchProcessing) {
              moveToNextFile();
            }
          });
      } catch (error) {
        console.error('Canvas转换为数据URL时出错:', error);
        setLoading(false);
        setSnackbarSeverity('error');
        setSnackbarMessage('图片压缩过程中发生错误');
        setSnackbarOpen(true);
        
        if (batchProcessing) {
          moveToNextFile();
        }
      }
    };
    
    img.onerror = (error) => {
      console.error('图片加载失败:', error);
      setLoading(false);
      setSnackbarSeverity('error');
      setSnackbarMessage('图片加载失败');
      setSnackbarOpen(true);
      
      // 如果在批处理模式下，跳过这个文件继续处理下一个
      if (batchProcessing) {
        moveToNextFile();
      }
    };
    
    // 设置图片加载超时处理
    const imgLoadTimeout = setTimeout(() => {
      if (batchProcessing && img.complete === false) {
        console.log('图片加载超时，跳到下一个文件');
        img.src = ''; // 中止当前加载
        moveToNextFile();
      }
    }, 8000);
    
    console.log('设置图片源:', previewUrl ? '(有效的预览URL)' : '(无效的预览URL)');
    img.src = previewUrl;
    
    // 如果图片已经加载完成或出错，清除超时
    if (img.complete) {
      clearTimeout(imgLoadTimeout);
    }
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
      
      // 查找该文件是否已处理
      const processed = processedFiles.find(f => f.fileIndex === index);
      if (processed && processed.compressedUrl) {
        setCompressedUrl(processed.compressedUrl);
        setCompressedSize(processed.compressedSize);
        setCompressionRatio(processed.compressionRatio);
      } else {
        setCompressedUrl(null);
        setCompressedSize(0);
        setCompressionRatio(0);
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
      // 创建JSZip实例
      const zip = new JSZip();
      
      // 添加所有处理过的文件到zip
      let fileCount = 0;
      
      processedFiles.forEach(file => {
        if (!file.compressedUrl) {
          return;
        }
        
        try {
          // 获取文件的二进制数据
          const imageData = file.compressedUrl.split(',')[1];
          
          // 获取文件扩展名
          const fileExtension = format === 'image/jpeg' ? 'jpg' : 
                              format === 'image/png' ? 'png' : 
                              format === 'image/webp' ? 'webp' : 'jpg';
          
          // 生成文件名
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const fileName = `${baseName}_compressed.${fileExtension}`;
          
          // 添加到zip
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
      
      // 生成zip文件
      zip.generateAsync({type: 'blob'})
        .then(content => {
          // 创建下载链接
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = `compressed_images_${new Date().getTime()}.zip`;
          
          // 触发下载
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // 释放URL对象
          setTimeout(() => {
            URL.revokeObjectURL(link.href);
          }, 100);
          
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
    console.log('用户取消批量处理');
    setBatchProcessing(false);
    setLoading(false);
    
    // 清除超时
    if (processingTimeout) {
      clearTimeout(processingTimeout);
      setProcessingTimeout(null);
    }
    
    setSnackbarSeverity('info');
    setSnackbarMessage('批量处理已取消');
    setSnackbarOpen(true);
  };

  // 处理清除
  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCompressedUrl(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setCompressionRatio(0);
    setOriginalImageBlob(null);
    setFiles([]);
    setCurrentFileIndex(-1);
    setBatchMode(false);
    setBatchProgress(0);
    setBatchTotal(0);
    setProcessedFiles([]);
    setViewMode('original');
    setBatchProcessing(false);
    setProcessingComplete(false);
    
    // 清除超时
    if (processingTimeout) {
      clearTimeout(processingTimeout);
      setProcessingTimeout(null);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
              <Box sx={{ display: 'flex', mt: 2, gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCompressAll}
                  disabled={loading || batchProcessing}
                  startIcon={loading || batchProcessing ? <CircularProgress size={20} /> : <AutorenewIcon />}
                >
                  {loading || batchProcessing ? '批量压缩中...' : '全部压缩'}
                </Button>
                {processedFiles.length > 0 && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<ZipIcon />}
                    onClick={handleDownloadAll}
                    disabled={loading}
                  >
                    打包下载
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClear}
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
                    onChange={handleQualityChange}
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
                      onChange={handleMaxWidthChange}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="最大高度"
                      type="number"
                      value={maxHeight}
                      onChange={handleMaxHeightChange}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                    />
                  </Grid>
                </Grid>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="format-select-label">输出格式</InputLabel>
                  <Select
                    labelId="format-select-label"
                    value={format}
                    label="输出格式"
                    onChange={handleFormatChange}
                  >
                    <MenuItem value="image/jpeg">JPEG (有损压缩，适合照片)</MenuItem>
                    <MenuItem value="image/png">PNG (无损压缩，适合图标/插图)</MenuItem>
                    <MenuItem value="image/webp">WebP (高压缩率，但兼容性较低)</MenuItem>
                  </Select>
                </FormControl>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSingleCompress}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CompressIcon />}
                  fullWidth
                >
                  {loading ? '压缩中...' : '压缩图片'}
                </Button>
                
                {compressedUrl && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      原始大小: {formatFileSize(originalSize)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {compressionRatio > 0 ? (
                        <>压缩后: {formatFileSize(compressedSize)} (减小了 {compressionRatio}%)</>
                      ) : compressionRatio < 0 ? (
                        <>压缩后: {formatFileSize(compressedSize)} (增加了 {Math.abs(compressionRatio)}%)</>
                      ) : (
                        <>压缩后: {formatFileSize(compressedSize)} (大小未变)</>
                      )}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => {
                          if (!compressedUrl) return;
                          
                          // 创建下载链接
                          const link = document.createElement('a');
                          link.href = compressedUrl;
                          
                          // 获取文件扩展名
                          const extension = format === 'image/jpeg' ? 'jpg' : 
                                           format === 'image/png' ? 'png' : 
                                           format === 'image/webp' ? 'webp' : 'jpg';
                          
                          // 设置文件名
                          const originalName = selectedFile?.name || 'compressed_image';
                          const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
                          link.download = `${baseName}_compressed.${extension}`;
                          
                          // 触发下载
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
                        startIcon={viewMode === 'compressed' ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        onClick={toggleViewMode}
                      >
                        {viewMode === 'compressed' ? '查看原图' : '查看压缩图'}
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
                    {compressedUrl ? 
                      (viewMode === 'compressed' ? '压缩后预览' : '原始图片预览') : 
                      '原始图片预览'}
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
                  {compressedUrl && viewMode === 'compressed' ? (
                    <img
                      src={compressedUrl}
                      alt="压缩后预览"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="原始图片预览"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      无图片预览
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </>
        )}

        {/* 显示批量处理进度 */}
        {batchMode && batchProcessing && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" gutterBottom>
                批量处理进度: {batchProgress}/{batchTotal}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(batchProgress / batchTotal) * 100} 
                sx={{ mb: 2 }}
              />
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleCancelBatchProcessing}
                disabled={loading}
              >
                取消批处理
              </Button>
            </Paper>
          </Grid>
        )}

        {/* 批处理结果列表 */}
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
                    {processedFiles.map((file, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          <Button 
                            color="inherit" 
                            onClick={() => handleSelectFile(file.fileIndex)}
                            sx={{ textTransform: 'none', justifyContent: 'flex-start', px: 0 }}
                          >
                            {file.name}
                          </Button>
                        </TableCell>
                        <TableCell align="right">{formatFileSize(file.originalSize)}</TableCell>
                        <TableCell align="right">{formatFileSize(file.compressedSize)}</TableCell>
                        <TableCell align="right">
                          {file.compressionRatio > 0 ? (
                            <Typography variant="body2" color="success.main">-{file.compressionRatio}%</Typography>
                          ) : file.compressionRatio < 0 ? (
                            <Typography variant="body2" color="error.main">+{Math.abs(file.compressionRatio)}%</Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">0%</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {file.compressedUrl && (
                            <IconButton
                              size="small"
                              onClick={() => {
                                if (!file.compressedUrl) return;
                                
                                // 创建下载链接
                                const link = document.createElement('a');
                                link.href = file.compressedUrl;
                                
                                // 获取文件扩展名
                                const extension = format === 'image/jpeg' ? 'jpg' : 
                                                format === 'image/png' ? 'png' : 
                                                format === 'image/webp' ? 'webp' : 'jpg';
                                
                                // 设置文件名
                                const originalName = file.name || 'compressed_image';
                                const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
                                link.download = `${baseName}_compressed.${extension}`;
                                
                                // 触发下载
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

        {/* 处理完成标识 */}
        {processingComplete && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.lightest' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    disabled={loading}
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

      {/* 用于图片压缩的隐藏Canvas元素 */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      
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