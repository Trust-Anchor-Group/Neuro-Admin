import { recordDelivery } from '@/lib/idAlerts/store.mjs';
import { limitedBody, validAlertId, validAttemptId, validTwilioSignature } from '@/lib/idAlerts/webhooks.mjs';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    if (!process.env.TWILIO_AUTH_TOKEN || !process.env.ID_ALERT_PUBLIC_ORIGIN) return new Response(null, { status: 503 });
    const url = new URL(request.url);
    const callbackUrl = `${new URL(process.env.ID_ALERT_PUBLIC_ORIGIN).origin}${url.pathname}${url.search}`;
    const params = new URLSearchParams((await limitedBody(request, 65536)).toString('utf8'));
    if (!validTwilioSignature(callbackUrl, params, request.headers.get('x-twilio-signature'), process.env.TWILIO_AUTH_TOKEN) ||
        params.get('AccountSid') !== process.env.TWILIO_ACCOUNT_SID) return new Response(null, { status: 403 });
    const id = url.searchParams.get('id'), attemptId = url.searchParams.get('attempt');
    if (!validAlertId(id) || !validAttemptId(attemptId)) return new Response(null, { status: 400 });
    const status = params.get('MessageStatus');
    const state = ['delivered', 'read'].includes(status) ? 'delivered'
      : ['failed', 'undelivered'].includes(status) ? 'delivery_failed'
      : ['accepted', 'queued', 'sending', 'sent'].includes(status) ? 'accepted' : '';
    const providerId = params.get('MessageSid');
    if (state && /^(SM|MM)[a-f0-9]{32}$/i.test(providerId || '')) {
      const code = params.get('ErrorCode');
      await recordDelivery(id, 'whatsapp', { attemptId, providerId, state,
        error: /^\d+$/.test(code || '') ? `twilio_${code}` : state === 'delivery_failed' ? 'twilio_delivery_failed' : '' });
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    console.warn('[id-alerts] WhatsApp callback deferred', { name: error.name });
    return new Response(null, { status: error.statusCode === 413 ? 413 : 503 });
  }
}
