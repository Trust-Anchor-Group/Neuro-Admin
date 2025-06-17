import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import config from '@/config/config';

export async function POST() {
  const { host } = config.api.agent;
  const cookieStore = await cookies();
  const session = cookieStore.get('HttpSessionID');
console.log('[QuickLogin] Session Cookie:', host);
  if (!session) {
    return NextResponse.json({ error: 'No HttpSessionID found.' }, { status: 400 });
  }
  const response = await fetch(`https://${host}/Agent/Account/QuickLogin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `HttpSessionID=${encodeURIComponent(session.value)}`,
    },
    body: JSON.stringify({ seconds: 3600 }),
  });
  console.log('EMAILJS_SERVICE_ID:', process.env.EMAILJS_SERVICE_ID)
  console.log('EMAILJS_PUBLIC_KEY:', !!process.env.EMAILJS_PUBLIC_KEY)
  console.log('EMAILJS_TEMPLATE_ID:', process.env.EMAILJS_TEMPLATE_ID)    
  const contentType = response.headers.get('content-type');
  const result = contentType?.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    return NextResponse.json(
      { error: result || 'QuickLogin failed' },
      { status: response.status }
    );
  }

  return NextResponse.json(result, { status: 200 });
}