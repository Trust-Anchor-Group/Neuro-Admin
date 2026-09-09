import ResponseModel from "@/models/ResponseModel";
import { getActiveNeuronContext } from '@/lib/neuronSessionContext';
import { buildNeuronHeaders, readNeuronResponseBody } from '@/lib/neuronUpstream';

export async function POST(request) {
    const requestData = await request.json();
    const activeContext = await getActiveNeuronContext(request);
    const url = `https://${activeContext.host}/CreateAccount`;

    const queryString = new URLSearchParams({
        UserName: requestData.UserName,
        Password: requestData.Password,
        EMail: requestData.EMail,
        PhoneNr: requestData.PhoneNr
      }).toString();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: buildNeuronHeaders({
                upstreamCookieHeader: activeContext.upstreamCookieHeader,
                contentType: 'application/x-www-form-urlencoded',
                accept: null,
            }),
            body: queryString,
        });

        const { body: data } = await readNeuronResponseBody(response);

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'Account succesfully created', data)), {
            status: 200,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
            status: statusCode,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
        );
    }
}
