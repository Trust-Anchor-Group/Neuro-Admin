const QUERY_EVENT_KEYS = [
  'queryStarted',
  'title',
  'beginSection',
  'endSection',
  'status',
  'newObject',
  'newTable',
  'newRecords',
  'tableDone',
  'queryMessage',
  'queryDone',
  'queryAborted',
];

function now() {
  return new Date().toISOString();
}

function asQueryId(value) {
  return value === null || value === undefined || value === '' ? '' : String(value);
}

export function createExecutionEvidence({ executionId, report, agentHost, reportsJid, tabId }) {
  const startedAt = now();
  return {
    executionId: String(executionId || ''),
    report: String(report || ''),
    agentHost: String(agentHost || ''),
    reportsJid: String(reportsJid || ''),
    tabId: String(tabId || ''),
    registerEventHandlerTabId: '',
    registerEventHandlerHttpStatus: null,
    registerEventHandlerResponseShape: '',
    registerEventHandlerLocalName: '',
    registerEventHandlerNamespace: '',
    registerEventHandlerType: '',
    registerEventHandlerFunction: '',
    handlerRegistrationStartedAt: '',
    handlerRegistrationCompletedAt: '',
    handlerRegistrationMode: 'Unknown',
    handlerWasCachedBeforeExecution: null,
    registrationCompletedBeforeExecuteRequest: null,
    eventsHost: String(agentHost || ''),
    eventsUrl: '',
    eventsState: 'Not loaded',
    eventsOpenedAt: '',
    eventsLastCloseAt: '',
    eventsLastMessageAt: '',
    eventsGeneration: 0,
    eventsReconnectCount: 0,
    eventsCloseCount: 0,
    eventsRegisterCount: 0,
    eventsMessageCountAtStart: 0,
    eventsMessagesAfterStart: 0,
    eventsLastMessageAfterStartAt: '',
    eventsRegisteredTabId: '',
    eventsRegisteredAt: '',
    eventsMessageCount: 0,
    eventsLastMessageType: '',
    eventsLastMessageQueryId: '',
    queryId: '',
    requestQueryId: '',
    registryKey: '',
    registryPresent: false,
    startedAt,
    registerEventHandler: 'Not started',
    executeQueryRequest: 'Not started',
    executeRequestStartedAt: '',
    executeRequestCompletedAt: '',
    lastQueryProgressAt: '',
    progressEventCount: 0,
    lastEventState: '',
    terminalEventReceived: false,
    resultReceived: false,
    currentUiState: 'Running',
    error: '',
    staleEventCount: 0,
    lastStaleQueryId: '',
  };
}

export function updateExecutionEvidence(evidence, patch) {
  return { ...evidence, ...patch };
}

export function recordQueryCreated(evidence, queryId, registryPresent = true) {
  const normalized = asQueryId(queryId);
  return updateExecutionEvidence(evidence, {
    queryId: normalized,
    requestQueryId: normalized,
    registryKey: normalized,
    registryPresent,
  });
}

export function recordQueryProgress(evidence, data) {
  const eventQueryId = asQueryId(data?.queryId);
  if (evidence.queryId && eventQueryId && evidence.queryId !== eventQueryId) {
    return updateExecutionEvidence(evidence, {
      staleEventCount: evidence.staleEventCount + 1,
      lastStaleQueryId: eventQueryId,
    });
  }

  const state = QUERY_EVENT_KEYS.find((key) => data?.[key] !== undefined) || 'unknown';
  const terminal = state === 'queryDone' || state === 'queryAborted';
  return updateExecutionEvidence(evidence, {
    lastQueryProgressAt: now(),
    progressEventCount: evidence.progressEventCount + 1,
    lastEventState: state,
    terminalEventReceived: evidence.terminalEventReceived || terminal,
  });
}

export function markExecutionUiState(evidence, state, error = '') {
  return updateExecutionEvidence(evidence, {
    currentUiState: state,
    error: error ? String(error) : evidence.error,
  });
}

export function markExecutionResult(evidence) {
  return updateExecutionEvidence(evidence, {
    resultReceived: true,
    currentUiState: 'Completed',
  });
}

export function markExecutionFailure(evidence, error) {
  return markExecutionUiState(evidence, 'Failed', error);
}
