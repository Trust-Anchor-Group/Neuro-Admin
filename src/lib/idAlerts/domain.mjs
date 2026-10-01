import { createHash } from 'node:crypto';
import { initialNotifications } from './notifications.mjs';

export const EVENT_NS = 'urn:xmpp:eventlog';
const MAX_STANZA_BYTES = 48 * 1024;

export function bareJid(value) {
  return typeof value === 'string' ? value.split('/')[0].trim().toLowerCase() : '';
}

export function readRegistry(raw) {
  const entries = JSON.parse(raw || '[]');
  if (!Array.isArray(entries)) throw new Error('ID_ALERT_NEURONS must be a JSON array');
  const ids = new Set();
  const jids = new Set();
  return entries.map((entry) => {
    const id = String(entry.id || '').trim();
    const jid = bareJid(entry.jid);
    if (!id || !jid.includes('@') || ids.has(id) || jids.has(jid)) {
      throw new Error('Each Neuron needs a unique id and bare JID');
    }
    ids.add(id);
    jids.add(jid);
    return { id, jid, name: String(entry.name || id), customerId: String(entry.customerId || ''), enabled: entry.enabled !== false };
  });
}

export function parseEventStanza(stanza, receiverJid) {
  const raw = stanza.toString();
  if (Buffer.byteLength(raw) > MAX_STANZA_BYTES) throw new Error('XMPP stanza exceeds size limit');
  if (!stanza.is('message') || !bareJid(stanza.attrs.from)) throw new Error('Invalid XMPP event message');
  if (bareJid(stanza.attrs.to) !== bareJid(receiverJid)) throw new Error('XMPP message addressed elsewhere');
  const logs = stanza.children.filter((child) => child?.is?.('log', EVENT_NS));
  if (!logs.length) throw new Error('No XEP-0337 log element');
  return logs.map((log) => {
    const timestamp = log.attrs.timestamp;
    if (!timestamp || Number.isNaN(Date.parse(timestamp))) throw new Error('Invalid event timestamp');
    if (!log.getChild('message', EVENT_NS)) throw new Error('Invalid event message');
    const tags = {};
    const tagList = [];
    for (const tag of log.getChildren('tag', EVENT_NS)) {
      if (tag.attrs.name) {
        const entry = { name: tag.attrs.name, value: tag.attrs.value ?? '', type: tag.attrs.type || '' };
        tagList.push(entry);
        tags[entry.name] = entry.value;
      }
    }
    return {
      sourceJid: stanza.attrs.from,
      senderJid: bareJid(stanza.attrs.from),
      stanzaId: stanza.attrs.id || '',
      timestamp: new Date(timestamp).toISOString(),
      eventId: log.attrs.id || '',
      message: log.getChildText('message', EVENT_NS) || '',
      type: log.attrs.type || 'Informational',
      level: log.attrs.level || 'Minor',
      actor: log.attrs.actor || log.attrs.subject || '',
      subject: log.attrs.subject || '',
      object: log.attrs.object || '',
      facility: log.attrs.facility || '',
      module: log.attrs.module || '',
      stackTrace: log.getChildText('stackTrace', EVENT_NS) || log.attrs.stackTrace || '',
      xmlLang: stanza.attrs['xml:lang'] || '',
      tags, tagList,
      rawEvent: log.toString(),
      rawStanza: raw,
    };
  });
}

export function selectReference(event, names) {
  for (const name of names) {
    const entry = Object.entries(event.tags).find(([key]) => key.toLowerCase() === name.toLowerCase());
    if (entry?.[1]) return String(entry[1]);
  }
  return '';
}

export function normalizeAlert(event, neuron, config = {}) {
  const applicationRef = selectReference(event, config.applicationRefTags || []);
  const legalIdentityRef = selectReference(event, config.legalIdentityRefTags || []);
  const identity = applicationRef || legalIdentityRef;
  // EventId classifies a type, so it cannot be the unique delivery key alone.
  const key = identity
    ? `${neuron.id}\0${event.eventId}\0${identity}`
    : `${neuron.id}\0${event.eventId}\0${event.timestamp}\0${event.rawEvent}`;
  const id = createHash('sha256').update(key).digest('hex');
  const now = new Date().toISOString();
  return {
    id, sourceNeuronId: neuron.id, sourceNeuronName: neuron.name,
    sourceJid: bareJid(event.sourceJid), customerId: neuron.customerId,
    eventId: event.eventId, applicationRef, legalIdentityRef,
    eventTimestamp: event.timestamp, receivedAt: now, firstSeenAt: now,
    status: 'new', claimedBy: '', claimedAt: '', acknowledgedBy: '', acknowledgedAt: '', handledBy: '', handledAt: '',
    message: 'Legal Identity application registered.',
    notifications: initialNotifications(config), notificationState: 'pending', auditTrail: [],
  };
}

export function transition(alert, action, operatorId, now = new Date().toISOString()) {
  if (action === 'acknowledge' && alert.status === 'new') {
    return { ...alert, status: 'acknowledged', claimedBy: operatorId, claimedAt: now,
      acknowledgedBy: operatorId, acknowledgedAt: now,
      auditTrail: [...(alert.auditTrail || []), { action, operatorId, at: now }] };
  }
  if (action === 'handle' && alert.status === 'acknowledged' && alert.acknowledgedBy === operatorId) {
    return { ...alert, status: 'handled', handledBy: operatorId, handledAt: now,
      auditTrail: [...(alert.auditTrail || []), { action, operatorId, at: now }] };
  }
  throw new Error('Invalid transition or alert owned by another operator');
}
