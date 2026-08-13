import { NextResponse } from 'next/server';
import setCookie from 'set-cookie-parser';
import { getActiveNeuronContext, setNeuronSessionCookies } from '@/lib/neuronSessionContext';
import { readNeuronResponseBody } from '@/lib/neuronUpstream';

export async function POST(request) {
  const activeContext = await getActiveNeuronContext(request);
  if (!activeContext.sessionCookieValue) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }

  const resp = await fetch(`https://${activeContext.host}/Agent/Account/QuickLogin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': activeContext.upstreamCookieHeader,
    },
    body: JSON.stringify({ seconds: 3600 }),
  });

  const { body: data } = await readNeuronResponseBody(resp);
  if (!resp.ok) {
    return NextResponse.json({ error: data?.error ?? 'QuickLogin failed' }, { status: resp.status });
  }

  const response = NextResponse.json(data, { status: 200 });
  const setCookieHeader = resp.headers.get('set-cookie');

  if (setCookieHeader) {
    const parsed = setCookie.parse(setCookieHeader, { decodeValues: false, map: true });
    const sessionCookie = parsed.HttpSessionID?.value;
    if (sessionCookie) {
      await setNeuronSessionCookies(response, {
        host: activeContext.host,
        sessionCookieValue: sessionCookie,
        activate: true,
      });
    }
  }

  return response;
}
