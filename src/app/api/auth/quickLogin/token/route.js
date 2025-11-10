// /app/api/agent/quicklogin/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import config from '@/config/config';

export async function POST() {
  const { host } = config.api.agent;               // t.ex. 'lab.tagroot.io'
  const url = `https://${host}/Agent/Account/QuickLogin`;

  // Hämta klientens kopierade sessions-cookie (lagrad på er domän)
  const cookieStore = await cookies();
  const sess = cookieStore.get('HttpSessionID')?.value;
  if (!sess) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Skicka Neuron-sessionen vidare till Neuron:
      'Cookie': `HttpSessionID=${encodeURIComponent(sess)}`
    },
    body: JSON.stringify({ seconds: 3600 }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    return NextResponse.json({ error: data?.error ?? 'QuickLogin failed' }, { status: resp.status });
  }

  // Förväntat svar: { jwt, userName, expires }
  return NextResponse.json(data, { status: 200 });
}
