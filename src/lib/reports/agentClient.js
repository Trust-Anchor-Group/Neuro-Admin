'use client';

import AgentAPI from 'agent-api';
import { normalizeReportsError } from './errors';
import { deriveAgentBareJid, hasReportsSource, normalizeDataSources, resolveFullJid } from './diagnostics';
import {
  createExecutionEvidence,
  markExecutionFailure,
  markExecutionResult,
  recordQueryCreated,
  recordQueryProgress,
  updateExecutionEvidence,
} from './executionEvidence';

const loadedScripts = new Map();
const eventsReadyScripts = new Map();
const EVENTS_SOCKET_TIMEOUT_MS = 15000;
const executionTrackers = new Map();
const queryTrackers = new Map();
const executionEvidenceListeners = new Set();
let activeExecutionTracker = null;
let eventsRuntime = {
  host: '',
  url: '',
  state: 'Not loaded',
  openedAt: '',
  lastCloseAt: '',
  lastMessageAt: '',
  generation: 0,
  reconnectCount: 0,
  closeCount: 0,
  registerCount: 0,
  registeredTabId: '',
  registeredAt: '',
  messageCount: 0,
  lastMessageType: '',
  lastMessageQueryId: '',
};

function ensureAgentTabId() {
  if (typeof window === 'undefined') return '';

  const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let tabId = typeof window.name === 'string' && guidPattern.test(window.name)
    ? window.name
    : '';

  if (!tabId) {
    tabId = typeof window.crypto?.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.name = tabId;
  }

  // Agent.js refers to TabID as a global variable when registering event
  // handlers. The QuickLogin component's module-local TabID is not visible
  // to that classic script, so publish the shared tab identifier explicitly.
  window.TabID = tabId;
  return tabId;
}

function setNeuronMeta(host) {
  if (typeof document === 'undefined') return;
  let meta = document.querySelector('meta[name="NEURON"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'NEURON';
    document.head.appendChild(meta);
  }
  meta.content = host;
}

function normalizeHost(host) {
  return String(host || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

function scriptUrl(host, path) {
  return `https://${normalizeHost(host)}${path}`;
}

function loadScript(src) {
  if (loadedScripts.has(src)) return loadedScripts.get(src);
  const task = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing?.dataset.loaded === 'true' || existing?.dataset.nscript) {
      resolve();
      return;
    }
    if (existing && document.readyState === 'complete') {
      // A script injected by Next's layout may already have finished loading
      // without the dataset marker used by this loader. Waiting for a second
      // load event in that case leaves discovery stuck at "Loading reports".
      resolve();
      return;
    }
    const script = existing || document.createElement('script');
    script.async = false;
    script.src = src;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    if (!existing) document.head.appendChild(script);
  });
  loadedScripts.set(src, task);
  return task;
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function isEventsSocketUrl(value) {
  try {
    return new URL(String(value), window.location.href).pathname.endsWith('/ClientEventsWS');
  } catch {
    return String(value || '').includes('/ClientEventsWS');
  }
}

/**
 * Events.js sets EventCheckingEnabled before its WebSocket is actually open.
 * Waiting only for the script's load event therefore races StartExecuteQuery:
 * the query can be sent before the tab has been registered for client events.
 * Observe the socket created by Events.js while it loads and continue only
 * after its open handler had a turn to send the Register message.
 */
