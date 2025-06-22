/**
 * IP 信息查询代理 API
 * 用于获取客户端真实IP地址和地理位置信息
 * 支持多API源随机选择和重试机制
 */
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// 支持CORS的IP查询API列表 (基于GitHub文档)
const IP_API_SERVICES = [
  {
    url: 'https://api.vore.top/api/IPdata',
    name: 'vore.top',
    formatter: (data: any) => ({
      ip: data.ipinfo?.text || '',
      country_name: data.ipdata?.info1 || '',
      region: data.ipdata?.info2 || '',
      city: data.ipdata?.info3 || '',
      latitude: 0,
      longitude: 0,
      timezone: 'Asia/Shanghai',
      country_code: 'CN',
      org: data.ipdata?.isp || '',
      asn: '',
    })
  },
  {
    url: 'https://api.ip.sb/geoip/',
    name: 'ip.sb',
    formatter: (data: any) => ({
      ip: data.ip || '',
      country_name: data.country || '',
      region: data.region || '',
      city: data.city || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.timezone || '',
      country_code: data.country_code || '',
      org: data.organization || data.isp || '',
      asn: data.asn ? `AS${data.asn}` : '',
    })
  },
  {
    url: 'https://ip-api.io/json',
    name: 'ip-api.io',
    formatter: (data: any) => ({
      ip: data.ip || '',
      country_name: data.country_name || '',
      region: data.region_name || '',
      city: data.city || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.time_zone || '',
      country_code: data.country_code || '',
      org: data.organisation || '',
      asn: '',
    })
  },
  {
    url: 'https://ipapi.co/json/',
    name: 'ipapi.co',
    formatter: (data: any) => ({
      ip: data.ip || '',
      country_name: data.country_name || '',
      region: data.region || '',
      city: data.city || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.timezone || '',
      country_code: data.country_code || '',
      org: data.org || '',
      asn: data.asn || '',
    })
  },
  {
    url: 'https://freeipapi.com/api/json',
    name: 'freeipapi.com',
    formatter: (data: any) => ({
      ip: data.ipAddress || '',
      country_name: data.countryName || '',
      region: data.regionName || '',
      city: data.cityName || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.timeZone || '',
      country_code: data.countryCode || '',
      org: 'Unknown',
      asn: '',
    })
  },
  {
    url: 'https://ipwhois.app/json/',
    name: 'ipwhois.app',
    formatter: (data: any) => ({
      ip: data.ip || '',
      country_name: data.country || '',
      region: data.region || '',
      city: data.city || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.timezone || '',
      country_code: data.country_code || '',
      org: data.org || data.isp || '',
      asn: data.asn || '',
    })
  }
];

// 随机打乱数组
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 创建回退响应数据
const createFallbackResponse = () => {
  return {
    ip: '获取失败',
    country_name: '未知',
    region: '未知',
    city: '未知',
    latitude: 0,
    longitude: 0,
    timezone: 'UTC',
    country_code: '',
    org: '所有API查询失败',
    asn: '',
  };
};

// 检查是否为本地IP地址
function isLocalIP(ip: string): boolean {
  if (!ip) return true;
  
  // IPv6 localhost
  if (ip === '::1' || ip === '::ffff:127.0.0.1') return true;
  
  // IPv4 localhost and private networks
  if (ip.startsWith('127.') || 
      ip.startsWith('192.168.') || 
      ip.startsWith('10.') ||
      (ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31)) {
    return true;
  }
  
  return false;
}

// 获取客户端真实IP地址
function getClientIP(request: NextRequest): string {
  // 尝试从各种头部获取真实IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP && !isLocalIP(cfConnectingIP)) return cfConnectingIP;
  if (realIP && !isLocalIP(realIP)) return realIP;
  if (clientIP && !isLocalIP(clientIP)) return clientIP;
  if (forwarded) {
    // x-forwarded-for 可能包含多个IP，取第一个非本地IP
    const ips = forwarded.split(',').map(ip => ip.trim());
    for (const ip of ips) {
      if (!isLocalIP(ip)) return ip;
    }
  }
  
  // 如果都是本地IP，返回空字符串让API自动检测
  return '';
}

