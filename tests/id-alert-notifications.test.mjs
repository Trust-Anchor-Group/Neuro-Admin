import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, generateKeyPairSync, sign } from 'node:crypto';
import { applyDelivery, initialNotifications, legacyNotifications, notificationDue, notificationFailure, publicAlert, recipientHash } from '../src/lib/idAlerts/notifications.mjs';
import { notificationStore, conditionalTransition } from '../src/lib/idAlerts/store.mjs';
import { transition } from '../src/lib/idAlerts/domain.mjs';
import { deliverPendingNotifications } from '../src/lib/idAlerts/notificationWorker.mjs';
import { notificationConfigError, sendNotification } from '../src/lib/idAlerts/notifier.mjs';
import { limitedBody, validSendGridSignature, validTwilioSignature } from '../src/lib/idAlerts/webhooks.mjs';

const config = { emailEnabled: true, whatsappEnabled: true, publicOrigin: 'https://dev.example', operatorEmails: ['operator@example.com'] };
const env = { SENDGRID_API_KEY: 'test-only', SENDGRID_FROM_EMAIL: 'sender@example.com',
  TWILIO_ACCOUNT_SID: `AC${'1'.repeat(32)}`, TWILIO_AUTH_TOKEN: 'test-only',
  TWILIO_WHATSAPP_FROM: 'whatsapp:+15550001111', TWILIO_WHATSAPP_TO: 'whatsapp:+15550002222' };
let previous;
before(() => { previous = Object.fromEntries(Object.keys(env).map((key) => [key, process.env[key]])); Object.assign(process.env, env); });
after(() => { for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } });

function fixture() {
  return { id: 'a'.repeat(64), sourceNeuronId: 'lab', sourceNeuronName: 'Lab Neuron', sourceJid: 'lab@example.com',
    customerId: 'lab-customer', eventId: 'LegalIdRegistered', legalIdentityRef: 'PRIVATE-REFERENCE',
    status: 'new', receivedAt: '2026-10-01T12:00:00.000Z', auditTrail: [], notifications: initialNotifications(config),
    rawEvent: 'PRIVATE-RAW', tags: { EMAIL: 'PRIVATE-EMAIL', PNR: 'PRIVATE-PNR' }, message: 'PRIVATE-MESSAGE' };
}

function memoryStore(alert = fixture()) {
  let version = 1;
  let row = { ...alert, partitionKey: 'alerts', rowKey: alert.id, schemaVersion: 2,
    notifications: JSON.stringify(alert.notifications), auditTrail: JSON.stringify(alert.auditTrail), tags: JSON.stringify(alert.tags), etag: String(version) };
  const client = {
    async getEntity() { return structuredClone(row); },
    async updateEntity(entity, mode, options) {
      assert.equal(mode, 'Replace');
      if (options.etag !== row.etag) throw Object.assign(new Error('conflict'), { statusCode: 412 });
      row = { ...structuredClone(entity), etag: String(++version) };
    },
  };
  return { ...notificationStore(client), client,
    async listPendingNotifications() { return [{ id: alert.id }]; },
    row: () => row, jobs: () => JSON.parse(row.notifications),
    setJob(channel, patch) { const jobs = JSON.parse(row.notifications); jobs[channel] = { ...jobs[channel], ...patch }; row.notifications = JSON.stringify(jobs); row.etag = String(++version); },
  };
}

test('simultaneous workers send exactly once per channel and never replay acceptance', async () => {
  const store = memoryStore();
  const calls = [];
  const send = async (channel) => { calls.push(channel); return { state: 'accepted', providerId: `${channel}-id` }; };
  await Promise.all([deliverPendingNotifications(store, config, () => true, send), deliverPendingNotifications(store, config, () => true, send)]);
  await deliverPendingNotifications(store, config, () => true, send);
  assert.deepEqual(calls.sort(), ['email', 'whatsapp']);
  assert.equal(store.jobs().email.attempts, 1);
  assert.equal(store.jobs().whatsapp.state, 'accepted');
  assert.equal(store.row().rawEvent, undefined);
  assert.equal(store.row().tags, undefined);
});

test('definite email rejection retries independently of accepted WhatsApp', async () => {
  const store = memoryStore();
  const calls = [];
  await deliverPendingNotifications(store, config, () => true, async (channel) => {
    calls.push(channel); return channel === 'email' ? { state: 'rejected', error: 'provider_http_429' } : { state: 'accepted', providerId: 'wa' };
  });
  assert.equal(store.jobs().email.state, 'retry');
  assert.equal(notificationDue(store.jobs().email), false);
  store.setJob('email', { nextAttemptAt: '' });
  await deliverPendingNotifications(store, config, () => true, async (channel) => { calls.push(channel); return { state: 'accepted', providerId: 'email' }; });
  assert.deepEqual(calls, ['email', 'whatsapp', 'email']);
  assert.equal(store.jobs().email.attempts, 2);
  assert.equal(notificationFailure({ state: 'rejected', error: 'error' }, 12).state, 'failed');
});

