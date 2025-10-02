import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/app/config/api';

export async function PUT(request, { params }) {
  const body = await request.json();
  const cookie = request.headers.get('cookie') || '';
  const res = await fetch(API_ENDPOINTS.accounting.bankAccounts.update(params.id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    credentials: 'include',
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}




