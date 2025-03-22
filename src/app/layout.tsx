import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Box from "@mui/material/Box";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "LZ小工具 - 在线实用工具集合",
  description: "LZ小工具是一个免费的在线工具集合，包含JSON格式化、Base64编解码、URL编解码、时间戳转换等多种实用工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className={roboto.className}>
        <ThemeProvider>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '100vh'
          }}>
            <Navbar />
            <Box 
              component="main" 
              sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {children}
              <Box sx={{ height: '2rem' }} />
            </Box>
            <Footer />
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}
