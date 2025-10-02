import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/app/config/api';

export async function GET(request, { params }) {
  const { id } = params;
  const cookie = request.headers.get('cookie') || '';
  const res = await fetch(API_ENDPOINTS.accounting.invoices.getOne(id), { credentials: 'include', headers: { Cookie: cookie } });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}


