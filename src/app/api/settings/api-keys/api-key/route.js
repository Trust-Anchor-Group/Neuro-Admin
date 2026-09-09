import ResponseModel from "@/models/ResponseModel";
import { fetchActiveNeuronJson } from '@/lib/neuronUpstream';

export async function POST(request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API key parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { response, body: data } = await fetchActiveNeuronJson(request, {
      path: '/ApiKey.ws',
      payload: { apiKey },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), { status: response.status });
    }

    return new Response(JSON.stringify(new ResponseModel(200, "", data)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
