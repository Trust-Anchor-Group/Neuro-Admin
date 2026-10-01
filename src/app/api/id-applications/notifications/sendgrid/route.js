import { recordDelivery } from '@/lib/idAlerts/store.mjs';
import { recipientHash } from '@/lib/idAlerts/notifications.mjs';
import { limitedBody, validAlertId, validAttemptId, validSendGridSignature } from '@/lib/idAlerts/webhooks.mjs';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const key = process.env.SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY;
    if (!key) return new Response(null, { status: 503 });
    const body = await limitedBody(request);
    if (!validSendGridSignature(body, request.headers.get('x-twilio-email-event-webhook-timestamp'),
      request.headers.get('x-twilio-email-event-webhook-signature'), key)) return new Response(null, { status: 403 });
    const events = JSON.parse(body.toString('utf8'));
    if (!Array.isArray(events) || events.length > 1000) return new Response(null, { status: 400 });
    for (const event of events) {
      const id = event.id_alert_id, attemptId = event.id_alert_attempt;
      if (!validAlertId(id) || !validAttemptId(attemptId) || typeof event.email !== 'string') continue;
      const state = event.event === 'delivered' ? 'delivered'
        : ['bounce', 'dropped'].includes(event.event) ? 'delivery_failed'
        : ['processed', 'deferred'].includes(event.event) ? 'accepted' : '';
      if (state) await recordDelivery(id, 'email', { attemptId, state, recipient: recipientHash(event.email),
        error: state === 'delivery_failed' || event.event === 'deferred' ? `sendgrid_${event.event}` : '' });
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    console.warn('[id-alerts] email callback deferred', { name: error.name });
    return new Response(null, { status: error.statusCode === 413 ? 413 : error instanceof SyntaxError ? 400 : 503 });
  }
}
