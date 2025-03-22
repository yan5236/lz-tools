'use client';

import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// 创建Material Design 3风格的主题
const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  palette: {
    primary: {
      main: '#006A6A', // Material 3 Teal
      light: '#47B5B5',
      dark: '#004242',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#9A4FBF', // Material 3 Purple
      light: '#D1A7E6',
      dark: '#662A88',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F9FB',
      paper: '#FFFFFF',
    },
    error: {
      main: '#DC3646',
      light: '#FF8989',
      dark: '#B30020',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F28D35',
      light: '#FFBB7A',
      dark: '#C06100',
      contrastText: '#000000',
    },
    info: {
      main: '#479EFF',
      light: '#BCE3FF',
      dark: '#0061DB',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#11AA62',
      light: '#66FFBD',
      dark: '#007648',
      contrastText: '#FFFFFF',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 100,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#000000',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme; 