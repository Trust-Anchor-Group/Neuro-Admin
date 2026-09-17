import test from 'node:test';
import assert from 'node:assert/strict';
import { getReportsJidMap, resolveReportsJid, validateReportsJid } from '../src/lib/reports/configuration.js';
import { deriveAgentBareJid, hasReportsSource, isFullJid, normalizeDataSources, resolveFullJid } from '../src/lib/reports/diagnostics.js';
import { normalizeReportsError } from '../src/lib/reports/errors.js';

test('resolves explicit Reports JIDs by active admin host without inferring host@host', () => {
  const raw = JSON.stringify({ 'a.example.test': 'reports-a@tagroot.io', 'b.example.test': 'reports-b@tagroot.io' });
  assert.equal(resolveReportsJid('https://a.example.test/', raw), 'reports-a@tagroot.io');
  assert.equal(resolveReportsJid('b.example.test', raw), 'reports-b@tagroot.io');
  assert.equal(resolveReportsJid('c.example.test', raw), '');
  assert.equal(resolveReportsJid('athletesandyou.tagroot.io', raw), 'athletesandyou.eu.id.tagroot.io@eu.id.tagroot.io');
  assert.equal(getReportsJidMap(raw)['a.example.test'], 'reports-a@tagroot.io');
});

test('missing and malformed mappings produce safe configuration messages', () => {
  assert.equal(validateReportsJid(''), 'Reports are not configured for this Neuron.');
  assert.equal(validateReportsJid('CPU'), 'The configured Reports JID is invalid.');
  assert.equal(validateReportsJid('reports@example.com'), '');
});

test('reports transport remains on the Agent home while targets follow active admin context', async () => {
  const fs = await import('node:fs/promises');
  const page = await fs.readFile(new URL('../src/app/(dashboard)/reports/page.jsx', import.meta.url), 'utf8');
  const client = await fs.readFile(new URL('../src/lib/reports/agentClient.js', import.meta.url), 'utf8');
  assert.match(page, /resolveReportsJid\(activeAdminHost\)/);
  assert.match(page, /inspectReportsTarget\(agentHomeHost, configuredReportsJid\)/);
  assert.match(page, /getReports\(agentHomeHost, inspection\.reportsRequestJid/);
  assert.doesNotMatch(page, /AgentAPI\.IO\.SetHost/);
  assert.doesNotMatch(client, /SetHost/);
  assert.match(client, /Agent\.Reports\.js/);
  assert.match(client, /Agent\.Things\.js/);
  assert.match(client, /GetFullJid/);
  assert.match(client, /resolveFullJid\(things\.XmppHelper/);
  assert.doesNotMatch(client, /resolveFullJid\(things\.XmppHelper\.GetFullJid/);
  assert.match(client, /GetAllDataSources/);
});

test('normalizes data sources and identifies the Reports source', () => {
  const sources = normalizeDataSources([{ id: 'CPU' }, { sourceId: 'Reports', name: 'Reports' }]);
  assert.deepEqual(sources, [{ id: 'CPU', name: 'CPU' }, { id: 'Reports', name: 'Reports' }]);
  assert.equal(hasReportsSource(sources), true);
  assert.equal(hasReportsSource([{ id: 'Legal' }]), false);
});

test('derives only a bare Agent JID for diagnostics', async () => {
  assert.equal(deriveAgentBareJid('admin', 'lab.tagroot.io'), 'admin@lab.tagroot.io');
  assert.equal(deriveAgentBareJid('admin@lab.tagroot.io/resource', 'lab.tagroot.io'), 'admin@lab.tagroot.io');
  assert.equal(deriveAgentBareJid('', 'lab.tagroot.io'), '');
  assert.equal(isFullJid('lab.tagroot.io@tagroot.io/resource'), true);
  assert.equal(isFullJid('lab.tagroot.io@tagroot.io'), false);
  const helper = {
    JidType: { Full: 2 },
    ClassifyJid(jid) { return jid.includes('/') ? this.JidType.Full : 1; },
    async GetFullJid(jid) { assert.equal(this, helper); return `${jid}/agent-resource`; },
  };
  const resolved = await resolveFullJid(helper, 'lab.tagroot.io@tagroot.io');
  assert.deepEqual(resolved, { jid: 'lab.tagroot.io@tagroot.io/agent-resource', full: true });
  const unresolved = await resolveFullJid({ async GetFullJid(jid) { return jid; } }, 'lab.tagroot.io@tagroot.io');
  assert.deepEqual(unresolved, { jid: 'lab.tagroot.io@tagroot.io', full: false });
  await assert.rejects(() => resolveFullJid({ async GetFullJid() { throw new Error('this.ClassifyJid is not a function'); } }, 'lab.tagroot.io@tagroot.io'), /this\.ClassifyJid/);
});

test('classifies source visibility and source lookup failures separately', () => {
  assert.equal(normalizeReportsError(new Error('Source not found'), { kind: 'source-lookup-failed' }).kind, 'source-lookup-failed');
  assert.equal(normalizeReportsError(new Error('not used'), { kind: 'source-not-visible' }).kind, 'source-not-visible');
  assert.equal(normalizeReportsError({ statusCode: 403, message: 'Forbidden' }).kind, 'privileges');
  assert.notEqual(normalizeReportsError(new Error('this.ClassifyJid is not a function'), { kind: 'client-error' }).kind, 'presence');
});
