import { API_ENDPOINTS } from "@/app/config/api";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    const backendResponse = await fetch(`${API_ENDPOINTS.inspectionRequests.base}/convertToProject/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
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
