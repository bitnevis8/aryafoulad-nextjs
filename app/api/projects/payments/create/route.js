import { API_ENDPOINTS } from "@/app/config/api";

export async function POST(request) {
  try {
    const body = await request.json();
    const backendResponse = await fetch(API_ENDPOINTS.projects.payments.create, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include'
    });
    const data = await backendResponse.json();
    return new Response(JSON.stringify(data), { status: backendResponse.status, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: 'Internal Server Error' }), { status: 500 });
  }
}

