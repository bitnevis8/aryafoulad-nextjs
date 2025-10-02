import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/app/config/api';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cookie = request.headers.get('cookie') || '';
  const type = searchParams.get('type');
  const url = type ? `${API_ENDPOINTS.accounting.invoices.getAll}?type=${type}` : API_ENDPOINTS.accounting.invoices.getAll;
  const res = await fetch(url, { credentials: 'include', headers: { 'Content-Type': 'application/json', Cookie: cookie } });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}


