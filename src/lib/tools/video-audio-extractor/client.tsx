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
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  AudioFileOutlined as AudioIcon,
  VideoFileOutlined as VideoIcon,
  FileDownloadOutlined as DownloadIcon,
  DeleteOutline as DeleteIcon,
  CloudUploadOutlined as UploadIcon,
  PlayArrowOutlined as PlayIcon,
  PauseOutlined as PauseIcon,
} from '@mui/icons-material';

// 音频格式选项
const audioFormats = [
  { value: 'mp3', label: 'MP3 (推荐)', extension: '.mp3', mime: 'audio/mpeg' },
  { value: 'wav', label: 'WAV (无损)', extension: '.wav', mime: 'audio/wav' },
  { value: 'ogg', label: 'OGG', extension: '.ogg', mime: 'audio/ogg' },
  { value: 'aac', label: 'AAC', extension: '.aac', mime: 'audio/aac' }
];

// 文件大小格式化
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 时间格式化
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function VideoAudioExtractor() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(-1);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFormat, setAudioFormat] = useState<string>('mp3');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [audioSize, setAudioSize] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [extractionMethod, setExtractionMethod] = useState<string>('');
  const [canCancel, setCanCancel] = useState<boolean>(false);
  const [processedFiles, setProcessedFiles] = useState<{name: string, originalSize: number, audioSize: number, audioUrl: string, fileIndex: number}[]>([]);
  
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const cancelRef = useRef<boolean>(false);

  const selectedFile = selectedFiles[currentFileIndex] || null;

  // 支持的视频格式
  const supportedFormats = [
    'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 
    'video/mov', 'video/wmv', 'video/flv', 'video/mkv'
  ];

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const validFiles: File[] = [];

    for (const file of files) {
      // 检查文件类型
      const isVideoFile = file.type.startsWith('video/') || 
        supportedFormats.some(format => file.type === format);
      
      if (!isVideoFile) {
        setSnackbarSeverity('warning');
        setSnackbarMessage(`跳过非视频文件: ${file.name}`);
        setSnackbarOpen(true);
        continue;
      }

      // 检查文件大小（限制为200MB）
      if (file.size > 200 * 1024 * 1024) {
        setSnackbarSeverity('warning');
        setSnackbarMessage(`跳过过大文件: ${file.name} (超过200MB)`);
        setSnackbarOpen(true);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setSnackbarSeverity('error');
      setSnackbarMessage('没有找到有效的视频文件');
      setSnackbarOpen(true);
      return;
    }

    setSelectedFiles(validFiles);
    setCurrentFileIndex(0);
    setAudioUrl(null);
    setAudioSize(0);
    setProgress(0);
    setProcessedFiles([]);

    // 创建第一个视频的预览URL
    const url = URL.createObjectURL(validFiles[0]);
    setVideoUrl(url);

    if (validFiles.length > 1) {
      setSnackbarSeverity('info');
      setSnackbarMessage(`已选择 ${validFiles.length} 个视频文件，可进行批量处理`);
      setSnackbarOpen(true);
    }
  };

  // 获取视频时长
  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  // 提取音频 - 使用Web Audio API直接处理
  const extractAudio = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setProgress(0);
    setCanCancel(false);
    cancelRef.current = false;
    setExtractionMethod('正在读取文件...');

    try {
      // 使用ArrayBuffer方式处理文件，避免播放整个视频
      const arrayBuffer = await selectedFile.arrayBuffer();
      if (cancelRef.current) return;
      
      setProgress(10);
      setExtractionMethod('正在解码音频数据...');

      // 使用Web Audio API解码音频
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      let audioBuffer: AudioBuffer;
      try {
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice());
        if (cancelRef.current) return;
        setProgress(40);
      } catch (decodeError) {
        // 如果直接解码失败，尝试使用媒体元素方法
        console.log('直接解码失败，使用备用方法');
        setExtractionMethod('正在使用备用方法处理...');
        setCanCancel(true);
        return await extractAudioFallback();
      }

      setExtractionMethod('正在处理音频轨道...');

      // 创建离线音频上下文来渲染音频
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start(0);

      setProgress(60);

      // 渲染音频
      const renderedBuffer = await offlineContext.startRendering();
      if (cancelRef.current) return;
      
      setProgress(80);
      setExtractionMethod('正在生成音频文件...');

      // 转换为所需格式
      const audioBlob = await bufferToBlob(renderedBuffer, audioFormat);
      if (cancelRef.current) return;
      
      setProgress(95);

      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      setAudioSize(audioBlob.size);
      setProgress(100);
      setExtractionMethod('');
      
      setSnackbarSeverity('success');
      setSnackbarMessage(`音频提取完成！文件大小: ${formatFileSize(audioBlob.size)}`);
      setSnackbarOpen(true);

    } catch (error) {
      if (cancelRef.current) return;
      
      console.error('音频提取失败:', error);
      // 尝试备用方法
      setExtractionMethod('正在尝试备用方法...');
      setCanCancel(true);
      await extractAudioFallback();
    } finally {
      if (!cancelRef.current) {
        setIsExtracting(false);
        setCanCancel(false);
        setExtractionMethod('');
      }
    }
  };

  // 备用提取方法 - 适用于某些特殊格式
  const extractAudioFallback = async () => {
    try {
      if (!videoRef.current || cancelRef.current) return;

      const video = videoRef.current;
      video.muted = true;
      video.playbackRate = 4.0; // 4倍速播放以加快处理
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(video);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);

      // 使用更高效的录音设置
      const mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: getMediaRecorderMimeType(audioFormat),
        audioBitsPerSecond: 128000 // 设置音频比特率
      });

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && !cancelRef.current) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (cancelRef.current) return;
        
        const audioBlob = new Blob(chunks, { type: getAudioMimeType(audioFormat) });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setAudioSize(audioBlob.size);
        setProgress(100);
        setExtractionMethod('');
        
        setSnackbarSeverity('success');
        setSnackbarMessage(`音频提取完成！（使用备用方法）文件大小: ${formatFileSize(audioBlob.size)}`);
        setSnackbarOpen(true);
      };

      // 开始录音
      mediaRecorder.start(1000); // 每秒记录一次数据

      // 播放视频
      video.currentTime = 0;
      await video.play();

      // 监听播放进度
      const updateProgress = () => {
        if (cancelRef.current) {
          mediaRecorder.stop();
          video.pause();
          return;
        }
        
        if (video.currentTime && videoDuration) {
          const progressPercent = (video.currentTime / videoDuration) * 100;
          setProgress(progressPercent);
        }
      };

      const progressInterval = setInterval(updateProgress, 100);

      // 监听取消操作
      const checkCancel = () => {
        if (cancelRef.current) {
          mediaRecorder.stop();
          video.pause();
          video.playbackRate = 1.0;
          clearInterval(progressInterval);
          clearInterval(cancelCheckInterval);
        }
      };
      const cancelCheckInterval = setInterval(checkCancel, 500);

      // 播放结束
      video.addEventListener('ended', () => {
        if (!cancelRef.current) {
          mediaRecorder.stop();
        }
        clearInterval(progressInterval);
        clearInterval(cancelCheckInterval);
        video.playbackRate = 1.0; // 恢复正常播放速度
      }, { once: true });

    } catch (error) {
      if (cancelRef.current) return;
      
      console.error('备用音频提取也失败:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('音频提取失败，请检查文件格式或尝试其他文件');
      setSnackbarOpen(true);
    }
  };

  // 将AudioBuffer转换为Blob
  const bufferToBlob = async (buffer: AudioBuffer, format: string): Promise<Blob> => {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;

    if (format === 'wav') {
      // 创建WAV文件
      const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
      const view = new DataView(arrayBuffer);

      // WAV文件头
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length * numberOfChannels * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numberOfChannels * 2, true);
      view.setUint16(32, numberOfChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length * numberOfChannels * 2, true);

      // 写入音频数据
      let offset = 44;
      for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
          view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
          offset += 2;
        }
      }

      return new Blob([arrayBuffer], { type: 'audio/wav' });
    } else {
      // 对于其他格式，直接返回WAV格式，因为浏览器限制
      console.log(`${format} 格式将转换为WAV格式输出`);
      return await bufferToBlob(buffer, 'wav');
    }
  };

  // 获取MediaRecorder支持的MIME类型
  const getMediaRecorderMimeType = (format: string): string => {
    const mimeTypes = {
      mp3: 'audio/webm', // MediaRecorder不直接支持MP3，使用WebM
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      aac: 'audio/webm'
    };
    return mimeTypes[format as keyof typeof mimeTypes] || 'audio/webm';
  };

  // 获取音频MIME类型
  const getAudioMimeType = (format: string): string => {
    const selectedFormat = audioFormats.find(f => f.value === format);
    return selectedFormat?.mime || 'audio/mpeg';
  };

  // 下载音频
  const downloadAudio = () => {
    if (!audioUrl || !selectedFile) return;

    const selectedFormat = audioFormats.find(f => f.value === audioFormat);
    const fileName = selectedFile.name.replace(/\.[^/.]+$/, '') + (selectedFormat?.extension || '.mp3');
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 播放/暂停音频
  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 批量处理所有文件
  const processBatch = async () => {
    if (selectedFiles.length === 0) return;

    setIsBatchProcessing(true);
    setBatchProgress(0);
    setProcessedFiles([]);
    cancelRef.current = false;

    const newProcessedFiles: {name: string, originalSize: number, audioSize: number, audioUrl: string, fileIndex: number}[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      if (cancelRef.current) break;

      setCurrentFileIndex(i);
      setBatchProgress((i / selectedFiles.length) * 100);
      
      // 加载当前文件
      const file = selectedFiles[i];
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      
      setExtractionMethod(`正在处理文件 ${i + 1}/${selectedFiles.length}: ${file.name}`);

      try {
        // 直接处理文件，不需要等待视频加载
        const arrayBuffer = await file.arrayBuffer();
        if (cancelRef.current) break;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        let audioBuffer: AudioBuffer;
        
        try {
          audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice());
          if (cancelRef.current) break;
        } catch (decodeError) {
          // 跳过无法解码的文件
          console.error(`跳过文件 ${file.name}:`, decodeError);
          continue;
        }

        // 转换为音频格式
        const audioBlob = await bufferToBlob(audioBuffer, audioFormat);
        if (cancelRef.current) break;

        const audioUrl = URL.createObjectURL(audioBlob);
        
        // 添加到临时列表
        const processedFile = {
          name: file.name,
          originalSize: file.size,
          audioSize: audioBlob.size,
          audioUrl: audioUrl,
          fileIndex: i
        };
        
        newProcessedFiles.push(processedFile);
        
        // 实时更新已处理列表
        setProcessedFiles(prev => [...prev, processedFile]);

      } catch (error) {
        console.error(`处理文件 ${file.name} 失败:`, error);
      }
    }

    setBatchProgress(100);
    setIsBatchProcessing(false);
    setExtractionMethod('');

    if (!cancelRef.current) {
      setSnackbarSeverity('success');
      setSnackbarMessage(`批量处理完成！成功处理 ${newProcessedFiles.length} 个文件`);
      setSnackbarOpen(true);
    }
  };

  // 下载所有音频文件（打包）
  const downloadAllAudio = async () => {
    if (processedFiles.length === 0) return;

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const processedFile of processedFiles) {
      try {
        const response = await fetch(processedFile.audioUrl);
        const audioBlob = await response.blob();
        const selectedFormat = audioFormats.find(f => f.value === audioFormat);
        const fileName = processedFile.name.replace(/\.[^/.]+$/, '') + (selectedFormat?.extension || '.mp3');
        zip.file(fileName, audioBlob);
      } catch (error) {
        console.error(`添加文件到压缩包失败: ${processedFile.name}`, error);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `extracted_audio_${new Date().getTime()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 选择文件预览
  const selectFileForPreview = (index: number) => {
    setCurrentFileIndex(index);
    const file = selectedFiles[index];
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setAudioUrl(null);
    setAudioSize(0);
  };

  // 取消提取
  const cancelExtraction = () => {
    cancelRef.current = true;
    setIsExtracting(false);
    setIsBatchProcessing(false);
    setCanCancel(false);
    setProgress(0);
    setBatchProgress(0);
    setExtractionMethod('');
    
    // 停止视频播放
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.playbackRate = 1.0;
    }
    
    setSnackbarSeverity('info');
    setSnackbarMessage('音频提取已取消');
    setSnackbarOpen(true);
  };

  // 清除文件
  const handleClear = () => {
    // 先取消任何正在进行的提取
    if (isExtracting || isBatchProcessing) {
      cancelExtraction();
    }
    
    setSelectedFiles([]);
    setCurrentFileIndex(-1);
    setVideoUrl(null);
    setAudioUrl(null);
    setVideoDuration(0);
    setAudioSize(0);
    setProgress(0);
    setBatchProgress(0);
    setIsPlaying(false);
    setExtractionMethod('');
    setProcessedFiles([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 关闭提示消息
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* 工具介绍 */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AudioIcon color="primary" /> 视频提取音频
            </Typography>
            <Typography variant="body2" color="text.secondary">
              从视频文件中提取音频轨道，支持多种音频格式输出。适用于制作音频播客、提取背景音乐等场景。
            </Typography>
          </Paper>
        </Grid>

        {/* 文件上传区域 */}
        <Grid item xs={12}>
          <input
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            id="video-upload"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
          />
          <label htmlFor="video-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
              disabled={isExtracting || isBatchProcessing}
              sx={{ 
                py: selectedFiles.length > 0 ? 2 : 4,
                height: selectedFiles.length > 0 ? 'auto' : 120,
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
              {selectedFiles.length > 0 ? (
                <Box sx={{ textAlign: 'center' }}>
                  <VideoIcon sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="body2">
                    已选择 {selectedFiles.length} 个视频文件
                  </Typography>
                  {selectedFile && (
                    <Typography variant="caption" color="text.secondary">
                      当前预览: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </Typography>
                  )}
                </Box>
              ) : (
                <>
                  <VideoIcon sx={{ fontSize: 48, mb: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">选择或拖放视频文件</Typography>
                  <Typography variant="caption" color="text.secondary">
                    支持 MP4, WebM, AVI, MOV 等格式，最大200MB，支持多选
                  </Typography>
                </>
              )}
            </Button>
          </label>
        </Grid>

        {/* 文件列表 */}
        {selectedFiles.length > 1 && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                文件列表 (点击选择预览)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {selectedFiles.map((file, index) => {
                  const isProcessed = processedFiles.some(p => p.fileIndex === index);
                  const isSelected = currentFileIndex === index;
                  
                  return (
                    <Chip
                      key={index}
                      label={`${index + 1}. ${file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name}`}
                      onClick={() => selectFileForPreview(index)}
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      icon={isProcessed ? <AudioIcon fontSize="small" /> : <VideoIcon fontSize="small" />}
                      sx={{ 
                        bgcolor: isProcessed ? 'success.light' : undefined,
                        borderColor: isProcessed ? 'success.main' : undefined,
                        mb: 1,
                        '& .MuiChip-icon': { color: isProcessed ? 'success.main' : undefined }
                      }}
                    />
                  );
                })}
              </Box>
              
              {/* 批量操作按钮 */}
              <Box sx={{ display: 'flex', mt: 2, gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={processBatch}
                  disabled={isBatchProcessing || isExtracting}
                  startIcon={isBatchProcessing ? <CircularProgress size={20} /> : <AudioIcon />}
                  sx={{ flex: 1, minWidth: '120px' }}
                >
                  {isBatchProcessing ? '批量处理中...' : '批量提取音频'}
                </Button>
                
                {processedFiles.length > 0 && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<DownloadIcon />}
                    onClick={downloadAllAudio}
                    disabled={isBatchProcessing || isExtracting}
                  >
                    打包下载
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClear}
                  disabled={(isExtracting || isBatchProcessing) && !canCancel}
                >
                  清除全部
                </Button>
              </Box>

              {/* 批量进度 */}
              {isBatchProcessing && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {extractionMethod || `批量处理进度: ${Math.round(batchProgress)}%`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(batchProgress)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={batchProgress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4
                      }
                    }} 
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        {/* 视频预览和设置 */}
        {selectedFile && videoUrl && (
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  视频预览
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    onLoadedMetadata={handleVideoLoaded}
                    style={{ 
                      width: '100%', 
                      maxHeight: '300px',
                      borderRadius: '8px',
                      backgroundColor: '#000'
                    }}
                    controls
                    preload="metadata"
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  音频格式设置
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>输出格式</InputLabel>
                  <Select
                    value={audioFormat}
                    label="输出格式"
                    onChange={(e) => setAudioFormat(e.target.value)}
                    disabled={isExtracting}
                  >
                    {audioFormats.map((format) => (
                      <MenuItem key={format.value} value={format.value}>
                        {format.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    onClick={extractAudio}
                    disabled={isExtracting || !selectedFile}
                    startIcon={isExtracting ? <CircularProgress size={20} /> : <AudioIcon />}
                    sx={{ flex: 1, minWidth: '120px' }}
                  >
                    {isExtracting ? '提取中...' : '开始提取'}
                  </Button>
                  
                  {(isExtracting || isBatchProcessing) && canCancel && (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={cancelExtraction}
                      sx={{ minWidth: '80px' }}
                    >
                      取消
                    </Button>
                  )}
                  
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleClear}
                    disabled={isExtracting && !canCancel}
                  >
                    清除
                  </Button>
                </Box>

                {/* 进度条 */}
                {isExtracting && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {extractionMethod || `提取进度: ${Math.round(progress)}%`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(progress)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4
                        }
                      }} 
                    />
                    {videoDuration > 0 && extractionMethod.includes('备用') && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        预计剩余时间: {Math.round((videoDuration * (100 - progress)) / 100 / 4)}秒 (4倍速处理)
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 单个音频结果 */}
        {audioUrl && !isBatchProcessing && processedFiles.length === 0 && (
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AudioIcon color="success" /> 提取的音频
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    style={{ width: '100%' }}
                    controls
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Chip 
                    label={`格式: ${audioFormat.toUpperCase()}`} 
                    size="small" 
                    color="primary" 
                  />
                  <Chip 
                    label={`大小: ${formatFileSize(audioSize)}`} 
                    size="small" 
                    color="secondary" 
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<DownloadIcon />}
                    onClick={downloadAudio}
                    sx={{ flex: 1, minWidth: '120px' }}
                  >
                    下载音频
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
                    onClick={toggleAudioPlayback}
                  >
                    {isPlaying ? '暂停' : '播放'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 批量处理结果 */}
        {processedFiles.length > 0 && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AudioIcon color="success" /> 批量处理结果 ({processedFiles.length} 个文件)
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<DownloadIcon />}
                    onClick={downloadAllAudio}
                    disabled={isBatchProcessing || isExtracting}
                    sx={{ flex: 1, minWidth: '120px' }}
                  >
                    打包下载全部
                  </Button>
                  <Chip 
                    label={`总大小: ${formatFileSize(processedFiles.reduce((sum, file) => sum + file.audioSize, 0))}`} 
                    size="small" 
                    color="secondary" 
                  />
                </Box>

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                  {processedFiles.map((processedFile, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <AudioIcon fontSize="small" color="success" />
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'medium',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1
                        }}>
                          {processedFile.name}
                        </Typography>
                      </Box>
                      
                      <audio
                        src={processedFile.audioUrl}
                        style={{ width: '100%', height: '32px' }}
                        controls
                        preload="metadata"
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            label={audioFormat.toUpperCase()} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                          <Chip 
                            label={formatFileSize(processedFile.audioSize)} 
                            size="small" 
                            color="secondary"
                            variant="outlined"
                          />
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => {
                            const selectedFormat = audioFormats.find(f => f.value === audioFormat);
                            const fileName = processedFile.name.replace(/\.[^/.]+$/, '') + (selectedFormat?.extension || '.mp3');
                            const link = document.createElement('a');
                            link.href = processedFile.audioUrl;
                            link.download = fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          下载
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 使用说明 */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              使用说明
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>支持常见视频格式：MP4, WebM, AVI, MOV, WMV, FLV, MKV</li>
                <li>输出音频格式：MP3(推荐), WAV(无损), OGG, AAC</li>
                <li>文件大小限制：最大200MB</li>
                <li>批量处理：支持同时处理多个视频文件，自动打包下载</li>
                <li>智能提取：优先使用高效方法，自动切换到备用方法处理特殊格式</li>
                <li>支持取消：长视频处理过程中可随时取消操作</li>
                <li>提取过程在浏览器本地完成，保护您的隐私</li>
              </Box>
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 提示消息 */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}