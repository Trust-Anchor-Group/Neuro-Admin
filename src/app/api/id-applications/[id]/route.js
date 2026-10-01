import { NextResponse } from 'next/server';
import { requireIdAlertOperator } from '@/lib/idAlerts/auth';
import { getAlert } from '@/lib/idAlerts/store.mjs';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const { id } = await params;
  if (!/^[a-f0-9]{64}$/.test(id)) return reply({ error: 'Invalid ID' }, 400);
  try {
    const operator = await requireIdAlertOperator(request);
    if (!operator) return reply({ error: 'Forbidden' }, 403);
    const alert = await getAlert(id);
    if (!alert) return reply({ error: 'Not found' }, 404);
    const debugOperator = await requireIdAlertOperator(request, { debug: true });
    if (!debugOperator) { delete alert.rawEvent; delete alert.rawStanza; delete alert.tags; }
    return reply({ alert });
  } catch (error) {
    console.error('[id-alerts] detail failed', { error: error.message });
    return reply({ error: 'Alert unavailable' }, 503);
  }
}

function reply(body, status = 200) { return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } }); }
