import ResponseModel from "@/models/ResponseModel";
import { fetchActiveNeuronJson } from '@/lib/neuronUpstream';

export async function POST(request) {
    try {
        const requestData = await request.json();
        const { maxCount, offset } = requestData;

        const payload = {
            maxCount,
            offset: offset || 0,
        };

        const { response, body: data } = await fetchActiveNeuronJson(request, {
            path: '/ApiKeys.ws',
            payload,
        });

        if (!response.ok) {
            return new Response(
                JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)),
                {
                    status: response.status,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        return new Response(
            JSON.stringify(new ResponseModel(200, "", data)),
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );

    } catch (error) {
        console.error("Error fetching API keys:", error);
        return new Response(
            JSON.stringify(new ResponseModel(500, "Internal Server Error")),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}
