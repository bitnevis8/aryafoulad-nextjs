import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://aryafoulad-api.pourdian.com' : 'http://localhost:3000');
    const response = await fetch(`${apiUrl}/leave-request/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Backend error:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'خطا در دریافت درخواست‌های مرخصی' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching all leave requests:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ارتباط با سرور: ' + error.message },
      { status: 500 }
    );
  }
} 