// Keep team jobs below Azure Table's per-property size limit. Never truncate a
// configured audience silently: configuration errors leave inbox/email working.
export const MAX_WHATSAPP_RECIPIENTS = 20;
export const whatsappNumber = (value) => /^whatsapp:\+[1-9]\d{6,14}$/.test(value || '');

export function readWhatsappRecipients(env = process.env) {
  const raw = env.ID_ALERT_WHATSAPP_RECIPIENTS !== undefined
    ? env.ID_ALERT_WHATSAPP_RECIPIENTS : env.TWILIO_WHATSAPP_TO;
  return [...new Set(String(raw || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean))];
}

export const configuredWhatsappRecipients = (config, env = process.env) => config.whatsappRecipients ?? readWhatsappRecipients(env);
