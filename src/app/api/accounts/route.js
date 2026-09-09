import ResponseModel from "@/models/ResponseModel";
import { fetchActiveNeuronJson } from '@/lib/neuronUpstream';

export async function POST(request) {
    const payload = {};

    try {
        const { response, body } = await fetchActiveNeuronJson(request, {
            path: '/Accounts.ws',
            payload,
        });

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${body}`)), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, '', body)), {
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
