// Integration check against a unique temporary table, never the live inbox.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { TableClient } from '@azure/data-tables';
import { notificationStore, conditionalTransition } from '../src/lib/idAlerts/store.mjs';
import { initialNotifications, whatsappJobKey } from '../src/lib/idAlerts/notifications.mjs';
import { transition } from '../src/lib/idAlerts/domain.mjs';

const connection = process.env.TEST_ID_ALERT_STORAGE_CONNECTION_STRING;
if (!connection) throw new Error('TEST_ID_ALERT_STORAGE_CONNECTION_STRING is required');
const name = `IdAlertVerification${randomBytes(8).toString('hex')}`;
const client = TableClient.fromConnectionString(connection, name);
const id = 'a'.repeat(64);
const teamConfig = { whatsappEnabled: true, whatsappRecipients: ['whatsapp:+15550001111', 'whatsapp:+15550002222'] };
let created = false;
try {
  await client.createTable();
  created = true;
  await client.createEntity({ partitionKey: 'alerts', rowKey: id, status: 'new',
    sourceNeuronId: 'integration-test', sourceNeuronName: 'Storage verification',
    receivedAt: new Date().toISOString(), schemaVersion: 2, auditTrail: '[]',
    notifications: JSON.stringify(initialNotifications(teamConfig)) });
  const store = notificationStore(client);
  const notificationClaims = await Promise.all([store.claimNotification(id, 'email', { operatorEmails: ['test@example.com'] }), store.claimNotification(id, 'email', { operatorEmails: ['test@example.com'] })]);
  assert.equal(notificationClaims.filter(Boolean).length, 1);
  const job = notificationClaims.find(Boolean).notifications.email;
  const operatorClaims = await Promise.all(['operator-a', 'operator-b'].map((operator) => conditionalTransition(client, id, 'acknowledge', operator, transition)));
  assert.deepEqual(operatorClaims.map((result) => result.outcome).sort(), ['conflict', 'updated']);
  await store.finishNotification(id, 'email', job.attemptId, { state: 'accepted', providerId: 'synthetic' });
  const row = await client.getEntity('alerts', id);
  assert.equal(row.status, 'acknowledged');
  assert.ok(row.claimedBy && row.claimedAt);
  assert.equal((await conditionalTransition(client, id, 'handle', row.claimedBy, transition)).outcome, 'updated');
  const handled = await client.getEntity('alerts', id);
  assert.ok(handled.handledBy && handled.handledAt);
  assert.equal(JSON.parse(handled.notifications).email.state, 'accepted');
  const [a, b] = teamConfig.whatsappRecipients.map(whatsappJobKey);
  const claims = await Promise.all([store.claimNotification(id, a, teamConfig), store.claimNotification(id, a, teamConfig), store.claimNotification(id, b, teamConfig)]);
  assert.equal(claims.filter(Boolean).length, 2);
  const jobs = JSON.parse((await client.getEntity('alerts', id)).notifications);
  await Promise.all([
    store.recordDelivery(id, a, { attemptId: jobs[a].attemptId, providerId: 'synthetic-a', state: 'delivered' }),
    store.finishNotification(id, b, jobs[b].attemptId, { state: 'retry', lastError: 'provider_http_429', nextAttemptAt: '' }),
  ]);
  const final = await client.getEntity('alerts', id);
  const finalJobs = JSON.parse(final.notifications);
  assert.equal(final.status, 'handled');
  assert.equal(finalJobs[a].state, 'delivered');
  assert.equal(finalJobs[b].state, 'retry');
  assert.equal(finalJobs[a].attempts, 1);
  console.info('PASS: Azure ETags isolate per-recipient notification claims, delivery/retries, and operator ownership. No provider was called.');
} finally {
  if (created) { await client.deleteTable(); console.info('Temporary verification table deleted.'); }
}
