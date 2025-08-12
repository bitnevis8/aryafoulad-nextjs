import { API_ENDPOINTS } from "@/app/config/api";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const backendResponse = await fetch(API_ENDPOINTS.projects.requests.updateStatus(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include'
    });
    const data = await backendResponse.json();
    return new Response(JSON.stringify(data), { status: backendResponse.status, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Internal Server Error' }), { status: 500 });
  }
}

