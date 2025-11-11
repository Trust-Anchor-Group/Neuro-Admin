import { cookies } from 'next/headers';
import setCookie from 'set-cookie-parser';
import { NextResponse } from 'next/server';
import config from '@/config/config';
import ResponseModel from '@/models/ResponseModel';

// POST /api/auth/refresh
// Forwards a refresh request to upstream Agent API: /Agent/Account/Refresh
// Body: { seconds?: number } (defaults to 3600)
// Passes through Authorization header (if provided) and HttpSessionID cookie.
export async function POST(request) {
  let seconds = 3600;
  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      const body = await request.json();
      if (body?.seconds && Number.isFinite(body.seconds)) seconds = body.seconds;
    }
  } catch (e) {
    // Ignore malformed body; keep default seconds
  }

  const { host } = config.api.agent;
  const url = `https://${host}/Agent/Account/Refresh`;

  const authHeader = request.headers.get('authorization');

  // Session cookie from incoming request (if present)
  const cookieStore = await cookies();
  const sessionCookieObj = cookieStore.get('HttpSessionID');
  const sessionCookie = sessionCookieObj ? `HttpSessionID=${encodeURIComponent(sessionCookieObj.value)}` : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(authHeader ? { 'Authorization': authHeader } : {}),
    ...(sessionCookie ? { 'Cookie': sessionCookie } : {})
  };

  try {
    const upstreamRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ seconds }),
      // no need for credentials; cookie manually forwarded
    });

    const contentType = upstreamRes.headers.get('content-type');
    const data = contentType?.includes('application/json') ? await upstreamRes.json() : await upstreamRes.text();

    const nextRes = NextResponse.json(
      new ResponseModel(
        upstreamRes.ok ? 200 : upstreamRes.status,
        upstreamRes.ok ? 'Refreshed' : 'Refresh failed',
        data
      ),
      { status: upstreamRes.ok ? 200 : upstreamRes.status }
    );

    // Propagate updated session cookie if upstream issued one
    const setCookieHeader = upstreamRes.headers.get('set-cookie');
    if (setCookieHeader) {
      const parsed = setCookie.parse(setCookieHeader, { decodeValues: false, map: true });
      const newSession = parsed['HttpSessionID'];
      if (newSession) {
        nextRes.cookies.set('HttpSessionID', newSession.value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          path: '/',
        });
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
