import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/app/config/api';

export async function POST(request, { params }) {
  const { id } = params;
  const cookie = request.headers.get('cookie') || '';
  const res = await fetch(API_ENDPOINTS.accounting.invoices.convert(id), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    credentials: 'include',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}


