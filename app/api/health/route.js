import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aryafoulad-api.pourdian.com';
    console.log('Health check - API URL:', apiUrl);
    
    // Test basic connectivity
    const response = await fetch(`${apiUrl}/user/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
    });

    console.log('Health check - Response status:', response.status);
    
    const data = await response.json();
    console.log('Health check - Response data:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Health check completed',
      apiUrl,
      status: response.status,
      authenticated: response.status !== 401,
      data: response.status === 200 ? data : null
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      success: false,
      message: 'Health check failed: ' + error.message,
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      error: error.message
    }, { status: 500 });
  }
} 