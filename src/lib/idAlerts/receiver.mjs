import { randomUUID } from 'node:crypto';
import { client, xml } from '@xmpp/client';
import { getIdAlertConfig } from './config.mjs';
import { ingestStanza } from './ingest.mjs';
import * as store from './store.mjs';
import { deliverPendingNotifications } from './notificationWorker.mjs';

const TICK_MS = 5000;
const LEASE_MS = 30000;
let receiver;
let controller;
let retryTimer;
let state = { role: 'stopped', connected: false, lastConnectedAt: null, lastEventAt: null };

export function receiverState() { return state; }

export async function startReceiver() {
  if (controller) return controller;
  const config = getIdAlertConfig();
  if (!config.receiverJid || !config.neurons.length) throw new Error('XMPP JID and Neuron registry are required');
  const service = process.env.ID_ALERT_XMPP_SERVICE || '';
  if (!/^(xmpp|xmpps|wss):\/\//i.test(service)) throw new Error('ID_ALERT_XMPP_SERVICE must use xmpp://, xmpps:// or wss://');
  const password = process.env.ID_ALERT_XMPP_PASSWORD;
  if (!password) throw new Error('ID_ALERT_XMPP_PASSWORD is required');
  const [username, domain] = config.receiverJid.split('@');
  if (!username || !domain || domain.includes('@') || domain.includes('/')) throw new Error('ID_ALERT_XMPP_JID must be a bare JID');
  await store.storageReady();

  const owner = randomUUID();
  let expiresAt = 0;
  let busy = false;
  let stopped = false;
  let notificationsBusy = false;
  const ownsLease = () => !stopped && state.role === 'leader' && Date.now() < expiresAt;

  const stopConnection = async () => {
    const xmpp = receiver;
    receiver = undefined;
    clearInterval(retryTimer);
    state = { ...state, connected: false };
    if (xmpp) await xmpp.stop().catch((error) => console.error('[id-alerts] XMPP stop failed', { name: error.name }));
  };

  const startConnection = () => {
    const xmpp = client({ service, domain, username, password, resource: 'id-applications' });
    receiver = xmpp;
    xmpp.on('online', async () => {
      if (!ownsLease() || receiver !== xmpp) return;
      state = { ...state, connected: true, lastConnectedAt: new Date().toISOString() };
      console.info('[id-alerts] XMPP receiver connected');
      try { await xmpp.send(xml('presence')); } catch (error) { console.error('[id-alerts] presence failed', { name: error.name }); }
    });
    xmpp.on('disconnect', () => { state = { ...state, connected: false }; console.warn('[id-alerts] XMPP receiver disconnected'); });
    xmpp.on('error', (error) => { console.error('[id-alerts] XMPP connection error', { name: error.name }); });
    xmpp.on('stanza', (stanza) => {
      if (!ownsLease() || receiver !== xmpp) return;
      if (stanza.is('iq') && stanza.attrs.type === 'get' && stanza.getChild('query', 'http://jabber.org/protocol/disco#info')) {
        void xmpp.send(xml('iq', { to: stanza.attrs.from, type: 'result', id: stanza.attrs.id },
          xml('query', { xmlns: 'http://jabber.org/protocol/disco#info' },
            xml('feature', { var: 'urn:xmpp:eventlog' })))).catch((error) =>
          console.error('[id-alerts] XMPP discovery response failed', { name: error.name }));
        return;
      }
      if (!stanza.is('message')) return;
      const processEvent = async (attempt = 0) => {
        if (!ownsLease()) throw new Error('Receiver lease expired');
        try { return await ingestStanza(stanza, config, store); }
        catch (error) {
          if (attempt >= 4 || /Unknown or disabled|Invalid|No XEP|addressed elsewhere|exceeds size|lease expired/.test(error.message)) throw error;
          await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
          return processEvent(attempt + 1);
        }
      };
      void processEvent()
        .then((outcomes) => {
          state = { ...state, lastEventAt: new Date().toISOString() };
          console.info('[id-alerts] event processed', { outcomes: outcomes.map(({ outcome, alertId }) => ({ outcome, alertId })) });
        })
        .catch((error) => console.warn('[id-alerts] event rejected or deferred', { name: error.name, statusCode: error.statusCode }));
    });
    void xmpp.start().catch((error) => console.error('[id-alerts] XMPP start failed', { name: error.name }));
    retryTimer = setInterval(async () => {
      if (!ownsLease() || notificationsBusy) return;
      notificationsBusy = true;
      try {
        await deliverPendingNotifications(store, config, ownsLease);
      } catch (error) { console.error('[id-alerts] notification scan failed', { name: error.name }); }
      finally { notificationsBusy = false; }
      try { if (ownsLease()) await store.pruneDiscovery(); }
      catch (error) { console.warn('[id-alerts] discovery retention deferred', { name: error.name }); }
    }, 30000);
  };

  const tick = async () => {
    if (busy || stopped) return;
    busy = true;
    try {
      if (state.role === 'leader') {
        const started = Date.now();
        if (started >= expiresAt || !await store.renewLease(owner, state.connected)) {
          expiresAt = 0;
          state = { ...state, role: 'standby', connected: false };
          await stopConnection();
          await store.releaseLease(owner);
          console.warn('[id-alerts] receiver lease lost');
        } else expiresAt = started + LEASE_MS - 1000;
      } else {
        const started = Date.now();
        if (await store.acquireLease(owner)) {
          if (stopped) { await store.releaseLease(owner); return; }
          expiresAt = started + LEASE_MS - 1000;
          state = { ...state, role: 'leader', connected: false };
          console.info('[id-alerts] receiver lease acquired');
          startConnection();
        }
      }
    } catch (error) {
      console.error('[id-alerts] receiver lease operation failed', { name: error.name });
      if (state.role === 'leader') {
        expiresAt = 0;
        state = { ...state, role: 'standby', connected: false };
        await stopConnection();
        await store.releaseLease(owner).catch(() => {});
      }
    } finally { busy = false; }
  };

  const current = {
    async stop() {
      if (stopped) return;
      stopped = true;
      clearInterval(this.timer);
      expiresAt = 0;
      state = { ...state, role: 'stopped', connected: false };
      await stopConnection();
      await store.releaseLease(owner).catch((error) => console.error('[id-alerts] lease release failed', { name: error.name }));
      if (controller === current) controller = undefined;
    },
  };
  controller = current;
  await tick();
  current.timer = setInterval(tick, TICK_MS);
  process.once('SIGTERM', () => void current.stop());
  process.once('SIGINT', () => void current.stop());
  return current;
}