function loadEventsScript(src) {
  if (eventsReadyScripts.has(src)) return eventsReadyScripts.get(src);

  const task = (async () => {
    if (typeof window === 'undefined' || typeof window.WebSocket !== 'function') {
      await loadScript(src);
      return;
    }

    const NativeWebSocket = window.WebSocket;
    const eventHost = new URL(src, window.location.href).host;
    if (NativeWebSocket.__reportsEventsProxy) {
      // A prior Agent home already installed the observer. Reuse it rather
      // than stacking proxies and double-counting reconnect/message events.
      await loadScript(src);
      return;
    }
    let socketObserved = false;
    let socketOpenedResolve;
    const socketOpened = new Promise((resolve) => {
      socketOpenedResolve = resolve;
    });
    updateEventsRuntime({ host: eventHost, state: 'Connecting' });

    // Proxy preserves WebSocket's static constants and prototype while letting
    // us observe every ClientEventsWS socket, including reconnects initiated by
    // Events.js after the script has loaded.
    const eventsWebSocketProxy = new Proxy(NativeWebSocket, {
      construct(target, args, newTarget) {
        const socket = Reflect.construct(target, args, newTarget);
        if (isEventsSocketUrl(args[0])) {
          socketObserved = true;
          const socketUrl = String(args[0] || '');
          let socketHost = eventHost;
          try { socketHost = new URL(socketUrl, window.location.href).host || eventHost; } catch { /* keep script host */ }
          updateEventsRuntime({ host: socketHost, url: socketUrl });
          socket.addEventListener('message', (event) => {
            let messageType = '';
            let messageQueryId = '';
            try {
              const message = JSON.parse(String(event.data || ''));
              messageType = String(message?.type || message?.cmd || '');
              messageQueryId = String(message?.data?.queryId || message?.queryId || '');
            } catch {
              messageType = 'non-json';
            }
            updateEventsRuntime({
              lastMessageAt: new Date().toISOString(),
              messageCount: eventsRuntime.messageCount + 1,
              lastMessageType: messageType,
              lastMessageQueryId: messageQueryId,
            });
          });
          socket.addEventListener('open', () => {
            const reconnect = eventsRuntime.generation > 0;
            updateEventsRuntime({
              host: socketHost,
              url: socketUrl,
              state: 'Connected',
              openedAt: new Date().toISOString(),
              generation: eventsRuntime.generation + 1,
              reconnectCount: eventsRuntime.reconnectCount + (reconnect ? 1 : 0),
            });
            // Events.js installs its onopen handler after constructing the
            // socket. Resolve on the next turn so that handler sends Register.
            window.setTimeout(() => socketOpenedResolve(), 0);
          }, { once: true });
          socket.addEventListener('close', () => updateEventsRuntime({
            state: 'Disconnected',
            lastCloseAt: new Date().toISOString(),
            closeCount: eventsRuntime.closeCount + 1,
          }), { once: true });
          socket.addEventListener('error', () => updateEventsRuntime({ state: 'Error' }), { once: true });

          const nativeSend = socket.send.bind(socket);
          socket.send = (payload) => {
            try {
              const message = JSON.parse(String(payload));
              if (message?.cmd === 'Register') {
                updateEventsRuntime({
                  host: socketHost,
                  url: socketUrl,
                  registerCount: eventsRuntime.registerCount + 1,
                  registeredTabId: String(message.tabId || ''),
                  registeredAt: new Date().toISOString(),
                });
              }
            } catch {
              // Non-JSON WebSocket payloads are outside Reports diagnostics.
            }
            return nativeSend(payload);
          };
        }
        return socket;
      },
    });
    Object.defineProperty(eventsWebSocketProxy, '__reportsEventsProxy', { value: true });
    window.WebSocket = eventsWebSocketProxy;

    try {
      await loadScript(src);
    } catch (error) {
      // Do not leave a diagnostic proxy behind when the Events script itself
      // fails to load. Successful loads keep it installed to observe reconnects.
      if (window.WebSocket === eventsWebSocketProxy) window.WebSocket = NativeWebSocket;
      throw error;
    }

    if (socketObserved) {
      let timeoutId;
      await Promise.race([
        socketOpened,
        new Promise((_, reject) => {
          timeoutId = window.setTimeout(
            () => reject(new Error('Agent Events WebSocket did not open.')),
            EVENTS_SOCKET_TIMEOUT_MS,
          );
        }),
      ]).finally(() => {
        if (timeoutId) window.clearTimeout(timeoutId);
      });
      // Give the server a brief turn to process the Register command.
      await wait(50);
    }
  })();

  eventsReadyScripts.set(src, task);
  return task;
}

function newExecutionId() {
  if (typeof window !== 'undefined' && typeof window.crypto?.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function describeResponseShape(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `array(length=${value.length})`;
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return keys.length ? `object(keys=${keys.join(',')})` : 'empty object {}';
  }
  return typeof value;
}

function publishExecutionEvidence(evidence) {
  executionEvidenceListeners.forEach((listener) => listener(evidence));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('reports-execution-evidence', { detail: evidence }));
  }
}

function updateTracker(tracker, updater) {
  if (!tracker) return;
  tracker.evidence = updater(tracker.evidence);
  publishExecutionEvidence(tracker.evidence);
}

