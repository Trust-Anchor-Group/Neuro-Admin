import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createExecutionEvidence,
  markExecutionFailure,
  markExecutionResult,
  markExecutionUiState,
  recordQueryCreated,
  recordQueryProgress,
  updateExecutionEvidence,
} from '../src/lib/reports/executionEvidence.js';

function execution(id, report = 'CPU') {
  return createExecutionEvidence({
    executionId: id,
    report,
    agentHost: 'lab.tagroot.io',
    reportsJid: 'lab.tagroot.io@tagroot.io',
    tabId: 'tab-test',
  });
}

test('execution evidence follows Running through progress and Completed after terminal result', () => {
  let evidence = execution('run-1');
  assert.equal(evidence.currentUiState, 'Running');
  evidence = recordQueryCreated(evidence, 'query-1');
  evidence = updateExecutionEvidence(evidence, { registerEventHandler: 'Success', executeQueryRequest: 'Success' });
  evidence = recordQueryProgress(evidence, { queryId: 'query-1', queryStarted: true });
  assert.equal(evidence.currentUiState, 'Running');
  assert.equal(evidence.progressEventCount, 1);
  assert.equal(evidence.terminalEventReceived, false);
  evidence = recordQueryProgress(evidence, { queryId: 'query-1', queryDone: true });
  evidence = markExecutionResult(evidence);
  assert.equal(evidence.lastEventState, 'queryDone');
  assert.equal(evidence.terminalEventReceived, true);
  assert.equal(evidence.resultReceived, true);
  assert.equal(evidence.currentUiState, 'Completed');
});

test('registration, request, and callback failures transition execution to Failed', () => {
  let evidence = execution('run-failed');
  evidence = updateExecutionEvidence(evidence, { registerEventHandler: 'Pending' });
  evidence = markExecutionFailure(evidence, 'RegisterEventHandler failed.');
  assert.equal(evidence.currentUiState, 'Failed');
  assert.equal(evidence.error, 'RegisterEventHandler failed.');
  evidence = markExecutionUiState(evidence, 'Running');
  evidence = markExecutionFailure(evidence, 'Execute query request failed.');
  assert.equal(evidence.currentUiState, 'Failed');
});

test('execution evidence exposes unambiguous registration and execute timing fields', () => {
  const evidence = execution('run-timing');
  assert.equal(evidence.registerEventHandlerHttpStatus, null);
  assert.equal(evidence.registerEventHandlerResponseShape, '');
  assert.equal(evidence.handlerRegistrationStartedAt, '');
  assert.equal(evidence.handlerRegistrationCompletedAt, '');
  assert.equal(evidence.executeRequestStartedAt, '');
  assert.equal(evidence.executeRequestCompletedAt, '');
  assert.equal(evidence.handlerWasCachedBeforeExecution, null);
  assert.equal(evidence.registrationCompletedBeforeExecuteRequest, null);
});

test('a terminal queryAborted event is not reported as a successful completion', () => {
  let evidence = recordQueryCreated(execution('run-aborted'), 'query-aborted');
  evidence = recordQueryProgress(evidence, { queryId: 'query-aborted', queryAborted: true });
  assert.equal(evidence.terminalEventReceived, true);
  assert.equal(evidence.lastEventState, 'queryAborted');
  evidence = markExecutionFailure(evidence, 'The report query was aborted or returned errors.');
  assert.equal(evidence.currentUiState, 'Failed');
  assert.equal(evidence.resultReceived, false);
});

test('a stale terminal event from a previous query cannot complete the current execution', () => {
  let evidence = execution('run-2');
  evidence = recordQueryCreated(evidence, 'query-current');
  evidence = recordQueryProgress(evidence, { queryId: 'query-previous', queryDone: true });
  assert.equal(evidence.currentUiState, 'Running');
  assert.equal(evidence.terminalEventReceived, false);
  assert.equal(evidence.staleEventCount, 1);
  assert.equal(evidence.lastStaleQueryId, 'query-previous');
});

test('a second execution has independent query and completion state', () => {
  let first = recordQueryCreated(execution('run-first'), 'query-first');
  first = markExecutionResult(recordQueryProgress(first, { queryId: 'query-first', queryDone: true }));
  let second = recordQueryCreated(execution('run-second'), 'query-second');
  second = recordQueryProgress(second, { queryId: 'query-first', queryDone: true });
  assert.equal(first.currentUiState, 'Completed');
  assert.equal(second.currentUiState, 'Running');
  assert.equal(second.queryId, 'query-second');
  assert.equal(second.staleEventCount, 1);
});
