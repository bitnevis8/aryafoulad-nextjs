import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://aryafoulad-api.pourdian.com' : 'http://localhost:3000');

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/user/user/getAll`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت اطلاعات کاربران' },
      { status: 500 }
    );
  }
} 