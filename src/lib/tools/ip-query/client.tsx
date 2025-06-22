'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Icon, 
  Button, 
  CircularProgress, 
  Divider,
  Tooltip,
  IconButton,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';

// IP信息接口
interface IPInfo {
  ip: string;
  country_name: string;
  region: string;
  city: string;
  district?: string;
  org: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country_code?: string;
  asn?: string;
}

// 样式化的信息卡片
const InfoCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

// 信息项组件
const InfoItem = ({ icon, title, value }: { icon: string; title: string; value: string | number }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
    <Icon color="primary" sx={{ mr: 1.5, mt: 0.3 }}>{icon}</Icon>
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" fontWeight="medium">
        {value || '未知'}
      </Typography>
    </Box>
  </Box>
);



export default function IPQuery() {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);



  // 复制文本到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('已复制到剪贴板');
      })
      .catch(err => {
        console.error('无法复制文本: ', err);
        alert('复制失败，请手动复制');
      });
  };

  // 刷新IP信息
  const refreshIPInfo = () => {
    setLoading(true);
    setError(null);
    setRefreshKey(prev => prev + 1);
  };

  // 获取IP信息
  useEffect(() => {
    const fetchIPInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('开始获取IP信息...');
        const response = await fetch('/api/ip', {
          method: 'GET',
          cache: 'no-store',
        });
        
        // 获取响应头信息
        const source = response.headers.get('X-IP-Source') || '';
        const errorMsg = response.headers.get('X-Error') || '';
        
        if (!response.ok) {
          throw new Error(`查询失败 (状态码: ${response.status})`);
        }
        
        const data = await response.json();
        console.log('获取到的IP信息:', data);
        
        // 构建IP信息对象
        const formattedData: IPInfo = {
          ip: data.ip || '未知',
          country_name: data.country_name || '未知',
          region: data.region || '未知',
          city: data.city || '未知',
          district: data.district || '',
          org: data.org || '未知',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          timezone: data.timezone || '未知',
          country_code: data.country_code || '',
          asn: data.asn || '',
        };
        
        setIpInfo(formattedData);
        
        // 检查是否使用了回退数据
        if (source === 'fallback') {
          setError(`API查询失败，显示的是默认数据。${errorMsg ? `错误: ${errorMsg}` : ''}`);
        } else {
          setError(null);
        }
        
      } catch (err) {
        console.error('获取IP信息失败:', err);
        const errorMessage = err instanceof Error ? err.message : '未知错误';
        setError(`获取IP信息失败: ${errorMessage}`);
        
        // 设置默认的错误信息
        setIpInfo({
          ip: '获取失败',
          country_name: '未知',
          region: '未知',
          city: '未知',
          district: '',
          org: '查询失败',
          latitude: 0,
          longitude: 0,
          timezone: '未知',
          country_code: '',
          asn: '',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIPInfo();
  }, [refreshKey]);

  return (
    <Box>
      {/* 说明文本 */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          bgcolor: 'background.default',
          borderLeft: '4px solid',
          borderColor: 'info.main',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          本工具可以查询您当前的真实IP地址及相关地理位置信息。我们使用多个API源进行查询，确保获取到最准确的信息。所有查询通过我们的安全代理进行，保护您的隐私。
        </Typography>
      </Paper>





      {/* 错误提示 */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* IP信息卡片 */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          {/* 当前IP地址卡片 */}
          <Grid item xs={12}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                bgcolor: 'primary.light',
                color: 'white'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Icon sx={{ fontSize: 24, mr: 1 }}>public</Icon>
                <Typography variant="h6">当前IP地址</Typography>
              </Box>
              
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ mr: 1 }}>
                    {ipInfo?.ip}
                  </Typography>
                  <Tooltip title="复制IP地址">
                    <IconButton 
                      size="small" 
                      onClick={() => copyToClipboard(ipInfo?.ip || '')}
                      sx={{ color: 'white' }}
                    >
                      <Icon fontSize="small">content_copy</Icon>
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* IP详细信息区域 */}
          {loading ? (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography color="text.secondary">
                  正在查询IP信息，请稍候...
                </Typography>
              </Box>
            </Grid>
          ) : ipInfo && (
            <>
              {/* 地理位置信息 */}
              <Grid item xs={12} md={6}>
                <InfoCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Icon color="primary" sx={{ mr: 1 }}>location_on</Icon>
                      <Typography variant="h6">地理位置信息</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    <InfoItem 
                      icon="flag" 
                      title="国家/地区" 
                      value={ipInfo.country_name}
                    />
                    <InfoItem 
                      icon="location_city" 
                      title="省份/州" 
                      value={ipInfo.region}
                    />
                    <InfoItem 
                      icon="apartment" 
                      title="城市" 
                      value={ipInfo.city}
                    />
                    <InfoItem 
                      icon="schedule" 
                      title="时区" 
                      value={ipInfo.timezone}
                    />
                  </CardContent>
                </InfoCard>
              </Grid>
              
              {/* 网络信息 */}
              <Grid item xs={12} md={6}>
                <InfoCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Icon color="primary" sx={{ mr: 1 }}>router</Icon>
                      <Typography variant="h6">网络信息</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    <InfoItem 
                      icon="business" 
                      title="运营商/组织" 
                      value={ipInfo.org}
                    />
                    <InfoItem 
                      icon="my_location" 
                      title="经度" 
                      value={ipInfo.longitude || '未知'}
                    />
                    <InfoItem 
                      icon="my_location" 
                      title="纬度" 
                      value={ipInfo.latitude || '未知'}
                    />
                    {ipInfo.asn && (
                      <InfoItem 
                        icon="dns" 
                        title="ASN" 
                        value={ipInfo.asn}
                      />
                    )}
                  </CardContent>
                </InfoCard>
              </Grid>
            </>
          )}
        </Grid>
      </Box>

      {/* 刷新按钮 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Icon>refresh</Icon>} 
          onClick={refreshIPInfo}
          disabled={loading}
        >
          {loading ? '正在查询...' : '刷新IP信息'}
        </Button>
      </Box>

      {/* 提示信息 */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mt: 4, 
          bgcolor: 'background.default',
          borderLeft: '4px solid',
          borderColor: 'warning.main',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          注意：IP地址查询结果的准确性取决于第三方IP数据库和您的网络环境。如果您使用VPN或代理服务，显示的地理位置可能与您的实际位置不符。我们使用多个API源进行查询，最多重试3次以确保获取到准确信息。
        </Typography>
      </Paper>
    </Box>
  );
} 