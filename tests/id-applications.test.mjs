import test from 'node:test';
import assert from 'node:assert/strict';
import { xml } from '@xmpp/client';
import { bareJid, normalizeAlert, parseEventStanza, readRegistry, transition } from '../src/lib/idAlerts/domain.mjs';
import { ingestStanza } from '../src/lib/idAlerts/ingest.mjs';
import { conditionalTransition } from '../src/lib/idAlerts/store.mjs';
import { acquireReceiverLease, readReceiverLease, releaseReceiverLease, renewReceiverLease } from '../src/lib/idAlerts/lease.mjs';
import { Parser } from '@xmpp/xml';

const NS = 'urn:xmpp:eventlog';
const neuronA = { id: 'a', jid: 'events@a.example', name: 'Neuron A', customerId: 'customer-a', enabled: true };
const neuronB = { id: 'b', jid: 'events@b.example', name: 'Neuron B', customerId: 'customer-b', enabled: true };
const config = {
  receiverJid: 'inbox@central.example', neurons: [neuronA, neuronB],
  eventIds: new Set(['LegalIdRegistered']), discovery: true,
  applicationRefTags: ['ApplicationRef'], legalIdentityRefTags: ['LegalIdentityRef'],
};

function stanza(from, reference, eventId = 'LegalIdRegistered') {
  return xml('message', { from: `${from}/resource`, to: config.receiverJid, type: 'normal' },
    xml('log', { xmlns: NS, id: eventId, timestamp: '2026-09-29T09:00:00Z', type: 'Notice', level: 'Minor', module: 'LegalIdentity' },
      xml('message', {}, 'Application received'),
      xml('tag', { name: 'ApplicationRef', value: reference })));
}

function fakeStore() {
  const alerts = new Map();
  const discovery = [];
  return {
    alerts, discovery,
    async markNeuronSeen() {},
    async saveDiscovery(event, neuron) { discovery.push({ event, neuron }); },
    async createAlert(alert) { if (alerts.has(alert.id)) return false; alerts.set(alert.id, alert); return true; },
  };
}

test('parses XEP-0337 fields, tags, raw event and exact sender', () => {
  const [event] = parseEventStanza(stanza(neuronA.jid, 'ref-1'), config.receiverJid);
  assert.equal(event.eventId, 'LegalIdRegistered');
  assert.equal(event.sourceJid, 'events@a.example/resource');
  assert.equal(event.tags.ApplicationRef, 'ref-1');
  assert.match(event.rawStanza, /<log/);
  assert.equal(bareJid(event.sourceJid), neuronA.jid);
  const alert = normalizeAlert(event, neuronA, config);
  assert.equal(alert.applicationRef, 'ref-1');
  assert.equal(alert.status, 'new');
});

test('rejects malformed and misaddressed messages and duplicate registry JIDs', () => {
  assert.throws(() => parseEventStanza(xml('message', { from: 'x@y', to: 'elsewhere@y' }), config.receiverJid));
  assert.throws(() => parseEventStanza(xml('message', { from: 'x@y', to: config.receiverJid }, xml('log', { xmlns: NS, timestamp: 'bad' })), config.receiverJid));
  assert.throws(() => parseEventStanza(xml('message', { from: 'x@y', to: config.receiverJid }, xml('log', { xmlns: NS, timestamp: '2026-09-29T09:00:00Z' })), config.receiverJid));
  assert.throws(() => readRegistry(JSON.stringify([{ id: 'a', jid: neuronA.jid }, { id: 'b', jid: neuronA.jid }])));
});

test('two independent Neurons persist distinct alerts with notification jobs; retries deduplicate', async () => {
  const store = fakeStore();
  await ingestStanza(stanza(neuronA.jid, 'same-ref'), config, store);
  await ingestStanza(stanza(neuronB.jid, 'same-ref'), config, store);
  await ingestStanza(stanza(neuronA.jid, 'same-ref'), config, store);
  assert.equal(store.alerts.size, 2);
  assert.ok([...store.alerts.values()].every((alert) => alert.notifications.email.state === 'pending'));
  assert.deepEqual(new Set([...store.alerts.values()].map((alert) => alert.sourceNeuronId)), new Set(['a', 'b']));
  assert.ok([...store.alerts.values()].every((alert) => alert.status === 'new'));
});

test('unknown sender fails closed and unconfirmed EventId stays discovery only', async () => {
  const store = fakeStore();
  await assert.rejects(ingestStanza(stanza('unknown@c.example', 'ref-1'), config, store));
  await assert.rejects(ingestStanza(stanza(neuronA.jid, 'ref-1'), { ...config, neurons: [{ ...neuronA, enabled: false }] }, store));
  for (const eventId of ['LegalIdUpdated', 'IdReviewPerformed', 'LoginSuccessful', 'FileNotFound', 'HoneyPot', 'NotImplementedException']) {
    await ingestStanza(stanza(neuronA.jid, 'ref-1', eventId), config, store);
  }
  assert.equal(store.alerts.size, 0);
  assert.equal(store.discovery.length, 6);
});

test('diagnostic storage failure cannot prevent alert and notification persistence', async () => {
  const store = fakeStore();
  store.saveDiscovery = async () => { throw new Error('storage unavailable'); };
  await ingestStanza(stanza(neuronA.jid, 'ref-diagnostic-failure'), config, store);
  assert.equal(store.alerts.size, 1);
  assert.equal([...store.alerts.values()][0].notifications.email.state, 'pending');
});

