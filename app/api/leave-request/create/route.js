import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Creating leave request with data:', body);
    
    // در Next.js API routes، NODE_ENV درست کار نمی‌کند، پس مستقیماً از متغیر محیطی استفاده می‌کنیم
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aryafoulad-api.pourdian.com';
    console.log('API URL:', apiUrl);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    
    // Get all cookies from the request
    const cookies = request.headers.get('cookie') || '';
    console.log('Cookies from request:', cookies);
    
    const response = await fetch(`${apiUrl}/leave-request/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
        'Accept': 'application/json',
        'Origin': request.headers.get('origin') || '',
        'Referer': request.headers.get('referer') || '',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Backend response data:', data);
    
    if (!response.ok) {
      console.error('Backend error:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'خطا در ثبت درخواست مرخصی' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ارتباط با سرور: ' + error.message },
      { status: 500 }
    );
  }
} 