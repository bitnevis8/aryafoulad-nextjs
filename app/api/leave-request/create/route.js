import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://aryafoulad-api.pourdian.com' : 'http://localhost:3000');
    const response = await fetch(`${apiUrl}/leave-request/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'خطا در ثبت درخواست مرخصی' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ارتباط با سرور' },
      { status: 500 }
    );
  }
} 