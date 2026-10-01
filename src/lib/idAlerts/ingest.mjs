import { bareJid, normalizeAlert, parseEventStanza } from './domain.mjs';

export async function ingestStanza(stanza, config, store, notifier) {
  const events = parseEventStanza(stanza, config.receiverJid);
  const neuron = config.neurons.find((entry) => entry.enabled && entry.jid === bareJid(events[0].sourceJid));
  if (!neuron) throw new Error('Unknown or disabled Neuron sender');
  const outcomes = [];
  for (const event of events) {
    await store.markNeuronSeen(neuron);
    if (config.discovery) await store.saveDiscovery(event, neuron);
    if (!event.eventId || !config.eventIds.has(event.eventId)) {
      outcomes.push({ eventId: event.eventId, outcome: 'discovery-only' });
      continue;
    }
    const alert = normalizeAlert(event, neuron, config);
    const created = await store.createAlert(alert);
    if (created) {
      try {
        await notifier.notifyNewApplication(alert, config);
        await store.markNotified(alert.id);
      } catch (error) {
        console.error('[id-alerts] notification pending', { alertId: alert.id, name: error.name });
      }
    }
    outcomes.push({ eventId: event.eventId, outcome: created ? 'new' : 'duplicate', alertId: alert.id });
  }
  return outcomes;
}
