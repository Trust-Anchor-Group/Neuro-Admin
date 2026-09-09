import setCookie from 'set-cookie-parser';
import { NextResponse } from 'next/server';
import ResponseModel from '@/models/ResponseModel';
import { getActiveNeuronContext, setNeuronSessionCookies } from '@/lib/neuronSessionContext';
import { readNeuronResponseBody } from '@/lib/neuronUpstream';

export async function POST(request) {
  let seconds = 3600;
  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      const body = await request.json();
      if (body?.seconds && Number.isFinite(body.seconds)) seconds = body.seconds;
    }
  } catch {
  }

  const activeContext = await getActiveNeuronContext(request);
  const url = `https://${activeContext.host}/Agent/Account/Refresh`;
  const authHeader = request.headers.get('authorization');

  const headers = {
    'Content-Type': 'application/json',
    ...(authHeader ? { Authorization: authHeader } : {}),
    ...(activeContext.upstreamCookieHeader ? { Cookie: activeContext.upstreamCookieHeader } : {})
  };

  try {
    const upstreamRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ seconds }),
    });

    const { body: data } = await readNeuronResponseBody(upstreamRes);

    const nextRes = NextResponse.json(
      new ResponseModel(
        upstreamRes.ok ? 200 : upstreamRes.status,
        upstreamRes.ok ? 'Refreshed' : 'Refresh failed',
        data
      ),
      { status: upstreamRes.ok ? 200 : upstreamRes.status }
    );

    const setCookieHeader = upstreamRes.headers.get('set-cookie');
    if (setCookieHeader) {
      const parsed = setCookie.parse(setCookieHeader, { decodeValues: false, map: true });
      const newSession = parsed['HttpSessionID'];
      if (newSession) {
        await setNeuronSessionCookies(nextRes, {
          host: activeContext.host,
          sessionCookieValue: newSession.value,
          activate: true,
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