export async function GET(request: NextRequest) {
  const MAX_RETRIES = 3;
  let attempt = 0;
  let lastError: Error | null = null;
  
  // 获取客户端IP
  const clientIP = getClientIP(request);
  const isLocalEnv = !clientIP || isLocalIP(clientIP);
  
  console.log('检测到的客户端IP:', clientIP || '本地环境，将使用API自动检测真实公网IP');
  
  // 随机打乱API服务列表
  const shuffledServices = shuffleArray(IP_API_SERVICES);
  
  while (attempt < MAX_RETRIES) {
    attempt++;
    console.log(`第 ${attempt} 次尝试获取IP信息...`);
    
    // 从打乱的列表中选择一个API
    const serviceIndex = (attempt - 1) % shuffledServices.length;
    const service = shuffledServices[serviceIndex];
    
    try {
      console.log(`使用 ${service.name} API 获取IP信息...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      // 构建API URL - 只有在非本地环境且有有效公网IP时才指定IP查询
      let apiUrl = service.url;
      if (!isLocalEnv && clientIP && service.name !== 'vore.top') {
        // 大部分API支持通过路径参数或查询参数指定IP
        if (service.name === 'ip.sb') {
          apiUrl = `https://api.ip.sb/geoip/${clientIP}`;
        } else if (service.name === 'ipapi.co') {
          apiUrl = `https://ipapi.co/${clientIP}/json/`;
        } else if (service.name === 'freeipapi.com') {
          apiUrl = `https://freeipapi.com/api/json/${clientIP}`;
        } else if (service.name === 'ipwhois.app') {
          apiUrl = `https://ipwhois.app/json/${clientIP}`;
        }
      }
      
      console.log(`请求URL: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
        cache: 'no-store',
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      console.log(`${service.name} API 响应:`, rawData);
      
      // 使用对应的格式化器处理数据
      const formattedData = service.formatter(rawData);
      
      // 验证必要字段
      if (!formattedData.ip) {
        throw new Error('API返回数据中缺少IP地址');
      }
      
      // 在本地环境中，优先使用API返回的真实公网IP
      if (isLocalEnv) {
        console.log(`本地环境，使用API返回的真实IP: ${formattedData.ip}`);
      } else if (clientIP && formattedData.ip !== clientIP) {
        console.log(`API返回IP ${formattedData.ip} 与客户端IP ${clientIP} 不匹配，但都是有效IP`);
        // 在生产环境中，如果两个IP都是有效的公网IP，可以选择使用客户端IP或API返回的IP
        // 这里我们使用API返回的IP，因为它可能更准确
      }
      
      console.log(`成功从 ${service.name} 获取IP信息:`, formattedData.ip);
      
      return NextResponse.json(formattedData, {
        headers: {
          'X-IP-Source': service.name,
          'X-Attempt': attempt.toString(),
          'X-Client-IP': clientIP || 'auto-detect',
          'X-Is-Local-Env': isLocalEnv.toString(),
          'Cache-Control': 'no-store, max-age=0'
        }
      });
      
    } catch (error) {
      console.error(`第 ${attempt} 次尝试失败 (${service.name}):`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // 如果还有重试次数，等待一小段时间后继续
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
      }
    }
  }

  console.error(`所有 ${MAX_RETRIES} 次尝试均失败，返回错误响应`);
  
  // 所有尝试都失败，返回错误响应
  const fallbackData = createFallbackResponse();
  
  // 如果有有效的客户端IP，至少返回这个IP
  if (clientIP && !isLocalIP(clientIP)) {
    fallbackData.ip = clientIP;
    fallbackData.org = 'IP地址已获取，但地理位置信息查询失败';
  }
  
  return NextResponse.json(
    fallbackData,
    { 
      status: 500,
      headers: {
        'X-IP-Source': 'fallback',
        'X-Error': lastError?.message || '未知错误',
        'X-Client-IP': clientIP || 'not-detected',
        'X-Is-Local-Env': isLocalEnv.toString(),
        'Cache-Control': 'no-store, max-age=0'
      }
    }
  );
} 