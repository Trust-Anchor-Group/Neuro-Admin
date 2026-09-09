import ResponseModel from "@/models/ResponseModel";
import { getActiveNeuronContext } from '@/lib/neuronSessionContext';
import { buildNeuronHeaders, readNeuronResponseBody } from '@/lib/neuronUpstream';

export async function POST(request) {
    const activeContext = await getActiveNeuronContext(request);
    const url = `https://${activeContext.host}/logout`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: buildNeuronHeaders({
                upstreamCookieHeader: activeContext.upstreamCookieHeader,
            }),
            redirect: "manual"
        });

        console.log("Upstream logout status:", response.status);

        const { body: data } = await readNeuronResponseBody(response);

        if (response.status === 200 || response.status === 303) {
            return new Response(
                JSON.stringify(new ResponseModel(200, "Logout successful", data)),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        return new Response(
            JSON.stringify(new ResponseModel(response.status, `Error: ${data || "Unknown error"}`)),
            {
                status: response.status,
                headers: { "Content-Type": "application/json" }
            }
        );

    } catch (error) {
        console.error("Fetch error:", error);
        return new Response(
            JSON.stringify(new ResponseModel(500, "Internal Server Error")),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}
