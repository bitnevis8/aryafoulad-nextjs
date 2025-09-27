import { API_ENDPOINTS } from "@/app/config/api";

export async function GET(request) {
  try {
    const url = new URL(API_ENDPOINTS.inspectionRequests.getAll);
    const reqUrl = new URL(request.url);
    reqUrl.searchParams.forEach((v,k)=>url.searchParams.set(k,v));
    const backendResponse = await fetch(url.toString(), {
      method: 'GET',
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