test('checkpoint failure and ambiguous network outcome never trigger blind resends', async () => {
  const store = memoryStore();
  const finish = store.finishNotification;
  store.finishNotification = async (...args) => { if (args[1] === 'email') throw new Error('storage unavailable'); return finish(...args); };
  let calls = 0;
  await deliverPendingNotifications(store, config, () => true, async () => { calls++; return { state: 'accepted', providerId: 'id' }; });
  store.finishNotification = finish;
  store.setJob('email', { leaseUntil: '2000-01-01T00:00:00Z' });
  await deliverPendingNotifications(store, config, () => true, async () => assert.fail('must not resend'));
  assert.equal(calls, 2);
  assert.equal(store.jobs().email.state, 'unknown');
  assert.equal(notificationDue(store.jobs().email), false);
  const unknown = memoryStore();
  await deliverPendingNotifications(unknown, config, () => true, async () => ({ state: 'unknown', error: 'network_outcome_unknown' }));
  await deliverPendingNotifications(unknown, config, () => true, async () => assert.fail('must not resend'));
  assert.equal(unknown.jobs().email.state, 'unknown');
});

test('missing provider configuration blocks only its channel; expired leadership sends nothing', async () => {
  const store = memoryStore();
  await deliverPendingNotifications(store, { ...config, operatorEmails: [] }, () => true, async (channel) => {
    assert.equal(channel, 'whatsapp'); return { state: 'accepted', providerId: 'wa' };
  });
  assert.equal(store.jobs().email.state, 'blocked');
  assert.equal(store.jobs().email.attempts, 0);
  await deliverPendingNotifications(memoryStore(), config, () => false, async () => assert.fail('lease lost'));
});

test('notification writes preserve human ownership, timestamps, and handling', async () => {
  const store = memoryStore();
  await store.claimNotification(fixture().id, 'email', config);
  const result = await conditionalTransition(store.client, fixture().id, 'acknowledge', 'operator-a', transition);
  assert.equal(result.outcome, 'updated');
  await store.finishNotification(fixture().id, 'email', store.jobs().email.attemptId, { state: 'accepted', providerId: 'mail' });
  assert.equal(store.row().claimedBy, 'operator-a');
  assert.ok(store.row().claimedAt);
  assert.equal((await conditionalTransition(store.client, fixture().id, 'handle', 'operator-b', transition)).outcome, 'conflict');
  assert.equal((await conditionalTransition(store.client, fixture().id, 'handle', 'operator-a', transition)).outcome, 'updated');
  assert.equal(store.jobs().email.state, 'accepted');
  assert.equal(store.row().handledBy, 'operator-a');
  assert.ok(store.row().handledAt);
});

test('signed delivery can arrive before acceptance checkpoint; stale and duplicate callbacks are harmless', async () => {
  const store = memoryStore();
  await store.claimNotification(fixture().id, 'whatsapp', config);
  const attemptId = store.jobs().whatsapp.attemptId;
  const update = { attemptId, providerId: 'wa', state: 'delivered' };
  await store.recordDelivery(fixture().id, 'whatsapp', update);
  await store.finishNotification(fixture().id, 'whatsapp', attemptId, { state: 'accepted', providerId: 'wa' });
  await store.recordDelivery(fixture().id, 'whatsapp', { ...update, state: 'accepted' });
  assert.equal(store.jobs().whatsapp.state, 'delivered');
  assert.equal(applyDelivery(store.jobs().whatsapp, { ...update, attemptId: 'old' }), null);
  assert.equal(applyDelivery(store.jobs().whatsapp, { ...update, providerId: 'another-message' }), null);
});

test('email delivery accounts for all recipients and partial delivery cannot be resent', async () => {
  const store = memoryStore();
  const emails = ['a@example.com', 'b@example.com'];
  await store.claimNotification(fixture().id, 'email', { ...config, operatorEmails: emails });
  const attemptId = store.jobs().email.attemptId;
  await store.recordDelivery(fixture().id, 'email', { attemptId, recipient: recipientHash(emails[0]), state: 'delivered' });
  assert.equal(store.jobs().email.state, 'accepted');
  await store.recordDelivery(fixture().id, 'email', { attemptId, recipient: recipientHash(emails[1]), state: 'delivery_failed', error: 'sendgrid_bounce' });
  await assert.rejects(store.retryNotification(fixture().id, 'email', 'operator'), /Partial delivery/);
  await store.recordDelivery(fixture().id, 'email', { attemptId, recipient: recipientHash(emails[1]), state: 'delivered' });
  await store.recordDelivery(fixture().id, 'email', { attemptId, recipient: recipientHash(emails[0]), state: 'accepted' });
  assert.equal(store.jobs().email.state, 'delivered');
  assert.equal(store.jobs().email.lastError, '');
});

