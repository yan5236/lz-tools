/**
 * IP 信息查询代理 API
 * 用于解决浏览器端直接请求 ipapi.co 的 CORS 问题
 */
import { NextResponse } from 'next/server';

// 添加备用 IP API 服务
const IP_API_SERVICES = [
  { url: 'https://ipapi.co/json/', name: 'ipapi.co' },
  { url: 'https://api.ipify.org?format=json', name: 'ipify' } // 这个仅提供 IP 地址
];

// 创建模拟响应数据 (用于开发环境或所有 API 失败时)
const createFallbackResponse = () => {
  return {
    ip: '192.168.1.1',
    country_name: '中国',
    region: '北京市',
    city: '北京',
    latitude: 39.9042,
    longitude: 116.4074,
    timezone: 'Asia/Shanghai',
    country_code: 'CN',
    org: '本地开发环境',
    asn: 'AS-DEV',
  };
};

export async function GET() {
  let lastError = null;
  
  // 依次尝试所有 API 服务
  for (const service of IP_API_SERVICES) {
    try {
      console.log(`尝试使用 ${service.name} 获取 IP 信息...`);
      
      const response = await fetch(service.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        cache: 'no-store', // 禁用缓存以确保获取最新数据
      });

      if (!response.ok) {
        throw new Error(`IP 查询失败 (${service.name})，状态: ${response.status}`);
      }

      const data = await response.json();
      
      // 如果是 ipify API 返回的数据，需要补充其他字段
      if (service.name === 'ipify' && data.ip) {
        // 合并 ipify 返回的 IP 地址和模拟数据
        const fallback = createFallbackResponse();
        return NextResponse.json({
          ...fallback,
          ip: data.ip,
          org: `IP地址已获取，但地理位置信息不可用`
        });
      }
      
      // 返回数据给客户端
      return NextResponse.json(data);
    } catch (error) {
      console.error(`使用 ${service.name} 查询 IP 信息错误:`, error);
      lastError = error;
      // 继续尝试下一个服务
    }
  }

  console.log('所有 IP API 服务均失败，使用模拟数据...');
  
  // 所有 API 都失败，返回模拟数据
  const fallbackData = createFallbackResponse();
  
  return NextResponse.json(
    fallbackData,
    { 
      headers: {
        'X-IP-Source': 'fallback',
        'Cache-Control': 'no-store, max-age=0'
      }
    }
  );
} 