import { readRegistry } from './domain.mjs';

const csv = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean);

export function getIdAlertConfig(env = process.env) {
  return {
    neurons: readRegistry(env.ID_ALERT_NEURONS),
    eventIds: new Set(csv(env.ID_ALERT_EVENT_IDS)),
    discovery: env.ID_ALERT_DISCOVERY === 'true',
    applicationRefTags: csv(env.ID_ALERT_APPLICATION_REF_TAGS),
    legalIdentityRefTags: csv(env.ID_ALERT_LEGAL_ID_REF_TAGS),
    operatorIds: new Set(csv(env.ID_ALERT_OPERATOR_IDS)),
    debugOperatorIds: new Set(csv(env.ID_ALERT_DEBUG_OPERATOR_IDS)),
    operatorEmails: [...new Set(csv(env.ID_ALERT_OPERATOR_EMAILS).map((email) => email.toLowerCase()))],
    emailEnabled: env.ID_ALERT_EMAIL_ENABLED !== 'false',
    whatsappEnabled: env.ID_ALERT_WHATSAPP_ENABLED === 'true',
    publicOrigin: env.ID_ALERT_PUBLIC_ORIGIN || '',
    receiverJid: env.ID_ALERT_XMPP_JID || '',
  };
}
