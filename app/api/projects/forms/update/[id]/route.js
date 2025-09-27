import { API_ENDPOINTS } from "@/app/config/api";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const backendResponse = await fetch(`${API_ENDPOINTS.projects.base}/forms/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });

    const data = await backendResponse.json();
    return new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Internal Server Error' }), { status: 500 });
  }
}
