'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import GitHubIcon from '@mui/icons-material/GitHub';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Icon from '@mui/material/Icon';
import { categories } from '@/lib/constants';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 6,
        backgroundColor: (theme) => theme.palette.background.paper,
        borderTop: '4px solid',
        borderColor: 'primary.main',
        boxShadow: '0px -2px 10px rgba(0,0,0,0.05)',
        position: 'relative',
      }}
    >
      {/* 页脚标识 */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -20, 
          left: '50%', 
          transform: 'translateX(-50%)',
          bgcolor: 'primary.main',
          color: 'white',
          px: 3,
          py: 1,
          borderRadius: 2,
          boxShadow: 2,
          fontWeight: 'bold',
          typography: 'body1',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Icon fontSize="small">menu</Icon>
        页脚导航
      </Box>
      
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
              <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid', borderColor: 'primary.light', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon fontSize="small">info</Icon>
                关于LZ小工具
              </Typography>
              <Typography variant="body2" color="text.secondary">
                LZ小工具是一个免费的在线工具集合，帮助开发者、设计师和普通用户解决日常问题。
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
              <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid', borderColor: 'primary.light', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon fontSize="small">category</Icon>
                工具分类
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={`/tools?category=${encodeURIComponent(category)}`}
                    color="text.secondary"
                    sx={{ 
                      mb: 0.5, 
                      py: 0.5,
                      '&:hover': { 
                        color: 'primary.main', 
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        pl: 1,
                        borderRadius: 1
                      },
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                    underline="none"
                  >
                    <Icon fontSize="small">chevron_right</Icon>
                    {category}
                  </Link>
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
              <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid', borderColor: 'primary.light', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon fontSize="small">contact_support</Icon>
                联系我们
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <GitHubIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Link
                  href="https://github.com/lzgongju/lz-tools"
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' },
                    fontWeight: 500
                  }}
                  underline="hover"
                  target="_blank"
                  rel="noopener"
                >
                  GitHub
                </Link>
              </Box>
              <Typography variant="body2" color="text.secondary">
                如果您有任何问题或建议，请随时联系我们。
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, borderColor: 'grey.300' }} />
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Icon fontSize="small">copyright</Icon>
            {new Date().getFullYear()}
            {' LZ小工具. 保留所有权利。'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 