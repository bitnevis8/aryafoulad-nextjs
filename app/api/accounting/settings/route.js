import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/app/config/api';

export async function GET(request) {
  const cookie = request.headers.get('cookie') || '';
  const res = await fetch(API_ENDPOINTS.accounting.settings.get, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    credentials: 'include'
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request) {
  const body = await request.json();
  const cookie = request.headers.get('cookie') || '';
  const res = await fetch(API_ENDPOINTS.accounting.settings.update, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    credentials: 'include',
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}


