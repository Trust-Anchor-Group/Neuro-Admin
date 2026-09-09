import ResponseModel from "@/models/ResponseModel";
import { getActiveNeuronContext } from '@/lib/neuronSessionContext';
import { buildNeuronHeaders, readNeuronResponseBody } from '@/lib/neuronUpstream';

export async function POST(request) {
    const activeContext = await getActiveNeuronContext(request);
    const url = `https://${activeContext.host}/Ping`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: buildNeuronHeaders({
                upstreamCookieHeader: activeContext.upstreamCookieHeader,
            }),
        });

        const { body: data } = await readNeuronResponseBody(response);

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'Ping', data)), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Fetch error:", error);
        return new Response(JSON.stringify(new ResponseModel(500, "Internal Server Error")), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
