import ResponseModel from "@/models/ResponseModel";
import { fetchActiveNeuronJson } from '@/lib/neuronUpstream';

export async function GET(req) {
    try {
        const { response, body: responseData } = await fetchActiveNeuronJson(req, {
            path: '/LegalIdentities.ws',
            payload: {
                maxCount: 10,
                offset: 0,
            },
        });

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${responseData}`)), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'Successfully fetched legal identities', responseData)), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
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
