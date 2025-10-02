import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/app/config/api';

export async function GET(request) {
  const res = await fetch(API_ENDPOINTS.companySignature.download, {
    method: 'GET',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
  
  if (!res.ok) {
    return NextResponse.json({ success: false, message: 'امضای شرکت یافت نشد' }, { status: 404 });
  }
  
  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get('content-type') || 'image/png';
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    }
  });
}
