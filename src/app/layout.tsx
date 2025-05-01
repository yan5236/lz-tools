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
  title: "LZ小工具 - 在线免费实用工具集合",
  description: "LZ小工具是一个免费的在线工具集合，包含JSON格式化、Base64编解码、URL编解码、时间戳转换等多种实用工具",
  keywords: "在线工具,免费工具,JSON格式化,Base64编解码,URL编解码,时间戳转换,哈希生成,颜色转换,图片压缩,Markdown编辑器",
  authors: [{ name: "LZ小工具团队" }],
  creator: "LZ小工具",
  publisher: "LZ小工具",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
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
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/@uiw/react-md-editor@latest/dist/mdeditor.min.css" 
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/@uiw/react-markdown-preview@latest/dist/markdown.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "LZ小工具",
              "url": "https://lztools.nanhaiblog.top",
              "description": "LZ小工具是一个免费的在线工具集合，包含JSON格式化、Base64编解码、URL编解码等多种实用工具",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://lztools.nanhaiblog.top/tools?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
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
