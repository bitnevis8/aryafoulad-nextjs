import { API_ENDPOINTS } from "@/app/config/api";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const backendResponse = await fetch(`${API_ENDPOINTS.projects.forms.delete(id)}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await backendResponse.json();
    return new Response(JSON.stringify(data), { 
      status: backendResponse.status, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: 'Internal Server Error' }), { status: 500 });
  }
}
