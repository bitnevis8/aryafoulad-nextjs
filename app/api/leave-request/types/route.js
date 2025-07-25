import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/leave-request/types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'خطا در دریافت انواع مرخصی' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching leave types:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ارتباط با سرور' },
      { status: 500 }
    );
  }
} 