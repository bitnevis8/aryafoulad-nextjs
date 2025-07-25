import { API_ENDPOINTS } from "@/app/config/api";

export async function POST(request) {
  try {
    const backendResponse = await fetch(API_ENDPOINTS.auth.logout, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    const data = await backendResponse.json();

    const response = new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Set-Cookie header for deleting the token cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieParts = [
      'token=;',
      'Path=/',
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'HttpOnly',
      isProduction ? 'Domain=.pourdian.com' : '',
      isProduction ? 'SameSite=None' : 'SameSite=Lax',
      isProduction ? 'Secure' : '',
    ].filter(Boolean);
    response.headers.set('Set-Cookie', cookieParts.join('; '));

    return response;
  } catch (error) {
    console.error("Error proxying /logout request:", error);
    return new Response(JSON.stringify({ success: false, message: "Internal Server Error" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 