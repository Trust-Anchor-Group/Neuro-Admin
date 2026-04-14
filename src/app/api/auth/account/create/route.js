import { createHmac, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import setCookie from 'set-cookie-parser';
import { resolveAgentHost } from '@/lib/agentHost';
import ResponseModel from '@/models/ResponseModel';

const DEFAULT_SECONDS = 3600;
const MIN_SECONDS = 1;
const MAX_SECONDS = 3600;
const MIN_NONCE_LENGTH = 32;

function getOptionalString(value) {
    if (typeof value !== 'string') return undefined;

    const normalizedValue = value.trim();
    return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function getRequiredString(value) {
    return getOptionalString(value) || null;
}

function getSeconds(value) {
    if (value === undefined || value === null || value === '') return DEFAULT_SECONDS;

    const normalizedValue = Number(value);
    if (!Number.isInteger(normalizedValue)) return null;
    if (normalizedValue < MIN_SECONDS || normalizedValue > MAX_SECONDS) return null;

    return normalizedValue;
}

function getCredential(value, envValue) {
    const normalizedValue = getOptionalString(value);
    return normalizedValue || getOptionalString(envValue) || null;
}

function buildSignature({ userName, host, eMail, phoneNr, password, apiKey, nonce, secret }) {
    const signatureBase = [
        userName,
        host,
        eMail,
        ...(phoneNr ? [phoneNr] : []),
        password,
        apiKey,
        nonce,
    ].join(':');

    return createHmac('sha256', Buffer.from(secret, 'utf8'))
        .update(signatureBase, 'utf8')
        .digest('base64');
}

function collectAlternativeNames(headers) {
    const alternativeNames = [];

    for (const [headerName, headerValue] of headers.entries()) {
        if (!headerName.toLowerCase().startsWith('x-alternativename')) continue;

        const numericSuffix = Number.parseInt(headerName.replace(/[^0-9]/g, ''), 10);
        alternativeNames.push({
            order: Number.isNaN(numericSuffix) ? Number.MAX_SAFE_INTEGER : numericSuffix,
            value: headerValue,
            headerName,
        });
    }

    return alternativeNames.sort((left, right) => left.order - right.order);
}

function withAlternativeNames(data, alternativeNames) {
    if (alternativeNames.length === 0) return data;

    return {
        ...(typeof data === 'object' && data !== null ? data : { error: data }),
        alternativeNames: alternativeNames.map(({ value }) => value),
    };
}

function propagateAlternativeHeaders(response, alternativeNames) {
    for (const { headerName, value } of alternativeNames) {
        response.headers.set(headerName, value);
    }
}

function propagateSessionCookie(upstreamResponse, response) {
    const setCookieHeader = upstreamResponse.headers.get('set-cookie');
    if (!setCookieHeader) return;

    const parsedCookies = setCookie.parse(setCookieHeader, {
        decodeValues: false,
        map: true,
    });
    const sessionCookie = parsedCookies.HttpSessionID;

    if (!sessionCookie) return;

    response.cookies.set('HttpSessionID', sessionCookie.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
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

    const userName = getRequiredString(requestData?.userName ?? requestData?.UserName);
    const eMail = getRequiredString(requestData?.eMail ?? requestData?.EMail);
    const password = getRequiredString(requestData?.password ?? requestData?.Password);
    const phoneNr = getOptionalString(requestData?.phoneNr ?? requestData?.PhoneNr);
    const apiKey = getCredential(requestData?.apiKey ?? requestData?.ApiKey, process.env.AGENT_CREATE_API_KEY ?? process.env.AGENT_API_KEY);
    const secret = getCredential(requestData?.secret ?? requestData?.Secret, process.env.AGENT_CREATE_SECRET ?? process.env.AGENT_API_SECRET);
    const seconds = getSeconds(requestData?.seconds ?? requestData?.Seconds);
    const nonce = getOptionalString(requestData?.nonce ?? requestData?.Nonce) || randomBytes(32).toString('hex');
    const host = resolveAgentHost(request.headers);

    if (!userName || !eMail || !password) {
        return NextResponse.json(
            new ResponseModel(400, 'Missing required fields: userName, eMail, password'),
            { status: 400 }
        );
    }

    if (!apiKey || !secret) {
        return NextResponse.json(
            new ResponseModel(500, 'Missing Agent API credentials. Provide apiKey and secret in the request body or server environment.'),
            { status: 500 }
        );
    }

    if (!host) {
        return NextResponse.json(
            new ResponseModel(500, 'Agent host is not configured'),
            { status: 500 }
        );
    }

    if (seconds === null) {
        return NextResponse.json(
            new ResponseModel(400, `seconds must be an integer between ${MIN_SECONDS} and ${MAX_SECONDS}`),
            { status: 400 }
        );
    }

    if (nonce.length < MIN_NONCE_LENGTH) {
        return NextResponse.json(
            new ResponseModel(400, `nonce must be at least ${MIN_NONCE_LENGTH} characters long`),
            { status: 400 }
        );
    }

    const payload = {
        userName,
        eMail,
        ...(phoneNr ? { phoneNr } : {}),
        password,
        apiKey,
        nonce,
        signature: buildSignature({ userName, host, eMail, phoneNr, password, apiKey, nonce, secret }),
        seconds,
    };

    try {
        const upstreamResponse = await fetch(`https://${host}/Agent/Account/Create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const contentType = upstreamResponse.headers.get('content-type') || '';
        const responseData = contentType.includes('application/json')
            ? await upstreamResponse.json()
            : await upstreamResponse.text();
        const alternativeNames = collectAlternativeNames(upstreamResponse.headers);
        const nextResponse = NextResponse.json(
            new ResponseModel(
                upstreamResponse.ok ? 200 : upstreamResponse.status,
                upstreamResponse.ok ? 'Account successfully created' : 'Account creation failed',
                withAlternativeNames(responseData, alternativeNames)
            ),
            { status: upstreamResponse.ok ? 200 : upstreamResponse.status }
        );

        propagateAlternativeHeaders(nextResponse, alternativeNames);
        propagateSessionCookie(upstreamResponse, nextResponse);

        return nextResponse;
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