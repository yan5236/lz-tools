import { Container, Typography, Box, Card, CardContent, Grid, Button, CardActions, Paper, Divider, Avatar, Icon } from '@mui/material';
import Link from 'next/link';
import { tools } from '@/lib/constants';

export default function Home() {
  return (
    <>
      <Box sx={{ py: 6 }}>
        {/* 主横幅 */}
        <Box 
          sx={{ 
            bgcolor: 'primary.main', 
            py: { xs: 6, md: 10 }, 
            color: 'white',
            mb: 6,
            borderRadius: { xs: 0, md: 2 },
            mx: { xs: 0, md: 3 }
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
              LZ小工具
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, maxWidth: 700 }}>
              免费的在线工具集合，帮助开发者、设计师和普通用户解决日常问题
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              component={Link}
              href="/tools"
              sx={{ borderRadius: 100 }}
              endIcon={<Icon>arrow_forward</Icon>}
            >
              立即使用
            </Button>
          </Container>
        </Box>

        {/* 网站介绍 */}
        <Container maxWidth="lg">
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
              关于LZ小工具
            </Typography>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.default' }}>
              <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem', lineHeight: 1.6 }}>
                LZ小工具是一个简洁高效的在线工具箱，集合了开发者、设计师和日常工作中常用的各类工具。无需安装任何软件，打开浏览器即可使用所有功能。
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem', lineHeight: 1.6 }}>
                所有工具均在浏览器本地运行，您的数据不会上传至服务器，保障您的数据安全和隐私。
              </Typography>
            </Paper>
          </Box>

          {/* 特点介绍 */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
              为什么选择LZ小工具
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 3, height: '100%', borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                      <Icon>touch_app</Icon>
                    </Avatar>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                      简单易用
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    所有工具都经过精心设计，界面简洁直观，无需任何专业知识即可上手使用。省去繁琐的安装步骤，让您专注于完成任务。
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 3, height: '100%', borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                      <Icon>card_giftcard</Icon>
                    </Avatar>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                      完全免费
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    所有工具均免费使用，无需注册账号，没有任何功能限制。我们致力于为用户提供最佳的工具体验，不会弹出任何广告干扰您的使用。
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 3, height: '100%', borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                      <Icon>security</Icon>
                    </Avatar>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                      保护隐私
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    所有数据处理都在您的浏览器本地完成，不会上传到任何服务器。这确保了您的敏感数据始终在您的控制之下，无需担心隐私泄露。
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* 工具分类 */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
              工具分类
            </Typography>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                      <Icon>code</Icon>
                    </Avatar>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>编码工具</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Base64编解码，URL编解码，JSON格式化等编码相关工具
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                      <Icon>event</Icon>
                    </Avatar>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>日期工具</Typography>
                    <Typography variant="body2" color="text.secondary">
                      时间戳转换，日期计算，倒计时等时间相关工具
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                      <Icon>security</Icon>
                    </Avatar>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>加密工具</Typography>
                    <Typography variant="body2" color="text.secondary">
                      MD5，SHA哈希计算，加密解密工具
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                      <Icon>brush</Icon>
                    </Avatar>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>设计工具</Typography>
                    <Typography variant="body2" color="text.secondary">
                      颜色转换，图片处理等设计辅助工具
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          <Divider sx={{ mb: 6 }} />

          {/* 实用工具集合 */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
              实用工具集合
            </Typography>
            <Grid container spacing={3}>
              {tools.map((tool) => (
                <Grid item key={tool.slug} xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main', 
                            color: 'white',
                            mr: 2,
                            width: 40,
                            height: 40
                          }}
                        >
                          <Icon>{tool.icon}</Icon>
                        </Avatar>
                        <Typography variant="h6">{tool.title}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {tool.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        component={Link} 
                        href={`/tools/${tool.slug}`}
                        sx={{ ml: 'auto' }}
                        endIcon={<Icon fontSize="small">arrow_forward</Icon>}
                      >
                        立即使用
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 使用指南 */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
              开始使用
            </Typography>
            <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
                使用LZ小工具非常简单，只需三个步骤：
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2 }}>
                      <Typography variant="h6">1</Typography>
                    </Avatar>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>第一步</Typography>
                    <Typography variant="body1">
                      浏览工具列表，选择您需要的工具
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2 }}>
                      <Typography variant="h6">2</Typography>
                    </Avatar>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>第二步</Typography>
                    <Typography variant="body1">
                      输入您要处理的数据或内容
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2 }}>
                      <Typography variant="h6">3</Typography>
                    </Avatar>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>第三步</Typography>
                    <Typography variant="body1">
                      获取处理结果，根据需要进行复制或下载
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  component={Link}
                  href="/tools"
                  sx={{ borderRadius: 100 }}
                  endIcon={<Icon>arrow_forward</Icon>}
                >
                  开始使用工具
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>
    </>
  );
}