function updateEventsRuntime(patch) {
  eventsRuntime = { ...eventsRuntime, ...patch };
  if (activeExecutionTracker) {
    updateTracker(activeExecutionTracker, (evidence) => updateExecutionEvidence(evidence, {
      eventsHost: eventsRuntime.host || evidence.eventsHost,
      eventsUrl: eventsRuntime.url,
      eventsState: eventsRuntime.state,
      eventsOpenedAt: eventsRuntime.openedAt,
      eventsLastCloseAt: eventsRuntime.lastCloseAt,
      eventsLastMessageAt: eventsRuntime.lastMessageAt,
      eventsGeneration: eventsRuntime.generation,
      eventsReconnectCount: eventsRuntime.reconnectCount,
      eventsCloseCount: eventsRuntime.closeCount,
      eventsRegisterCount: eventsRuntime.registerCount,
      eventsMessagesAfterStart: Math.max(0, eventsRuntime.messageCount - evidence.eventsMessageCountAtStart),
      eventsLastMessageAfterStartAt: eventsRuntime.lastMessageAt && Date.parse(eventsRuntime.lastMessageAt) >= Date.parse(evidence.startedAt)
        ? eventsRuntime.lastMessageAt
        : evidence.eventsLastMessageAfterStartAt,
      eventsRegisteredTabId: eventsRuntime.registeredTabId,
      eventsRegisteredAt: eventsRuntime.registeredAt,
      eventsMessageCount: eventsRuntime.messageCount,
      eventsLastMessageType: eventsRuntime.lastMessageType,
      eventsLastMessageQueryId: eventsRuntime.lastMessageQueryId,
    }));
  }
}

