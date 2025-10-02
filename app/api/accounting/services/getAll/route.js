import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/app/config/api';

export async function GET(request) {
  const cookie = request.headers.get('cookie') || '';
  const res = await fetch(API_ENDPOINTS.accounting.services.getAll, { headers: { Cookie: cookie }, credentials: 'include' });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}


