import { NextResponse } from 'next/server';
import { requireIdAlertOperator, sameOrigin } from '@/lib/idAlerts/auth';
import { updateAlertStatus } from '@/lib/idAlerts/store.mjs';
import { transition } from '@/lib/idAlerts/domain.mjs';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  const { id } = await params;
  if (!/^[a-f0-9]{64}$/.test(id)) return reply({ error: 'Invalid ID' }, 400);
  if (!sameOrigin(request)) return reply({ error: 'Invalid origin' }, 403);
  try {
    const operator = await requireIdAlertOperator(request);
    if (!operator) return reply({ error: 'Forbidden' }, 403);
    const raw = await request.text();
    if (raw.length > 128) return reply({ error: 'Request too large' }, 413);
    const action = JSON.parse(raw).action;
    if (!['acknowledge', 'handle'].includes(action)) return reply({ error: 'Invalid action' }, 400);
    const result = await updateAlertStatus(id, action, operator.id, transition);
    if (result.outcome === 'missing') return reply({ error: 'Not found' }, 404);
    if (result.outcome === 'conflict') return reply({ error: 'This alert changed or belongs to another operator' }, 409);
    const { rawEvent, rawStanza, tags, ...alert } = result.alert;
    return reply({ alert });
  } catch (error) {
    if (error instanceof SyntaxError) return reply({ error: 'Invalid JSON' }, 400);
    console.error('[id-alerts] status change failed', { error: error.message });
    return reply({ error: 'Status change unavailable' }, 503);
  }
}

function reply(body, status = 200) { return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } }); }
