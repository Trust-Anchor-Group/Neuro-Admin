import { cookies } from 'next/headers';
import setCookie from 'set-cookie-parser';
import { NextResponse } from 'next/server';
import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";
import { getActiveNeuronContext, getDefaultNeuronHost, setNeuronSessionCookies } from '@/lib/neuronSessionContext';

export async function POST(request) {

    const requestData = await request.json();
    const { agentApiTimeout, serviceId, tab, mode, purpose } = requestData;

    const cookieStore = await cookies();
    const activeContext = serviceId ? await getActiveNeuronContext(request) : null;
    const host = activeContext?.host || getDefaultNeuronHost() || config.api.agent.host;
    const url = `https://${host}/QuickLogin`;

    const payload = {
        ...(serviceId ? { serviceId } : { agentApiTimeout, serviceId: "" }),
        tab,
        mode,
        purpose
    };

    let clientCookie;
    if (serviceId) {
        const clientCookieObject = cookieStore.get('HttpSessionID');

        clientCookie = clientCookieObject
            ? `HttpSessionID=${encodeURIComponent(clientCookieObject.value)}`
            : null;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(serviceId && clientCookie ? { 'Cookie': clientCookie } : {})
            },
            body: JSON.stringify(payload),
        });

        const contentType = response.headers.get('content-type');
        const data = contentType?.includes('application/json')
            ? await response.json()
            : await response.text();
        const nextRes = NextResponse.json(
            new ResponseModel(
                response.ok ? 200 : response.status,
                response.ok ? 'QR Code' : `Error: ${data}`,
                data
            ),
            { status: response.ok ? 200 : response.status }
        );

        if (!serviceId && response.ok) {
            const neuroCookies = response.headers.get('set-cookie');

            if (neuroCookies) {
                const parsedCookies = setCookie.parse(neuroCookies, {
                    decodeValues: false,
                    map: true
                });
                const sessionCookie = parsedCookies['HttpSessionID'];

                if (sessionCookie) {
                    await setNeuronSessionCookies(nextRes, {
                        host,
                        sessionCookieValue: sessionCookie.value,
                        activate: true,
                    });
                }
            }

        }

        return nextRes;

    } catch (error) {
        return NextResponse.json(
            new ResponseModel(
                error.statusCode || 500,
                error.message || 'Internal Server Error'
            ),
            { status: error.statusCode || 500 }
        );
    }
}
