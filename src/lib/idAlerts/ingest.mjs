import { bareJid, normalizeAlert, parseEventStanza } from './domain.mjs';

export async function ingestStanza(stanza, config, store) {
  const events = parseEventStanza(stanza, config.receiverJid);
  const neuron = config.neurons.find((entry) => entry.enabled && entry.jid === bareJid(events[0].sourceJid));
  if (!neuron) throw new Error('Unknown or disabled Neuron sender');
  const outcomes = [];
  for (const event of events) {
    if (!event.eventId || !config.eventIds.has(event.eventId)) {
      outcomes.push({ eventId: event.eventId, outcome: 'discovery-only' });
    } else {
      const alert = normalizeAlert(event, neuron, config);
      const created = await store.createAlert(alert);
      outcomes.push({ eventId: event.eventId, outcome: created ? 'new' : 'duplicate', alertId: alert.id });
    }
    // Diagnostic persistence must never prevent a selected alert from appearing.
    try { await store.markNeuronSeen(neuron); if (config.discovery) await store.saveDiscovery(event, neuron); }
    catch (error) { console.warn('[id-alerts] diagnostics unavailable', { name: error.name }); }
  }
  return outcomes;
}