function installExecutionInstrumentation() {
  const things = AgentAPI?.Things;
  const concentrator = things?.Concentrator;
  const progress = concentrator?.QueryProgress;
  const xmpp = AgentAPI?.Xmpp;
  const io = AgentAPI?.IO;
  if (!concentrator || !progress || !xmpp) return;

  if (typeof io?.Request === 'function' && !io.Request.__reportsEvidenceWrapped) {
    const original = io.Request;
    const wrapped = async function wrappedAgentRequest(resource, payload, ...args) {
      const tracker = resource === '/Agent/Xmpp/RegisterEventHandler' ? activeExecutionTracker : null;
      if (tracker) {
        updateTracker(tracker, (evidence) => updateExecutionEvidence(evidence, {
          registerEventHandlerLocalName: String(payload?.localName || ''),
          registerEventHandlerNamespace: String(payload?.namespace || ''),
          registerEventHandlerType: String(payload?.type || ''),
          registerEventHandlerFunction: String(payload?.function || ''),
          registerEventHandlerTabId: String(payload?.tabId || ''),
          handlerRegistrationMode: 'Called this execution',
        }));
      }
      try {
        const response = await original.call(this, resource, payload, ...args);
        if (tracker) {
          updateTracker(tracker, (evidence) => updateExecutionEvidence(evidence, {
            // AgentAPI.IO.Request resolves only when XMLHttpRequest.status is
            // exactly 200; every other status rejects with statusCode.
            registerEventHandlerHttpStatus: 200,
            registerEventHandlerResponseShape: describeResponseShape(response),
          }));
        }
        return response;
      } catch (error) {
        if (tracker) updateTracker(tracker, (evidence) => markExecutionFailure(evidence, 'RegisterEventHandler request failed.'));
        throw error;
      }
    };
    wrapped.__reportsEvidenceWrapped = true;
    io.Request = wrapped;
  }

  if (typeof xmpp.RegisterEventHandler === 'function' && !xmpp.RegisterEventHandler.__reportsEvidenceWrapped) {
    const original = xmpp.RegisterEventHandler;
    const wrapped = async function wrappedRegisterEventHandler(localName, ...args) {
      const tracker = localName === 'queryProgress' ? activeExecutionTracker : null;
      if (tracker) {
        const [namespace, type, functionName] = args;
        updateTracker(tracker, (evidence) => updateExecutionEvidence(evidence, {
          registerEventHandler: 'Pending',
          registerEventHandlerLocalName: String(localName || ''),
          registerEventHandlerNamespace: String(namespace || ''),
          registerEventHandlerType: String(type || ''),
          registerEventHandlerFunction: String(functionName || ''),
          registerEventHandlerTabId: typeof window !== 'undefined' ? String(window.TabID || '') : '',
          handlerRegistrationStartedAt: new Date().toISOString(),
          handlerRegistrationMode: 'Called this execution',
        }));
      }
      try {
        const response = await original.call(this, localName, ...args);
        if (tracker) {
          updateTracker(tracker, (evidence) => updateExecutionEvidence(evidence, {
            registerEventHandler: 'HTTP 200',
            handlerRegistrationCompletedAt: new Date().toISOString(),
          }));
        }
        return response;
      } catch (error) {
        if (tracker) updateTracker(tracker, (evidence) => markExecutionFailure(evidence, 'RegisterEventHandler failed.'));
        throw error;
      }
    };
    wrapped.__reportsEvidenceWrapped = true;
    xmpp.RegisterEventHandler = wrapped;
  }

  const helper = things.XmppHelper;
  if (typeof helper?.NodeCommandXReferenceQuery === 'function' && !helper.NodeCommandXReferenceQuery.__reportsEvidenceWrapped) {
    const original = helper.NodeCommandXReferenceQuery;
    const wrapped = async function wrappedNodeCommandQuery(command, ...args) {
      const tracker = command === 'executeNodeQuery' ? activeExecutionTracker : null;
      if (tracker) {
        const executeRequestStartedAt = new Date().toISOString();
        updateTracker(tracker, (evidence) => updateExecutionEvidence(evidence, {
          executeQueryRequest: 'Pending',
          executeRequestStartedAt,
          registrationCompletedBeforeExecuteRequest: evidence.handlerRegistrationMode === 'Called this execution'
            ? Boolean(evidence.handlerRegistrationCompletedAt
              && Date.parse(evidence.handlerRegistrationCompletedAt) <= Date.parse(executeRequestStartedAt))
            : null,
        }));
      }
      try {
        const response = await original.call(this, command, ...args);
        if (tracker) {
          updateTracker(tracker, (evidence) => updateExecutionEvidence(evidence, {
            executeQueryRequest: 'Success',
            executeRequestCompletedAt: new Date().toISOString(),
          }));
        }
        return response;
      } catch (error) {
        if (tracker) updateTracker(tracker, (evidence) => markExecutionFailure(evidence, 'Execute query request failed.'));
        throw error;
      }
    };
    wrapped.__reportsEvidenceWrapped = true;
    helper.NodeCommandXReferenceQuery = wrapped;
  }

  if (typeof concentrator.StartExecuteQuery === 'function' && !concentrator.StartExecuteQuery.__reportsEvidenceWrapped) {
    const original = concentrator.StartExecuteQuery;
    const wrapped = async function wrappedStartExecuteQuery(...args) {
      const tracker = activeExecutionTracker;
      const queryId = args[3];
      if (tracker && queryId !== undefined && queryId !== null) {
        queryTrackers.set(String(queryId), tracker);
        updateTracker(tracker, (evidence) => recordQueryCreated(evidence, queryId, Boolean(concentrator.QueryProgress.Queries?.[queryId])));
      }
      try {
        const operation = original.apply(this, args);
        if (tracker && queryId !== undefined && queryId !== null) {
          // StartExecuteQuery inserts the record before its first await. Capture
          // that registry state even if the subsequent request never returns.
          updateTracker(tracker, (evidence) => updateExecutionEvidence(evidence, {
            registryKey: String(queryId),
            registryPresent: Boolean(concentrator.QueryProgress.Queries?.[queryId]),
          }));
        }
        const response = await operation;
        if (tracker && queryId !== undefined && queryId !== null) {
          updateTracker(tracker, (evidence) => updateExecutionEvidence(evidence, {
            registryKey: String(queryId),
            registryPresent: Boolean(concentrator.QueryProgress.Queries?.[queryId]),
          }));
        }
        return response;
      } catch (error) {
        if (tracker) updateTracker(tracker, (evidence) => markExecutionFailure(evidence, 'StartExecuteQuery failed.'));
        throw error;
      }
    };
    wrapped.__reportsEvidenceWrapped = true;
    concentrator.StartExecuteQuery = wrapped;
  }

  if (typeof progress.OnQueryProgress === 'function' && !progress.OnQueryProgress.__reportsEvidenceWrapped) {
    const original = progress.OnQueryProgress;
    const wrapped = function wrappedQueryProgress(data) {
      const eventQueryId = data?.queryId === undefined || data?.queryId === null ? '' : String(data.queryId);
      const matchedTracker = eventQueryId ? queryTrackers.get(eventQueryId) : null;
      if (matchedTracker) updateTracker(matchedTracker, (evidence) => recordQueryProgress(evidence, data));
      if (activeExecutionTracker && activeExecutionTracker !== matchedTracker) {
        updateTracker(activeExecutionTracker, (evidence) => recordQueryProgress(evidence, data));
      }
      try {
        const response = original.call(this, data);
        if (matchedTracker && eventQueryId && (data?.queryDone !== undefined || data?.queryAborted !== undefined)) {
          updateTracker(matchedTracker, (evidence) => updateExecutionEvidence(evidence, {
            registryPresent: Boolean(progress.Queries?.[eventQueryId]),
          }));
        }
        return response;
      } catch (error) {
        const tracker = matchedTracker || activeExecutionTracker;
        if (tracker) {
          updateTracker(tracker, (evidence) => markExecutionFailure(evidence, 'queryProgress callback failed.'));
          const queryRecord = eventQueryId ? progress.Queries?.[eventQueryId] : null;
          if (typeof queryRecord?.reject === 'function') queryRecord.reject(error);
        }
        throw error;
      }
    };
    wrapped.__reportsEvidenceWrapped = true;
    progress.OnQueryProgress = wrapped;
  }
}

