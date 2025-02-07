import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {

    const requestData = await request.json();
    const {agentApiTimeout, serviceId, tab, mode, purpose } = requestData;
    const clientCookie = request.headers.get('Cookie');

    const { host } = config.api.agent;
    const url = `https://${host}/QuickLogin`;
    const payload = {
        ...(serviceId ? {serviceId} : {agentApiTimeout, serviceId: ""}),
        tab,
        mode,
        purpose
    };

    try {

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'credentials': 'include',
                'Cookie': clientCookie
            },
            body: JSON.stringify(payload),
            mode: 'cors'
        });

        let setCookie;
        if(!serviceId) {
            setCookie = response.headers.get('set-cookie');
        }

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'QR Code', data)), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'credentials': 'include',
                'Set-Cookie': setCookie
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