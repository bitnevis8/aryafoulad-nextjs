import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Leave request create - Request body:', body);
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://aryafoulad-api.pourdian.com:3010' : 'http://localhost:3000');
    console.log('Leave request create - API URL:', apiUrl);
    console.log('Leave request create - NODE_ENV:', process.env.NODE_ENV);
    
    const response = await fetch(`${apiUrl}/leave-request/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    console.log('Leave request create - Response status:', response.status);
    const data = await response.json();
    console.log('Leave request create - Response data:', data);
    
    if (!response.ok) {
      console.error('Leave request create - Backend error:', data);
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