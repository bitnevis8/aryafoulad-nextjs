import { API_ENDPOINTS } from "@/app/config/api";

export async function POST(request) {
  try {
    const body = await request.json();

    // Forward the request to the backend API
    const backendResponse = await fetch(API_ENDPOINTS.auth.registerEmail, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // گرفتن Set-Cookie از پاسخ بک‌اند
    const setCookieHeader = backendResponse.headers.get('set-cookie');
    const data = await backendResponse.json();

    const response = new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // اگر کوکی ست شد، به کلاینت پاس بده
    if (setCookieHeader) {
      response.headers.append('Set-Cookie', setCookieHeader);
    }

    return response;
  } catch (error) {
    console.error("Error proxying register-email request:", error);
    return new Response(JSON.stringify({ success: false, message: "Internal Server Error" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 