test('acknowledgement ownership and handled transitions', () => {
  const [event] = parseEventStanza(stanza(neuronA.jid, 'ref-1'), config.receiverJid);
  const fresh = normalizeAlert(event, neuronA, config);
  const claimed = transition(fresh, 'acknowledge', 'operator-a', '2026-09-29T09:01:00Z');
  assert.equal(claimed.claimedBy, 'operator-a');
  assert.equal(claimed.claimedAt, '2026-09-29T09:01:00Z');
  assert.equal(claimed.acknowledgedBy, 'operator-a');
  assert.throws(() => transition(claimed, 'acknowledge', 'operator-b'));
  assert.throws(() => transition(claimed, 'handle', 'operator-b'));
  const handled = transition(claimed, 'handle', 'operator-a', '2026-09-29T09:05:00Z');
  assert.equal(handled.handledBy, 'operator-a');
  assert.equal(handled.status, 'handled');
});

test('simultaneous claims use ETag compare-and-swap so only one wins', async () => {
  const [event] = parseEventStanza(stanza(neuronA.jid, 'race-ref'), config.receiverJid);
  const alert = normalizeAlert(event, neuronA, config);
  let stored = { ...alert, partitionKey: 'alerts', rowKey: alert.id, tags: '{}', notifications: JSON.stringify(alert.notifications), auditTrail: '[]', etag: 'version-1' };
  const client = {
    async getEntity() { return { ...stored }; },
    async updateEntity(entity, mode, options) {
      assert.equal(mode, 'Replace');
      if (options.etag !== stored.etag) throw Object.assign(new Error('ETag mismatch'), { statusCode: 412 });
      stored = { ...entity, etag: 'version-2' };
    },
  };
  const results = await Promise.all([
    conditionalTransition(client, alert.id, 'acknowledge', 'operator-a', transition),
    conditionalTransition(client, alert.id, 'acknowledge', 'operator-b', transition),
  ]);
  assert.deepEqual(results.map((result) => result.outcome).sort(), ['conflict', 'updated']);
  assert.equal(JSON.parse(stored.auditTrail).length, 1);
  assert.ok(['operator-a', 'operator-b'].includes(stored.acknowledgedBy));
});

test('parses Neuron/XEP-0337 optional fields, repeated typed tags, multiple logs and XML escapes', () => {
  const wire = `<stream><message from="events@a.example/sink" to="inbox@central.example/id-applications" type="normal" xml:lang="en">
    <log xmlns="urn:xmpp:eventlog" timestamp="2026-09-29T10:00:00+02:00" id="Legal&amp;ID" type="Notice" level="Major" subject="Alice &amp; Bob" object="obj" facility="facility" module="module">
      <message>Application &lt;pending&gt; &amp; checked</message>
      <tag name="Reference" value="A&amp;B" type="xs:string"/><tag name="Reference" value="C"/>
      <stackTrace>line 1 &amp; line 2</stackTrace><unknown field="preserved"/>
    </log>
    <log xmlns="urn:xmpp:eventlog" timestamp="2026-09-29T08:00:01Z" stackTrace="at line 2"><message>Second</message></log>
  </message></stream>`;
  const parser = new Parser();
  let parsed;
  parser.on('element', (element) => { parsed = element; });
  parser.write(wire);
  const events = parseEventStanza(parsed, config.receiverJid);
  assert.equal(events.length, 2);
  assert.equal(events[0].eventId, 'Legal&ID');
  assert.equal(events[0].timestamp, '2026-09-29T08:00:00.000Z');
  assert.equal(events[0].message, 'Application <pending> & checked');
  assert.equal(events[0].actor, 'Alice & Bob');
  assert.equal(events[0].subject, 'Alice & Bob');
  assert.equal(events[0].xmlLang, 'en');
  assert.equal(events[0].stackTrace, 'line 1 & line 2');
  assert.deepEqual(events[0].tagList, [
    { name: 'Reference', value: 'A&B', type: 'xs:string' },
    { name: 'Reference', value: 'C', type: '' },
  ]);
  assert.match(events[0].rawEvent, /<unknown field="preserved"\/>/);
  assert.equal(events[1].type, 'Informational');
  assert.equal(events[1].level, 'Minor');
  assert.equal(events[1].eventId, '');
  assert.equal(events[1].stackTrace, 'at line 2');
});

test('one receiver wins lease race; expired lease can be taken over without stale release', async () => {
  let row;
  let version = 0;
  const client = {
    async getEntity() {
      if (!row) throw Object.assign(new Error('missing'), { statusCode: 404 });
      return { ...row };
    },
    async createEntity(entity) {
      if (row) throw Object.assign(new Error('exists'), { statusCode: 409 });
      row = { ...entity, etag: String(++version) };
    },
    async updateEntity(entity, mode, options) {
      if (options.etag !== row?.etag) throw Object.assign(new Error('stale'), { statusCode: 412 });
      row = { ...entity, etag: String(++version) };
    },
    async deleteEntity(_partition, _key, options) {
      if (options.etag !== row?.etag) throw Object.assign(new Error('stale'), { statusCode: 412 });
      row = undefined;
    },
  };
  const [a, b] = await Promise.all([
    acquireReceiverLease(client, 'a', 1000),
    acquireReceiverLease(client, 'b', 1000),
  ]);
  assert.equal(Number(a) + Number(b), 1);
  const winner = (await readReceiverLease(client)).owner;
  const loser = winner === 'a' ? 'b' : 'a';
  assert.equal(await renewReceiverLease(client, loser, true, 2000), false);
  assert.equal(await renewReceiverLease(client, winner, true, 2000), true);
  assert.equal(await acquireReceiverLease(client, loser, 2001), false);
  assert.equal(await acquireReceiverLease(client, loser, 32001), true);
  assert.equal(await renewReceiverLease(client, winner, true, 32002), false);
  await releaseReceiverLease(client, winner);
  assert.equal((await readReceiverLease(client)).owner, loser);
  await releaseReceiverLease(client, loser);
  assert.equal(await readReceiverLease(client), null);
});
