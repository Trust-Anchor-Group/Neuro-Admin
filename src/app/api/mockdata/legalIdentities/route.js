import ResponseModel from "@/models/ResponseModel";
import config from '@/config/config';
import { cookies } from "next/headers";

export async function GET(req) {

    const cookieStore = await cookies();
    const clientCookieObject = cookieStore.get('HttpSessionID');
    const clientCookie = clientCookieObject
        ? `HttpSessionID=${encodeURIComponent(clientCookieObject.value)}`
        : null;

    try {
        const { host } = config.api.agent;
        const url = `https://${host}/LegalIdentities.ws`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': clientCookie,
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                'maxCount': 10,
                'offset': 0
            })
        });

        const contentType = response.headers.get('content-type');
        const responseData = contentType.includes('application/json')
            ? await response.json()
            : await response.text();

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