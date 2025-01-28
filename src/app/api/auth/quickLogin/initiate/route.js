import config from '@/config/config';
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {

    const requestBody = await request.json();
    const { serviceId, tabId } = requestBody;

    const { host } = config.api.agent;
    const url = `${host}/QuickLogin`;
    const payLoad = {
        serviceId,
        tab: tabId,
        mode: 'image',
        purpose: 'Login to Neuro-admin',
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
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), { headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'Successfully fetched QR code', data)), { headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify(new ResponseModel(error.statusCode, error.message)), { headers: { 'Content-Type': 'application/json' } });
    }
}