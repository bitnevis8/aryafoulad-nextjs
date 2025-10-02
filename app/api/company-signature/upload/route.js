import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/app/config/api';

export async function POST(request) {
  const formData = await request.formData();
  const cookie = request.headers.get('cookie') || '';
  
  const res = await fetch(API_ENDPOINTS.companySignature.upload, {
    method: 'POST',
    headers: { Cookie: cookie },
    credentials: 'include',
    body: formData
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
