import { TableClient } from '@azure/data-tables';
import { randomUUID } from 'node:crypto';
import { acquireReceiverLease, readReceiverLease, renewReceiverLease, releaseReceiverLease } from './lease.mjs';
import { aggregateNotifications, applyDelivery, legacyNotifications, notificationDue, prepareRecipientJobs, publicAlert, recipientHash, SEND_LEASE_MS, validNotificationKey } from './notifications.mjs';

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
  const fields = publicAlert(alert);
  const notifications = alert.notifications || legacyNotifications(alert);
  return { ...fields, partitionKey: 'alerts', rowKey: alert.id, schemaVersion: 2,
    notifications: JSON.stringify(notifications), notificationState: aggregateNotifications(notifications),
    auditTrail: JSON.stringify(alert.auditTrail || []) };
};

const decodeAlert = (entity) => ({
  ...entity,
  id: entity.rowKey,
  tags: JSON.parse(entity.tags || '{}'),
  notifications: entity.notifications ? JSON.parse(entity.notifications) : undefined,
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
  for await (const entity of client.listEntities({ queryOptions: { filter: "PartitionKey eq 'alerts'" } })) {
    const alert = decodeAlert(entity);
    if (alert.schemaVersion === 2 && !Object.values(alert.notifications || {}).some((job) => notificationDue(job))) continue;
    pending.push(alert);
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

// All notification changes share the alert ETag with human status changes. A
// callback/worker can never overwrite a concurrent claim or handled transition.
export async function mutateStoredAlert(client, id, change) {
  for (let attempt = 0; attempt < 8; attempt++) {
    let current;
    try { current = decodeAlert(await client.getEntity('alerts', id)); }
    catch (error) { if (error.statusCode === 404) return null; throw error; }
    current.notifications ||= legacyNotifications(current);
    const updated = change(current);
    if (!updated) return null;
    try {
      await client.updateEntity(encodeAlert(updated), 'Replace', { etag: current.etag });
      return updated;
    } catch (error) { if (error.statusCode !== 412 && error.statusCode !== 409) throw error; }
  }
  throw new Error('Alert update contention');
}

export function notificationStore(client) {
  const changeJob = (id, channel, change) => {
    if (!validNotificationKey(channel)) throw new Error('Invalid notification job');
    return mutateStoredAlert(client, id, (alert) => {
      if (!alert.notifications[channel]) return null;
      const next = change(alert.notifications[channel]);
      return next ? { ...alert, notifications: { ...alert.notifications, [channel]: next } } : null;
    });
  };
  return {
    prepareNotifications: (id, config) => mutateStoredAlert(client, id, (alert) => ({ ...alert, notifications: prepareRecipientJobs(alert.notifications, config) })),
    claimNotification: (id, channel, config, now = Date.now()) => changeJob(id, channel, (job) => {
      if (!notificationDue(job, now) || job.state === 'sending') return null;
      return { ...job, state: 'sending', attempts: job.attempts + 1, attemptId: randomUUID(),
        startedAt: new Date(now).toISOString(), leaseUntil: new Date(now + SEND_LEASE_MS).toISOString(),
        recipientHashes: channel === 'email' ? config.operatorEmails.map(recipientHash) : [],
        deliveries: {}, lastError: '', nextAttemptAt: '' };
    }),
    blockNotification: (id, channel, error) => changeJob(id, channel, (job) => {
      if (!notificationDue(job) || job.state === 'sending') return null;
      return { ...job, state: 'blocked', lastError: error, nextAttemptAt: new Date(Date.now() + 300000).toISOString() };
    }),
    expireNotification: (id, channel) => changeJob(id, channel, (job) => job.state === 'sending' && notificationDue(job)
      ? { ...job, state: 'unknown', lastError: 'worker_stopped_during_send', leaseUntil: '', nextAttemptAt: '' } : null),
    finishNotification: (id, channel, attemptId, update) => changeJob(id, channel, (job) => {
      if (job.attemptId !== attemptId || !['sending', 'unknown'].includes(job.state)) return null;
      return { ...job, ...update, leaseUntil: '' };
    }),
    recordDelivery: (id, channel, update) => changeJob(id, channel, (job) => applyDelivery(job, update)),
    retryNotification: (id, channel, operatorId) => mutateStoredAlert(client, id, (alert) => {
      if (!validNotificationKey(channel)) throw new Error('Invalid notification job');
      const job = alert.notifications[channel];
      if (!job) throw new Error('Notification job not found');
      if (!['failed', 'delivery_failed', 'unknown', 'blocked', 'disabled'].includes(job.state)) throw new Error('Notification cannot be retried in this state');
      if (Object.values(job.deliveries || {}).includes('delivered')) throw new Error('Partial delivery: do not resend to recipients who already received it');
      return { ...alert, notifications: { ...alert.notifications, [channel]: { ...(job.recipient ? { recipient: job.recipient } : {}),
        ...(job.recipientSelectionPending ? { recipientSelectionPending: true } : {}), state: 'pending', attempts: 0, nextAttemptAt: '', lastError: '' } },
        auditTrail: [...(alert.auditTrail || []), { action: `retry_${channel}_confirmed_not_delivered`, operatorId, at: new Date().toISOString() }] };
    }),
  };
}

export const prepareNotifications = async (...args) => notificationStore(await table()).prepareNotifications(...args);
export const claimNotification = async (...args) => notificationStore(await table()).claimNotification(...args);
export const blockNotification = async (...args) => notificationStore(await table()).blockNotification(...args);
export const expireNotification = async (...args) => notificationStore(await table()).expireNotification(...args);
export const finishNotification = async (...args) => notificationStore(await table()).finishNotification(...args);
export const recordDelivery = async (...args) => notificationStore(await table()).recordDelivery(...args);
export const retryNotification = async (...args) => notificationStore(await table()).retryNotification(...args);

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
}

export async function pruneDiscovery() {
  const client = await table();
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
    if (Number(entity.rowKey.split('_')[0]) < Date.now() - 24 * 60 * 60 * 1000) continue;
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
