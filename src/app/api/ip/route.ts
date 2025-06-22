/**
 * IP 信息查询代理 API
 * 用于获取客户端真实IP地址和地理位置信息
 * 支持多API源随机选择和重试机制
 */
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// 支持指定IP查询的地理位置API列表
const IP_GEO_SERVICES = [
  {
    url: 'https://realip.cc/',
    name: 'realip.cc',
    buildUrl: (ip: string) => `https://realip.cc/${ip}`,
    formatter: (data: any, clientIP: string) => ({
      ip: clientIP, // 强制使用客户端IP
      country_name: data.country || '',
      region: data.province || '',
      city: data.city || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.time_zone || '',
      country_code: data.iso_code || '',
      org: data.isp || '',
      asn: data.network || '',
    })
  },
  {
    url: 'https://api.ip.sb/geoip/',
    name: 'ip.sb',
    buildUrl: (ip: string) => `https://api.ip.sb/geoip/${ip}`,
    formatter: (data: any, clientIP: string) => ({
      ip: clientIP, // 强制使用客户端IP
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
    url: 'https://ipapi.co/json/',
    name: 'ipapi.co',
    buildUrl: (ip: string) => `https://ipapi.co/${ip}/json/`,
    formatter: (data: any, clientIP: string) => ({
      ip: clientIP, // 强制使用客户端IP
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
    buildUrl: (ip: string) => `https://freeipapi.com/api/json/${ip}`,
    formatter: (data: any, clientIP: string) => ({
      ip: clientIP, // 强制使用客户端IP
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
    buildUrl: (ip: string) => `https://ipwhois.app/json/${ip}`,
    formatter: (data: any, clientIP: string) => ({
      ip: clientIP, // 强制使用客户端IP
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
const createFallbackResponse = (clientIP?: string) => {
  return {
    ip: clientIP || '无法获取',
    country_name: '未知',
    region: '未知',
    city: '未知',
    latitude: 0,
    longitude: 0,
    timezone: 'UTC',
    country_code: '',
    org: clientIP ? 'IP地址已获取，但地理位置信息查询失败' : '无法获取客户端IP地址',
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

// 验证IP地址格式
function isValidIP(ip: string): boolean {
  if (!ip) return false;
  
  // IPv4 正则表达式
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  // IPv6 正则表达式（简化版）
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.').map(Number);
    return parts.every(part => part >= 0 && part <= 255);
  }
  
  return ipv6Regex.test(ip);
}

// 检查是否为公网IP地址
function isPublicIP(ip: string): boolean {
  if (!isValidIP(ip) || isLocalIP(ip)) return false;
  
  // 检查是否为保留IP段
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return true; // IPv6 暂时认为是公网IP
  
  // 排除更多私有和保留IP段
  if (
    // 私有网络
    (parts[0] === 10) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    // 回环地址
    (parts[0] === 127) ||
    // 链路本地地址
    (parts[0] === 169 && parts[1] === 254) ||
    // 组播地址
    (parts[0] >= 224 && parts[0] <= 239) ||
    // 保留地址
    (parts[0] >= 240)
  ) {
    return false;
  }
  
  return true;
}

// 获取客户端真实IP地址
function getClientIP(request: NextRequest): string {
  // 定义需要检查的头部，按优先级排序
  // Cloudflare的cf-connecting-ip优先级最高，因为它包含用户真实IP
  const ipHeaders = [
    'cf-connecting-ip',     // Cloudflare - 用户真实IP，优先级最高
    'x-real-ip',            // Nginx代理常用
    'x-client-ip',          // Apache等使用
    'x-original-forwarded-for', // 原始转发
    'x-forwarded-for',      // 最常用的代理头部，但在Cloudflare环境下可能是边缘节点IP
    'x-cluster-client-ip',  // 集群环境
    'forwarded-for',        // 标准转发头
    'forwarded',            // RFC 7239标准
  ];
  
  console.log('开始检测客户端IP，检查所有可能的头部...');
  
  // 检查是否为Cloudflare环境
  const cfRay = request.headers.get('cf-ray');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  const isCloudflareEnv = !!(cfRay || cfConnectingIP);
  
  console.log('Cloudflare环境检测:', {
    cfRay: cfRay || 'none',
    cfConnectingIP: cfConnectingIP || 'none',
    isCloudflareEnv
  });
  
  // 如果是Cloudflare环境且有cf-connecting-ip，直接使用
  if (isCloudflareEnv && cfConnectingIP && isValidIP(cfConnectingIP)) {
    console.log(`Cloudflare环境检测到用户真实IP: ${cfConnectingIP}`);
    return cfConnectingIP;
  }
  
  // 记录所有找到的IP地址
  const foundIPs: { source: string; ip: string; isPublic: boolean }[] = [];
  
  for (const header of ipHeaders) {
    const headerValue = request.headers.get(header);
    if (!headerValue) continue;
    
    console.log(`检查头部 ${header}: ${headerValue}`);
    
    if (header === 'x-forwarded-for' || header === 'forwarded-for') {
      // 处理可能包含多个IP的情况
      const ips = headerValue.split(',').map(ip => ip.trim());
      for (const ip of ips) {
        if (isValidIP(ip)) {
          const isPublic = isPublicIP(ip);
          foundIPs.push({ source: `${header}[${ips.indexOf(ip)}]`, ip, isPublic });
          console.log(`  找到IP: ${ip} (${isPublic ? '公网' : '私网'})`);
        }
      }
    } else if (header === 'forwarded') {
      // 处理RFC 7239格式: for=192.0.2.60;proto=http;by=203.0.113.43
      const forMatch = headerValue.match(/for=([^;,\s]+)/i);
      if (forMatch) {
        const ip = forMatch[1].replace(/"/g, '');
        if (isValidIP(ip)) {
          const isPublic = isPublicIP(ip);
          foundIPs.push({ source: header, ip, isPublic });
          console.log(`  找到IP: ${ip} (${isPublic ? '公网' : '私网'})`);
        }
      }
    } else {
      // 处理单个IP的头部
      if (isValidIP(headerValue)) {
        const isPublic = isPublicIP(headerValue);
        foundIPs.push({ source: header, ip: headerValue, isPublic });
        console.log(`  找到IP: ${headerValue} (${isPublic ? '公网' : '私网'})`);
      }
    }
  }
  
  // 优先返回公网IP，按头部优先级排序
  const publicIPs = foundIPs.filter(item => item.isPublic);
  if (publicIPs.length > 0) {
    console.log(`选择公网IP: ${publicIPs[0].ip} (来源: ${publicIPs[0].source})`);
    return publicIPs[0].ip;
  }
  
  // 如果没有公网IP，返回第一个有效的私网IP（用于本地环境）
  if (foundIPs.length > 0) {
    console.log(`未找到公网IP，使用私网IP: ${foundIPs[0].ip} (来源: ${foundIPs[0].source})`);
    return foundIPs[0].ip;
  }
  
  console.log('未从任何头部找到有效IP');
  return '';
}

export async function GET(request: NextRequest) {
  const MAX_RETRIES = 3;
  let attempt = 0;
  let lastError: Error | null = null;
  
  // 获取客户端IP
  const clientIP = getClientIP(request);
  
  console.log('检测到的客户端IP:', clientIP || '未检测到客户端IP');
  
  // 如果无法获取客户端IP，直接返回错误
  if (!clientIP) {
    console.error('无法从请求头中获取客户端IP地址');
    return NextResponse.json(
      createFallbackResponse(),
      { 
        status: 400,
        headers: {
          'X-IP-Source': 'none',
          'X-Error': '无法从请求头中获取客户端IP地址',
          'X-Client-IP': 'not-detected',
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  }
  
  // 如果是本地IP，返回基本信息
  if (isLocalIP(clientIP)) {
    console.log('检测到本地IP，返回基本信息');
    return NextResponse.json({
      ip: clientIP,
      country_name: '本地环境',
      region: '本地',
      city: '本地',
      latitude: 0,
      longitude: 0,
      timezone: 'Asia/Shanghai',
      country_code: 'LOCAL',
      org: '本地开发环境',
      asn: '',
    }, {
      headers: {
        'X-IP-Source': 'local',
        'X-Client-IP': clientIP,
        'X-Is-Local-Env': 'true',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }
  
  // 随机打乱API服务列表
  const shuffledServices = shuffleArray(IP_GEO_SERVICES);
  
  while (attempt < MAX_RETRIES) {
    attempt++;
    console.log(`第 ${attempt} 次尝试获取IP地理位置信息...`);
    
    // 从打乱的列表中选择一个API
    const serviceIndex = (attempt - 1) % shuffledServices.length;
    const service = shuffledServices[serviceIndex];
    
    try {
      console.log(`使用 ${service.name} API 获取IP地理位置信息...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      // 构建API URL，指定要查询的客户端IP
      const apiUrl = service.buildUrl(clientIP);
      
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
      
      // 使用对应的格式化器处理数据，强制使用客户端IP
      const formattedData = service.formatter(rawData, clientIP);
      
      console.log(`成功从 ${service.name} 获取IP地理位置信息:`, formattedData);
      
      return NextResponse.json(formattedData, {
        headers: {
          'X-IP-Source': service.name,
          'X-IP-Selection': 'client-header',
          'X-Final-IP': clientIP,
          'X-Attempt': attempt.toString(),
          'X-Client-IP': clientIP,
          'X-Is-Local-Env': 'false',
          'X-Is-Public-IP': isPublicIP(clientIP).toString(),
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

  console.error(`所有 ${MAX_RETRIES} 次尝试均失败，返回客户端IP但无地理位置信息`);
  
  // 所有地理位置查询都失败，但至少返回客户端IP
  const fallbackData = createFallbackResponse(clientIP);
  
  return NextResponse.json(
    fallbackData,
    { 
      status: 206, // 部分内容
      headers: {
        'X-IP-Source': 'fallback',
        'X-Error': lastError?.message || '地理位置信息查询失败',
        'X-Client-IP': clientIP,
        'X-Is-Local-Env': 'false',
        'X-Is-Public-IP': isPublicIP(clientIP).toString(),
        'Cache-Control': 'no-store, max-age=0'
      }
    }
  );
} 