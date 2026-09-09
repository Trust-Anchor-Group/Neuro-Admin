import ResponseModel from "@/models/ResponseModel";
import { fetchActiveNeuronJson } from '@/lib/neuronUpstream';

export async function POST(request) {
  try {
    const { apiKey, expires } = await request.json();

    if (!apiKey || !expires) {
      return new Response(JSON.stringify({ error: "Missing parameters: apiKey and expires are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { response, body: data } = await fetchActiveNeuronJson(request, {
      path: '/ApiKey.ws',
      payload: { apiKey, expires },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), { status: response.status });
    }

    return new Response(JSON.stringify(new ResponseModel(200, "", data)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating API Key QR Code:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
