import { NextResponse } from 'next/server';
import { requireIdAlertOperator } from '@/lib/idAlerts/auth';
import { listAlerts, listNeuronSeen } from '@/lib/idAlerts/store.mjs';
import { getIdAlertConfig } from '@/lib/idAlerts/config.mjs';
import { publicAlert } from '@/lib/idAlerts/notifications.mjs';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const operator = await requireIdAlertOperator(request);
    if (!operator) return reply({ error: 'Forbidden' }, 403);
    const [alerts, lastSeen] = await Promise.all([listAlerts(), listNeuronSeen()]);
    const { neurons } = getIdAlertConfig();
    return reply({
      operatorId: operator.id,
      alerts: alerts.map(publicAlert),
      neurons: neurons.map((neuron) => ({ ...neuron, lastSeenAt: lastSeen[neuron.id] || null })),
    });
  } catch (error) {
    console.error('[id-alerts] inbox failed', { name: error.name });
    return reply({ error: 'Inbox unavailable' }, 503);
  }
}

function reply(body, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}