export function subscribeExecutionEvidence(listener) {
  executionEvidenceListeners.add(listener);
  return () => executionEvidenceListeners.delete(listener);
}

export function getExecutionEvidence(executionId) {
  return executionTrackers.get(String(executionId || ''))?.evidence || null;
}

export async function loadReportsLibraries(agentHomeHost) {
  const host = normalizeHost(agentHomeHost);
  if (!host) throw new Error('Agent home host is not available.');
  ensureAgentTabId();
  setNeuronMeta(host);

  // The published Things/Reports/Events extensions are classic scripts.
  // Expose the bundled AgentAPI object they extend without changing its
  // configured host, then load Events after the API extensions so its client
  // event dispatcher can resolve the registered QueryProgress callback.
  if (typeof window !== 'undefined') window.AgentAPI = AgentAPI;
  await loadScript(scriptUrl(host, '/Agent.Things.js'));
  await loadScript(scriptUrl(host, '/Agent.Reports.js'));
  await loadEventsScript(scriptUrl(host, '/Events.js'));
  installExecutionInstrumentation();
  if (typeof window !== 'undefined' && typeof window.EventCheckingEnabled !== 'boolean') {
    throw new Error('Agent Events.js did not initialize.');
  }
  if (!AgentAPI?.Reports?.GetReports) {
    throw new Error('Agent.Reports.js did not expose AgentAPI.Reports.');
  }
  return AgentAPI;
}

function requireReportsApi() {
  if (!AgentAPI?.Reports) throw new Error('Agent Reports API is not loaded.');
  return AgentAPI.Reports;
}

function requireThingsApi() {
  if (!AgentAPI?.Things?.XmppHelper?.GetFullJid || !AgentAPI?.Things?.Concentrator?.GetAllDataSources) {
    throw new Error('Agent.Things.js did not expose the required Reports inspection APIs.');
  }
  return AgentAPI.Things;
}

export function hasAgentToken() {
  return Boolean(typeof window !== 'undefined' && sessionStorage.getItem('AgentAPI.Token'));
}

export function getAgentBareJid(agentHomeHost) {
  const userName = AgentAPI?.Account?.GetSessionString?.('AgentAPI.UserName') || '';
  return deriveAgentBareJid(userName, agentHomeHost);
}

export async function inspectReportsTarget(agentHomeHost, configuredReportsJid, language = 'en') {
  let resolvedReportsJid = '';
  let resolutionStatus = 'unresolved';
  try {
    await loadReportsLibraries(agentHomeHost);
    const things = requireThingsApi();
    let resolution;
    try {
      resolution = await resolveFullJid(things.XmppHelper, configuredReportsJid);
    } catch (error) {
      throw Object.assign(error, { reportsPhase: 'jid-resolution' });
    }
    resolvedReportsJid = resolution.full ? resolution.jid : '';
    resolutionStatus = resolution.full ? 'full' : 'unresolved';
    const reportsRequestJid = resolution.full ? resolution.jid : configuredReportsJid;
    const rawDataSources = await things.Concentrator.GetAllDataSources(reportsRequestJid, language);
    const dataSources = normalizeDataSources(rawDataSources);
    return {
      configuredReportsJid,
      resolvedReportsJid,
      reportsRequestJid,
      resolutionStatus,
      dataSources,
      reportsSourceVisible: hasReportsSource(dataSources),
      agentBareJid: getAgentBareJid(agentHomeHost),
    };
  } catch (error) {
    if (error?.reportsPhase === 'jid-resolution') {
      const lower = String(error?.message || '').toLowerCase();
      const isPresenceEvidence = lower.includes('presence') || lower.includes('probe') || lower.includes('roster') || lower.includes('subscription');
      throw normalizeReportsError(error, {
        kind: isPresenceEvidence ? 'presence' : 'client-error',
        details: { configuredReportsJid, resolvedReportsJid: resolvedReportsJid || 'Not resolved', resolutionStatus },
      });
    }
    const normalized = normalizeReportsError(error);
    throw normalized.kind === 'unknown'
      ? normalizeReportsError(error, { kind: 'source-probe-failed', details: { configuredReportsJid, resolvedReportsJid: resolvedReportsJid || 'Not resolved' } })
      : normalized;
  }
}

