import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/app/config/api';

export async function DELETE(request, { params }) {
  const cookie = request.headers.get('cookie') || '';
  const res = await fetch(API_ENDPOINTS.accounting.bankAccounts.delete(params.id), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    credentials: 'include'
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}