test('manual confirmed non-delivery requeue records audit; legacy sends and disabled channels are not replayed', async () => {
  const store = memoryStore();
  store.setJob('email', { state: 'unknown' });
  await store.retryNotification(fixture().id, 'email', 'operator');
  assert.equal(store.jobs().email.state, 'pending');
  assert.equal(JSON.parse(store.row().auditTrail)[0].action, 'retry_email_confirmed_not_delivered');
  assert.equal(legacyNotifications({ notificationState: 'sent' }).email.state, 'accepted');
  assert.equal(legacyNotifications({ notificationState: 'sent' }).whatsapp.state, 'disabled');
  assert.equal(initialNotifications({ emailEnabled: false }).email.state, 'disabled');
  assert.equal(JSON.stringify(publicAlert(fixture())).includes('PRIVATE-RAW'), false);
  assert.equal(JSON.stringify(publicAlert(fixture())).includes('PRIVATE-EMAIL'), false);
  assert.equal(publicAlert(fixture()).legalIdentityRef, 'PRIVATE-REFERENCE');
});

test('provider requests contain only minimal operational data; templates reuse the same pipeline', async () => {
  const attempt = { attemptId: '12345678-1234-1234-1234-123456789abc' };
  for (const channel of ['email', 'whatsapp']) {
    const result = await sendNotification(channel, fixture(), config, attempt, async (url, options) => {
      assert.ok(url.startsWith('https://'));
      assert.equal(options.body.includes('PRIVATE-'), false);
      assert.equal(options.redirect, 'error');
      if (channel === 'email') {
        const body = JSON.parse(options.body);
        assert.equal(body.personalizations[0].to[0].email, config.operatorEmails[0]);
        assert.equal(body.custom_args.id_alert_attempt, attempt.attemptId);
        assert.match(body.content[0].value, /New ID application\nNeuron: Lab Neuron\nReceived:/);
        return new Response(null, { status: 202, headers: { 'x-message-id': 'email-id' } });
      }
      const body = new URLSearchParams(options.body);
      assert.equal(body.get('From'), env.TWILIO_WHATSAPP_FROM);
      assert.match(body.get('StatusCallback'), /https:\/\/dev.example\/api\/id-applications\/notifications\/twilio\?id=/);
      return Response.json({ sid: `SM${'2'.repeat(32)}` }, { status: 201 });
    }, env);
    assert.equal(result.state, 'accepted');
  }
  await sendNotification('whatsapp', fixture(), config, attempt, async (_url, options) => {
    const body = new URLSearchParams(options.body);
    assert.equal(body.has('Body'), false);
    assert.equal(JSON.parse(body.get('ContentVariables'))['3'], 'https://dev.example/neuro-access/id-inbox');
    return Response.json({ sid: `SM${'2'.repeat(32)}` }, { status: 201 });
  }, { ...env, TWILIO_WHATSAPP_CONTENT_SID: `HX${'3'.repeat(32)}` });
});

test('provider timeouts and 5xx are uncertain; rejection errors never expose response bodies', async () => {
  assert.equal((await sendNotification('email', fixture(), config, {}, async () => { throw new Error('PRIVATE'); }, env)).state, 'unknown');
  assert.equal((await sendNotification('email', fixture(), config, {}, async () => new Response('PRIVATE', { status: 503 }), env)).state, 'unknown');
  const rejected = await sendNotification('whatsapp', fixture(), config, {}, async () => Response.json({ code: 63016, message: 'PRIVATE' }, { status: 400 }), env);
  assert.deepEqual(rejected, { state: 'rejected', error: 'provider_http_400_code_63016' });
  assert.equal(notificationConfigError('email', { ...config, publicOrigin: 'https://dev.example/path' }, env), 'public_origin_not_configured');
});

test('Twilio signature binds all form fields and the public URL including query', () => {
  const url = 'https://dev.example/callback?id=123&attempt=456';
  const params = new URLSearchParams({ MessageSid: 'SM123', AccountSid: 'AC123' });
  const signature = createHmac('sha1', 'secret').update(`${url}AccountSidAC123MessageSidSM123`).digest('base64');
  assert.ok(validTwilioSignature(url, params, signature, 'secret'));
  assert.equal(validTwilioSignature(url.replace('123&', '999&'), params, signature, 'secret'), false);
  params.set('MessageStatus', 'delivered');
  assert.equal(validTwilioSignature(url, params, signature, 'secret'), false);
});

test('SendGrid verification binds timestamp and exact raw bytes; body size is bounded', async () => {
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const key = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
  const body = Buffer.from('[{"event":"delivered"}]');
  const timestamp = '1790856000';
  const signature = sign('sha256', Buffer.concat([Buffer.from(timestamp), body]), privateKey).toString('base64');
  assert.ok(validSendGridSignature(body, timestamp, signature, key));
  assert.equal(validSendGridSignature(Buffer.from('[]'), timestamp, signature, key), false);
  assert.equal(validSendGridSignature(body, '1790856001', signature, key), false);
  assert.equal(validSendGridSignature(body, timestamp, signature, 'invalid'), false);
  assert.equal((await limitedBody(new Request('https://example.com', { method: 'POST', body: 'abc' }), 3)).toString(), 'abc');
  await assert.rejects(limitedBody(new Request('https://example.com', { method: 'POST', body: 'abcd' }), 3), { statusCode: 413 });
});
