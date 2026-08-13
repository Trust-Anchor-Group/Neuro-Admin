import ResponseModel from "@/models/ResponseModel";
import { getActiveNeuronContext } from '@/lib/neuronSessionContext';
import { buildNeuronHeaders, readNeuronResponseBody } from '@/lib/neuronUpstream';

export async function POST(request) {
    const requestData = await request.json();
    const activeContext = await getActiveNeuronContext(request);
    const url = `https://${activeContext.host}/DeleteAccount`;
    const accountName = requestData.accountName;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: buildNeuronHeaders({
                upstreamCookieHeader: activeContext.upstreamCookieHeader,
                contentType: 'text/plain; charset=utf-8',
                accept: null,
            }),
            body: accountName,
        });

        const { body: data } = await readNeuronResponseBody(response);

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), {
                status: response.status,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8'
                }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'Account succesfully deleted', data)), {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            }
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
            status: statusCode,
            headers: {
                "Content-Type": "text/plain; charset=utf-8"
            }
        }
        );
    }
}
