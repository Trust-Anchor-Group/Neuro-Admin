import { NextResponse } from 'next/server';
import { requireIdAlertOperator } from '@/lib/idAlerts/auth';
import { receiverState } from '@/lib/idAlerts/receiver.mjs';
import { storageReady, receiverLeaseStatus } from '@/lib/idAlerts/store.mjs';

export const runtime = 'nodejs';

export async function GET(request) {
  if (!await requireIdAlertOperator(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  let storage = false;
  let lease = { active: false, connected: false, expiresAt: null };
  try { storage = await storageReady(); lease = await receiverLeaseStatus(); } catch { /* reported via readiness */ }
  const receiver = receiverState();
  const ready = storage && (process.env.ID_ALERT_RECEIVER_ENABLED !== 'true' || (lease.active && lease.connected));
  return NextResponse.json({ ready, storage, receiver, lease }, { status: ready ? 200 : 503, headers: { 'Cache-Control': 'no-store' } });
}
