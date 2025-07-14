import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aryafoulad-api.pourdian.com';
    console.log('Testing leave-request endpoint at:', apiUrl);
    
    // Test without authentication first
    const response = await fetch(`${apiUrl}/leave-request/types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('Test response status:', response.status);
    
    const data = await response.json();
    console.log('Test response data:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Test completed',
      apiUrl,
      status: response.status,
      data
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Test failed: ' + error.message,
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    }, { status: 500 });
  }
} 