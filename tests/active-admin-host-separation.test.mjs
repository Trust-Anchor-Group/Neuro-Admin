import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  ACTIVE_ADMIN_HOST_STORAGE_KEY,
  getStoredActiveAdminHost,
  setStoredActiveAdminHost,
} from '../src/lib/activeAdminHostState.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readProjectFile = (relativePath) => readFile(path.join(projectRoot, relativePath), 'utf8');

test('active admin host is refreshed from the authoritative current-Neuron endpoint', async () => {
  const source = await readProjectFile('src/lib/activeAdminHost.js');

  assert.match(source, /activeAdminHostState\.mjs/);
  assert.match(source, /fetch\('\/api\/neuron-switch\/current'/);
  assert.match(source, /return syncActiveAdminHost\(payload\?\.activeHost\)/);
  assert.match(source, /ACTIVE_ADMIN_HOST_CHANGED_EVENT = 'active-admin-host-changed'/);
  assert.doesNotMatch(source, /AgentAPI\.Host/);
});

test('the active-admin mirror follows A to B to C without touching Agent transport storage', () => {
  const storage = new Map([
    ['AgentAPI.Host', 'a.example.test'],
    ['AgentAPI.Token', 'source-agent-jwt'],
  ]);
  const sessionStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };

  assert.equal(setStoredActiveAdminHost(sessionStorage, 'a.example.test'), 'a.example.test');
  assert.equal(getStoredActiveAdminHost(sessionStorage), 'a.example.test');
  assert.equal(setStoredActiveAdminHost(sessionStorage, 'https://b.example.test/'), 'b.example.test');
  assert.equal(getStoredActiveAdminHost(sessionStorage), 'b.example.test');
  assert.equal(setStoredActiveAdminHost(sessionStorage, 'c.example.test'), 'c.example.test');
  assert.equal(getStoredActiveAdminHost(sessionStorage), 'c.example.test');
  assert.equal(storage.get(ACTIVE_ADMIN_HOST_STORAGE_KEY), 'c.example.test');
  assert.equal(storage.get('AgentAPI.Host'), 'a.example.test');
  assert.equal(storage.get('AgentAPI.Token'), 'source-agent-jwt');
});

test('switching changes only the active-admin mirror and preserves Agent API transport state', async () => {
  const [switchControl, client, quickLogin] = await Promise.all([
    readProjectFile('src/components/shared/NeuronSwitchControl.jsx'),
    readProjectFile('src/lib/neuronSwitchClient.js'),
    readProjectFile('src/components/quickLogin/QuickLogin.jsx'),
  ]);

  assert.match(switchControl, /syncActiveAdminHost\(currentPayload\.activeHost\)/);
  assert.match(switchControl, /syncActiveAdminHost\(activatePayload\.activeHost\)/);
  assert.doesNotMatch(switchControl, /AgentAPI\.Host/);
  assert.match(client, /activeHost: getCurrentNeuronHost\(\)/);
  assert.match(client, /agentHost: getAgentApiHost\(\)/);
  assert.match(client, /sourceJwt: sessionStorage\.getItem\('AgentAPI\.Token'\) \|\| ''/);
  assert.match(quickLogin, /AgentAPI\.IO\.SetHost\(neuron, true\)/);
});

test('admin-host consumers no longer read AgentAPI.Host for branding, settings, assets, or issuer JIDs', async () => {
  const paths = [
    'src/app/(landingpage)/landingpage/page.jsx',
    'src/components/shared/Navbar.js',
    'src/components/shared/Menu.js',
    'src/app/(dashboard)/neuro-access/settings/SettingsPageClient.jsx',
    'src/components/assets/DisplayDetailsAsset.jsx',
    'src/app/(dashboard)/neuro-assets/detailpage/[id]/page.jsx',
    'src/components/assets/IssuerAccountsManager.jsx',
  ];
  const sources = await Promise.all(paths.map(readProjectFile));

  for (const source of sources) {
    assert.match(source, /useActiveAdminHost/);
    assert.doesNotMatch(source, /AgentAPI\.Host/);
  }
  assert.match(sources[6], /subjectSuffix = useMemo\(\(\) => activeAdminHost \? `@\$\{activeAdminHost\}` : ''/);
  assert.match(sources[4], /backendHost \? `https:\/\/\$\{backendHost\}\$\{value\}` : value/);
  assert.match(sources[5], /backendHost \? `https:\/\/\$\{backendHost\}\$\{value\}` : value/);
});

test('logout clears the browser admin-host mirror and pending actions use server-side active context', async () => {
  const [navbar, sessionPing, pendingFetch] = await Promise.all([
    readProjectFile('src/components/shared/Navbar.js'),
    readProjectFile('src/components/SessionPing.js'),
    readProjectFile('src/components/access/pendingFetch.js'),
  ]);

  assert.match(navbar, /clearActiveAdminHost\(\)/);
  assert.match(sessionPing, /clearActiveAdminHost\(\)/);
  assert.doesNotMatch(pendingFetch, /x-agent-host|AgentAPI\.Host/);
});
