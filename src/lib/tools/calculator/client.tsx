'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';

// 导入各个计算器组件
import {
  StandardCalculator,
  ScientificCalculator,
  ProgrammerCalculator,
  DateCalculator,
  UnitConverter,
  CurrencyConverter
} from './components';

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
      id={`calculator-tabpanel-${index}`}
      aria-labelledby={`calculator-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `calculator-tab-${index}`,
    'aria-controls': `calculator-tabpanel-${index}`,
  };
}

export default function CalculatorClient() {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabs = [
    { label: '标准', icon: '🔢' },
    { label: '科学', icon: '🧮' },
    { label: '程序员', icon: '💻' },
    { label: '日期', icon: '📅' },
    { label: '单位转换', icon: '⚖️' },
    { label: '汇率', icon: '💱' }
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        高级计算器
      </Typography>
      
      <Paper elevation={3} sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons="auto"
            aria-label="计算器类型选择"
            sx={{
              '& .MuiTab-root': {
                minHeight: isMobile ? 40 : 48,
                fontSize: isMobile ? '0.7rem' : '0.9rem',
                padding: isMobile ? '6px 8px' : '12px 16px'
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </Box>
                }
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <StandardCalculator />
        </TabPanel>
        
        <TabPanel value={value} index={1}>
          <ScientificCalculator />
        </TabPanel>
        
        <TabPanel value={value} index={2}>
          <ProgrammerCalculator />
        </TabPanel>
        
        <TabPanel value={value} index={3}>
          <DateCalculator />
        </TabPanel>
        
        <TabPanel value={value} index={4}>
          <UnitConverter />
        </TabPanel>
        
        <TabPanel value={value} index={5}>
          <CurrencyConverter />
        </TabPanel>
      </Paper>
    </Box>
  );
} 