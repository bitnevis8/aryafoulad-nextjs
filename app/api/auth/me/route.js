import { API_ENDPOINTS } from "@/app/config/api";

export async function GET(request) {
  try {
    // Forward cookies to the backend (important for JWT token)
    const cookies = request.headers.get('cookie');
    console.log("Cookies received in /api/auth/me proxy:", cookies);

    const backendResponse = await fetch(API_ENDPOINTS.auth.me, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || '', // Forward cookies
      },
    });

    // Get the Set-Cookie header from backend response
    const setCookieHeader = backendResponse.headers.get('Set-Cookie');

    const data = await backendResponse.json();
    
    const response = new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If backend sets a cookie, propagate it to the frontend
    if (setCookieHeader) {
      response.headers.append('Set-Cookie', setCookieHeader);
    }

    return response;
  } catch (error) {
    console.error("Error proxying /me request:", error);
    return new Response(JSON.stringify({ success: false, message: "Internal Server Error" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 