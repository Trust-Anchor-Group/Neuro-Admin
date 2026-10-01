import { configuredWhatsappRecipients, MAX_WHATSAPP_RECIPIENTS, whatsappNumber } from './whatsapp.mjs';
import { whatsappJobKey } from './notifications.mjs';
const emailAddress = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');

export function inboxUrl(config) {
  try {
    const origin = new URL(config.publicOrigin);
    if (origin.protocol !== 'https:' || origin.href !== `${origin.origin}/`) return '';
    return `${origin.origin}/neuro-access/id-inbox`;
  } catch { return ''; }
}

export function notificationConfigError(channel, config, env = process.env, recipient) {
  if (!inboxUrl(config)) return 'public_origin_not_configured';
  if (channel === 'email') {
    if (config.emailEnabled === false) return 'email_disabled';
    if (!config.operatorEmails.length || !config.operatorEmails.every(emailAddress)) return 'email_recipient_not_configured';
    if (!env.SENDGRID_API_KEY || !emailAddress(env.SENDGRID_FROM_EMAIL)) return 'sendgrid_not_configured';
  } else {
    if (!config.whatsappEnabled) return 'whatsapp_disabled';
    if (!/^AC[a-f0-9]{32}$/i.test(env.TWILIO_ACCOUNT_SID || '') || !env.TWILIO_AUTH_TOKEN ||
        !whatsappNumber(env.TWILIO_WHATSAPP_FROM)) return 'twilio_not_configured';
    if (env.TWILIO_WHATSAPP_CONTENT_SID && !/^HX[a-f0-9]{32}$/i.test(env.TWILIO_WHATSAPP_CONTENT_SID)) return 'twilio_template_invalid';
    const recipients = configuredWhatsappRecipients(config, env);
    if (recipient !== undefined) {
      if (!whatsappNumber(recipient)) return 'whatsapp_recipient_invalid';
      if (!recipients.includes(recipient)) return 'whatsapp_recipient_removed';
    } else {
      if (!recipients.length) return 'whatsapp_recipients_not_configured';
      if (recipients.length > MAX_WHATSAPP_RECIPIENTS) return 'whatsapp_recipient_limit_exceeded';
      if (!recipients.every(whatsappNumber)) return 'whatsapp_recipient_invalid';
    }
  }
  return '';
}

export function notificationText(alert, config) {
  const name = String(alert.sourceNeuronName).replace(/[\r\n\x00-\x1f]/g, ' ').slice(0, 120);
  return `New ID application\nNeuron: ${name}\nReceived: ${new Date(alert.receivedAt).toISOString()}\nOpen Neuro Admin: ${inboxUrl(config)}`;
}

export async function sendNotification(channel, alert, config, attempt, fetchImpl = fetch, env = process.env) {
  const recipient = channel === 'whatsapp' ? (attempt.recipient ?? config.legacyWhatsappRecipient ?? env.TWILIO_WHATSAPP_TO) : undefined;
  const error = notificationConfigError(channel, config, env, recipient);
  if (error) return { state: 'rejected', error };
  if (channel === 'whatsapp' && (!whatsappNumber(recipient) ||
      (attempt.jobKey?.startsWith('whatsapp:') && attempt.jobKey !== whatsappJobKey(recipient)))) return { state: 'rejected', error: 'whatsapp_recipient_invalid' };
  let url, options;
  if (channel === 'email') {
    url = 'https://api.sendgrid.com/v3/mail/send';
    options = {
      method: 'POST', headers: { Authorization: `Bearer ${env.SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: config.operatorEmails.map((email) => ({ to: [{ email }] })),
        from: { email: env.SENDGRID_FROM_EMAIL }, subject: 'New ID application',
        content: [{ type: 'text/plain', value: notificationText(alert, config) }],
        custom_args: { id_alert_id: alert.id, id_alert_attempt: attempt.attemptId },
        tracking_settings: { click_tracking: { enable: false, enable_text: false }, open_tracking: { enable: false } },
      }),
    };
  } else {
    url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
    const callback = new URL(`${new URL(config.publicOrigin).origin}/api/id-applications/notifications/twilio`);
    callback.searchParams.set('id', alert.id);
    callback.searchParams.set('attempt', attempt.attemptId);
    if (attempt.jobKey?.startsWith('whatsapp:')) callback.searchParams.set('recipient', attempt.jobKey.slice('whatsapp:'.length));
    const body = new URLSearchParams({
      From: env.TWILIO_WHATSAPP_FROM, To: recipient,
      StatusCallback: callback.href,
    });
    if (env.TWILIO_WHATSAPP_CONTENT_SID) {
      body.set('ContentSid', env.TWILIO_WHATSAPP_CONTENT_SID);
      body.set('ContentVariables', JSON.stringify({ '1': String(alert.sourceNeuronName).replace(/[\r\n\x00-\x1f]/g, ' ').slice(0, 120), '2': new Date(alert.receivedAt).toISOString(), '3': inboxUrl(config) }));
    } else body.set('Body', notificationText(alert, config));
    options = { method: 'POST', headers: {
      Authorization: `Basic ${Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }, body: body.toString() };
  }
  let response;
  try { response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(15000), redirect: 'error' }); }
  catch { return { state: 'unknown', error: 'network_outcome_unknown' }; }
  // A timeout/5xx may have accepted the message. Never resend an ambiguous outcome.
  if (response.status >= 500) return { state: 'unknown', error: `provider_http_${response.status}` };
  if (response.status >= 400) {
    let code = '';
    if (channel === 'whatsapp') { const body = await response.json().catch(() => ({})); if (Number.isInteger(body.code)) code = `_code_${body.code}`; }
    return { state: 'rejected', error: `provider_http_${response.status}${code}` };
  }
  if (channel === 'email' && response.status === 202) return { state: 'accepted', providerId: (response.headers.get('x-message-id') || '').slice(0, 256) };
  if (channel === 'whatsapp' && response.status === 201) {
    const body = await response.json().catch(() => ({}));
    if (/^(SM|MM)[a-f0-9]{32}$/i.test(body.sid || '')) return { state: 'accepted', providerId: body.sid };
  }
  return { state: 'unknown', error: 'provider_response_unknown' };
}