export async function getReports(agentHomeHost, reportsJid, language = 'en', sourceVisible = false) {
  try {
    await loadReportsLibraries(agentHomeHost);
    return await requireReportsApi().GetReports(reportsJid, language);
  } catch (error) {
    throw normalizeReportsError(error, sourceVisible ? { kind: 'source-lookup-failed' } : {});
  }
}

export async function getReportParameters(agentHomeHost, reportsJid, reportId, language = 'en') {
  try {
    await loadReportsLibraries(agentHomeHost);
    return await requireReportsApi().GetReportParameters(reportsJid, language, reportId);
  } catch (error) {
    throw normalizeReportsError(error);
  }
}

export async function executeReport(agentHomeHost, reportsJid, reportId, parameters, language = 'en') {
  const tracker = {
    evidence: updateExecutionEvidence(createExecutionEvidence({
      executionId: newExecutionId(),
      report: reportId,
      agentHost: agentHomeHost,
      reportsJid,
      tabId: typeof window !== 'undefined' ? window.TabID || window.name : '',
    }), {
      eventsHost: eventsRuntime.host || agentHomeHost,
      eventsUrl: eventsRuntime.url,
      eventsState: eventsRuntime.state,
      eventsOpenedAt: eventsRuntime.openedAt,
      eventsLastCloseAt: eventsRuntime.lastCloseAt,
      eventsLastMessageAt: eventsRuntime.lastMessageAt,
      eventsGeneration: eventsRuntime.generation,
      eventsReconnectCount: eventsRuntime.reconnectCount,
      eventsCloseCount: eventsRuntime.closeCount,
      eventsRegisterCount: eventsRuntime.registerCount,
      eventsMessageCountAtStart: eventsRuntime.messageCount,
      eventsMessagesAfterStart: 0,
      eventsLastMessageAfterStartAt: '',
      eventsRegisteredTabId: eventsRuntime.registeredTabId,
      eventsRegisteredAt: eventsRuntime.registeredAt,
      eventsMessageCount: eventsRuntime.messageCount,
      eventsLastMessageType: eventsRuntime.lastMessageType,
      eventsLastMessageQueryId: eventsRuntime.lastMessageQueryId,
    }),
  };
  executionTrackers.set(tracker.evidence.executionId, tracker);
  activeExecutionTracker = tracker;
  publishExecutionEvidence(tracker.evidence);

  try {
    await loadReportsLibraries(agentHomeHost);
    const handlerWasCachedBeforeExecution = Boolean(AgentAPI?.Things?.Concentrator?.QueryProgress?.EventHandlersRegistered);
    updateTracker(tracker, (evidence) => updateExecutionEvidence(evidence, {
      handlerWasCachedBeforeExecution,
      handlerRegistrationMode: handlerWasCachedBeforeExecution ? 'Reused existing registration' : 'Called this execution',
    }));
    const execution = requireReportsApi().ExecuteReport(reportsJid, language, reportId, parameters);
    const result = await execution;
    const queryFailed = tracker.evidence.lastEventState === 'queryAborted'
      || result?.HasErrors === true
      || result?.Ok === false;
    if (queryFailed) {
      updateTracker(tracker, (evidence) => markExecutionFailure(evidence, 'The report query was aborted or returned errors.'));
    } else {
      updateTracker(tracker, (evidence) => markExecutionResult(evidence));
    }
    return result;
  } catch (error) {
    const normalized = normalizeReportsError(error);
    updateTracker(tracker, (evidence) => markExecutionFailure(evidence, normalized.message));
    throw normalized;
  } finally {
    if (activeExecutionTracker === tracker) activeExecutionTracker = null;
  }
}
