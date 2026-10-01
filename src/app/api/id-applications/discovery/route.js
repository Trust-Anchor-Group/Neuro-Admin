import { NextResponse } from 'next/server';
import { requireIdAlertOperator } from '@/lib/idAlerts/auth';
import { listDiscovery } from '@/lib/idAlerts/store.mjs';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    if (!await requireIdAlertOperator(request, { debug: true })) return reply({ error: 'Forbidden' }, 403);
    return reply({ events: await listDiscovery() });
  } catch (error) {
    console.error('[id-alerts] discovery read failed', { name: error.name });
    return reply({ error: 'Discovery unavailable' }, 503);
  }
}

function reply(body, status = 200) { return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } }); }
