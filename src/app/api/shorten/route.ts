import { NextRequest, NextResponse } from 'next/server';

// 短链接服务配置
const shortenerServices = [
  {
    id: 'yuanmeng',
    name: '远梦API',
    apiUrl: 'https://api.mmp.cc/api/dwz',
    method: 'GET'
  },
  {
    id: 'tinyurl',
    name: 'TinyURL',
    apiUrl: 'https://tinyurl.com/api-create.php',
    method: 'GET'
  },
  {
    id: 'ulvis',
    name: 'Ulvis',
    apiUrl: 'https://ulvis.net/API/write/get',
    method: 'GET'
  },
  {
    id: 'vgd',
    name: 'v.gd',
    apiUrl: 'https://v.gd/create.php',
    method: 'GET'
  }
];

export async function POST(request: NextRequest) {
  try {
    const { url, serviceId } = await request.json();

    if (!url || !serviceId) {
      return NextResponse.json(
        { error: '缺少必要参数：url 和 serviceId' },
        { status: 400 }
      );
    }

    const service = shortenerServices.find(s => s.id === serviceId);
    if (!service) {
      return NextResponse.json(
        { error: '不支持的短链接服务' },
        { status: 400 }
      );
    }

    let shortenedUrl: string;

    switch (serviceId) {
      case 'yuanmeng':
        const yuanmengResponse = await fetch(`${service.apiUrl}?longurl=${encodeURIComponent(url)}`);
        if (!yuanmengResponse.ok) {
          throw new Error(`远梦API请求失败：${yuanmengResponse.status}`);
        }
        const yuanmengData = await yuanmengResponse.json();
        if (yuanmengData.status !== 200 || !yuanmengData.shorturl) {
          throw new Error('远梦API返回格式错误');
        }
        shortenedUrl = yuanmengData.shorturl;
        break;

      case 'tinyurl':
        const tinyurlResponse = await fetch(`${service.apiUrl}?url=${encodeURIComponent(url)}`);
        if (!tinyurlResponse.ok) {
          throw new Error(`TinyURL请求失败：${tinyurlResponse.status}`);
        }
        shortenedUrl = await tinyurlResponse.text();
        if (!shortenedUrl.startsWith('http')) {
          throw new Error('TinyURL返回格式错误');
        }
        shortenedUrl = shortenedUrl.trim();
        break;

      case 'ulvis':
        const ulvisResponse = await fetch(`${service.apiUrl}?url=${encodeURIComponent(url)}&type=json`);
        if (!ulvisResponse.ok) {
          throw new Error(`Ulvis请求失败：${ulvisResponse.status}`);
        }
        const ulvisData = await ulvisResponse.json();
        if (!ulvisData.success || !ulvisData.data || !ulvisData.data.url) {
          throw new Error('Ulvis返回格式错误或API调用失败');
        }
        shortenedUrl = ulvisData.data.url;
        break;

      case 'vgd':
        const vgdResponse = await fetch(`${service.apiUrl}?format=simple&url=${encodeURIComponent(url)}`);
        if (!vgdResponse.ok) {
          throw new Error(`v.gd请求失败：${vgdResponse.status}`);
        }
        shortenedUrl = await vgdResponse.text();
        if (!shortenedUrl.startsWith('http')) {
          throw new Error('v.gd返回格式错误');
        }
        shortenedUrl = shortenedUrl.trim();
        break;

      default:
        throw new Error('未实现的服务');
    }

    return NextResponse.json({
      success: true,
      shortUrl: shortenedUrl,
      service: service.name
    });

  } catch (error) {
    console.error('短链接生成错误:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '生成短链接时发生未知错误'
      },
      { status: 500 }
    );
  }
} 