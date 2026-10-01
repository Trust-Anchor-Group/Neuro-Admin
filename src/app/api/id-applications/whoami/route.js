import { NextResponse } from 'next/server';
import { identifyIdAlertSession } from '@/lib/idAlerts/auth';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const identity = await identifyIdAlertSession(request);
    if (!identity) return NextResponse.json({ error: 'No valid Neuron session' }, { status: 401 });
    return NextResponse.json(identity, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Identity unavailable' }, { status: 503 });
  }
}
