import { TableClient } from '@azure/data-tables';
import { randomUUID } from 'node:crypto';
import { acquireReceiverLease, readReceiverLease, renewReceiverLease, releaseReceiverLease } from './lease.mjs';

let clientPromise;

async function table() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const connection = process.env.ID_ALERT_STORAGE_CONNECTION_STRING;
      if (!connection) throw new Error('ID_ALERT_STORAGE_CONNECTION_STRING is required');
      const client = TableClient.fromConnectionString(connection, process.env.ID_ALERT_TABLE || 'IdApplicationAlerts');
      await client.createTable().catch((error) => {
        if (error.statusCode !== 409) throw error;
      });
      return client;
    })().catch((error) => { clientPromise = undefined; throw error; });
  }
  return clientPromise;
}

const encodeAlert = (alert) => {
  const { etag, timestamp, partitionKey, rowKey, ...fields } = alert;
  return { ...fields, partitionKey: 'alerts', rowKey: alert.id,
    tags: JSON.stringify(alert.tags), auditTrail: JSON.stringify(alert.auditTrail || []) };
};

const decodeAlert = (entity) => ({
  ...entity,
  id: entity.rowKey,
  tags: JSON.parse(entity.tags || '{}'),
  auditTrail: JSON.parse(entity.auditTrail || '[]'),
});

export async function createAlert(alert) {
  const client = await table();
  try {
    await client.createEntity(encodeAlert(alert));
    return true;
  } catch (error) {
    if (error.statusCode === 409) return false;
    throw error;
  }
}

export async function listAlerts() {
  const client = await table();
  const alerts = [];
  for await (const entity of client.listEntities({ queryOptions: { filter: "PartitionKey eq 'alerts'" } })) {
    alerts.push(decodeAlert(entity));
  }
  return alerts.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export async function listPendingNotifications() {
  const client = await table();
  const pending = [];
  for await (const entity of client.listEntities({ queryOptions: { filter: "PartitionKey eq 'alerts' and notificationState eq 'pending'" } })) {
    pending.push(decodeAlert(entity));
    if (pending.length >= 100) break;
  }
  return pending;
}

export async function getAlert(id) {
  try {
    return decodeAlert(await (await table()).getEntity('alerts', id));
  } catch (error) {
    if (error.statusCode === 404) return null;
    throw error;
  }
}

export async function updateAlertStatus(id, action, operatorId, transition) {
  return conditionalTransition(await table(), id, action, operatorId, transition);
}

export async function conditionalTransition(client, id, action, operatorId, transition) {
  let current;
  try { current = decodeAlert(await client.getEntity('alerts', id)); }
  catch (error) {
    if (error.statusCode === 404) return { outcome: 'missing' };
    throw error;
  }
  if (!current) return { outcome: 'missing' };
  let updated;
  try {
    updated = transition(current, action, operatorId);
  } catch {
    return { outcome: 'conflict', alert: current };
  }
  try {
    await client.updateEntity(encodeAlert(updated), 'Replace', { etag: current.etag });
  } catch (error) {
    if (error.statusCode === 412 || error.statusCode === 409) return { outcome: 'conflict', alert: decodeAlert(await client.getEntity('alerts', id)) };
    throw error;
  }
  return { outcome: 'updated', alert: updated };
}

export async function markNotified(id) {
  await (await table()).updateEntity({ partitionKey: 'alerts', rowKey: id, notificationState: 'sent' }, 'Merge');
}

export async function saveDiscovery(event, neuron) {
  const client = await table();
  const rowKey = `${Date.now()}_${randomUUID()}`;
  await client.createEntity({
    partitionKey: 'discovery', rowKey,
    sourceNeuronId: neuron.id, sourceJid: event.sourceJid,
    timestamp: event.timestamp, eventId: event.eventId,
    message: event.message, type: event.type, level: event.level, actor: event.actor,
    object: event.object, facility: event.facility, module: event.module,
    subject: event.subject, stackTrace: event.stackTrace, xmlLang: event.xmlLang,
    tags: JSON.stringify(event.tags), tagList: JSON.stringify(event.tagList),
    rawEvent: event.rawEvent, rawStanza: event.rawStanza,
  });
  const rows = [];
  for await (const entity of client.listEntities({ queryOptions: { filter: "PartitionKey eq 'discovery'", select: ['PartitionKey', 'RowKey'] } })) {
    rows.push(entity.rowKey);
  }
  rows.sort().reverse();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const key of rows.filter((value, index) => index >= 100 || Number(value.split('_')[0]) < cutoff)) {
    await client.deleteEntity('discovery', key).catch(() => {});
  }
}

export async function listDiscovery() {
  const client = await table();
  const records = [];
  for await (const entity of client.listEntities({ queryOptions: { filter: "PartitionKey eq 'discovery'" } })) {
    records.push({ ...entity, tags: JSON.parse(entity.tags || '{}'), tagList: JSON.parse(entity.tagList || '[]') });
  }
  return records.sort((a, b) => b.rowKey.localeCompare(a.rowKey)).slice(0, 100);
}

export async function markNeuronSeen(neuron) {
  await (await table()).upsertEntity({ partitionKey: 'neurons', rowKey: neuron.id, lastSeenAt: new Date().toISOString() }, 'Merge');
}

export async function listNeuronSeen() {
  const client = await table();
  const entries = {};
  for await (const entity of client.listEntities({ queryOptions: { filter: "PartitionKey eq 'neurons'" } })) {
    entries[entity.rowKey] = entity.lastSeenAt;
  }
  return entries;
}

export async function storageReady() {
  const client = await table();
  for await (const _ of client.listEntities({ queryOptions: { filter: "PartitionKey eq 'health'" } })) break;
  return true;
}

export async function acquireLease(owner) { return acquireReceiverLease(await table(), owner); }
export async function renewLease(owner, connected) { return renewReceiverLease(await table(), owner, connected); }
export async function releaseLease(owner) { return releaseReceiverLease(await table(), owner); }
export async function receiverLeaseStatus() {
  const lease = await readReceiverLease(await table());
  return { active: !!lease && Date.parse(lease.expiresAt) > Date.now(),
    connected: !!lease?.connected, expiresAt: lease?.expiresAt || null };
}
