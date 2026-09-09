import ResponseModel from "@/models/ResponseModel";
import { fetchActiveNeuronJson } from '@/lib/neuronUpstream';

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const decodedId = decodeURIComponent(Array.isArray(id) ? id[0] : id);
    const tokenIdParam = decodedId;
    if (!tokenIdParam) {
      return new Response(
        JSON.stringify(new ResponseModel(400, "tokenId is required.")),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { response, body: data } = await fetchActiveNeuronJson(request, {
      path: '/nex-api/getTokenDetails.ws',
      payload: { tokenId: tokenIdParam },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(new ResponseModel(200, "", data)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const statusCode = error?.statusCode || 500;
    const message = error?.message || "Internal Server Error";
    return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const requestData = await request.json();
    const tokenId = requestData?.tokenId;
    if (!tokenId) {
      return new Response(
        JSON.stringify(new ResponseModel(400, "tokenId is required.")),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { response, body: data } = await fetchActiveNeuronJson(request, {
      path: '/nex-api/getTokenDetails.ws',
      payload: { tokenId },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(new ResponseModel(200, "", data)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const statusCode = error?.statusCode || 500;
    const message = error?.message || "Internal Server Error";
    return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}
