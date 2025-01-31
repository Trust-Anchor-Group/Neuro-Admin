import config from '@/config/config';
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {

    const requestBody = await request.json();
    const { service, sessionId } = requestBody;

    const { host } = config.api.agent;
    const url = `${host}/QuickLogin`;
    const payLoad = {
        service, // Should be a callback URL
        sessionId
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(payLoad)
        })

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, data || 'Failed to fetch Service ID')), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'Successfully fetched Service ID', data)), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        return new Response(JSON.stringify(new ResponseModel(statusCode, message)),{
                status: statusCode,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}