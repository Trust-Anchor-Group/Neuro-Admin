import ResponseModel from "@/models/ResponseModel";
import { fetchActiveNeuronJson } from '@/lib/neuronUpstream';

export async function POST(request) {
    const requestData = await request.json();
    const { userName } = requestData;

    const payload = {
        userName
    };

    try {
        const { response, body } = await fetchActiveNeuronJson(request, {
            path: '/account.ws',
            payload,
        });

        let filteredData;

        if (body && typeof body === 'object' && body.account) {
            filteredData = {
                country: body.account.country,
                firstName: body.account.firstName,
                lastNames: body.account.lastNames,
                eMail: body.account.eMail,
                userName: body.account.userName,
                created: body.account.created
            };
        }

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${body}`)), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'Account returned', { data: filteredData })), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            }
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
            status: statusCode,
            headers: {
                "Content-Type": "application/json"
            }
        }
        );
    }
}
