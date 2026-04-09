import { NextResponse } from 'next/server';
import { resolveAgentHost } from '@/lib/agentHost';
import ResponseModel from '@/models/ResponseModel';

function getOptionalString(value) {
    if (typeof value !== 'string') return undefined;

    const normalizedValue = value.trim();
    return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function getRequiredString(value) {
    return getOptionalString(value) || null;
}

function getCode(value) {
    if (value === undefined || value === null || value === '') return null;

    const normalizedValue = Number(value);
    if (!Number.isInteger(normalizedValue) || normalizedValue < 0) return null;

    return normalizedValue;
}

export async function POST(request) {
    let requestData;

    try {
        requestData = await request.json();
    } catch {
        return NextResponse.json(
            new ResponseModel(400, 'Invalid JSON payload'),
            { status: 400 }
        );
    }

    const phoneNr = getRequiredString(requestData?.phoneNr ?? requestData?.PhoneNr);
    const code = getCode(requestData?.code ?? requestData?.Code);
    const host = resolveAgentHost(request.headers);

    if (!phoneNr || code === null) {
        return NextResponse.json(
            new ResponseModel(400, 'Missing required fields: phoneNr, code'),
            { status: 400 }
        );
    }

    if (!host) {
        return NextResponse.json(
            new ResponseModel(500, 'Agent host is not configured'),
            { status: 500 }
        );
    }

    try {
        const upstreamResponse = await fetch(`https://${host}/Agent/Account/VerifyPhoneNr`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ phoneNr, code }),
        });

        const contentType = upstreamResponse.headers.get('content-type') || '';
        const responseData = contentType.includes('application/json')
            ? await upstreamResponse.json()
            : await upstreamResponse.text();

        return NextResponse.json(
            new ResponseModel(
                upstreamResponse.ok ? 200 : upstreamResponse.status,
                upstreamResponse.ok ? 'Phone number verified' : 'Phone number verification failed',
                responseData
            ),
            { status: upstreamResponse.ok ? 200 : upstreamResponse.status }
        );
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