function safeDetails(error) {
  const details = {};
  for (const key of ['statusCode', 'statusMessage', 'type', 'condition', 'text']) {
    const value = error?.[key];
    if (typeof value === 'string' || typeof value === 'number') details[key] = value;
  }
  if (Array.isArray(error?.alternatives)) details.alternatives = error.alternatives.map((value) => String(value)).slice(0, 10);
  return details;
}

export function normalizeReportsError(error, context = {}) {
  const statusCode = typeof error?.statusCode === 'number' ? error.statusCode : undefined;
  const technical = error instanceof Error ? error.message : String(error?.message || error || 'Unknown error');
  const lower = technical.toLowerCase();
  let kind = context.kind || 'unknown';

  if (!context.kind && (statusCode === 401 || lower.includes('unauthor') || lower.includes('authentication'))) kind = 'authentication';
  else if (!context.kind && (statusCode === 403 || lower.includes('forbidden') || lower.includes('privilege'))) kind = 'privileges';
  else if (!context.kind && lower.includes('presence')) kind = 'presence';
  else if (!context.kind && (lower.includes('event') || lower.includes('websocket'))) kind = 'events';
  else if (!context.kind && lower.includes('timeout')) kind = 'timeout';
  else if (!context.kind && (lower.includes('network') || lower.includes('fetch'))) kind = 'connection';

  const messages = {
    authentication: 'AGENT NOT AUTHENTICATED: the Agent home session is missing or rejected.',
    privileges: 'REPORT ACCESS DENIED: the Agent account is not authorized for this report operation.',
    presence: 'PRESENCE REQUIRED: the Agent account needs approved presence with the Reports target.',
    events: 'CONNECTION ERROR: the Agent Events/WebSocket path is unavailable.',
    timeout: 'CONNECTION ERROR: the report did not complete before the timeout.',
    connection: 'CONNECTION ERROR: the Agent home or Reports target could not be reached.',
    'source-not-visible': 'REPORTS SOURCE NOT VISIBLE: the target is reachable, but the Reports source is not available to this Agent account.',
    'source-lookup-failed': 'REPORTS SOURCE LOOKUP FAILED: the Reports source was visible, but GetReports could not resolve it.',
    'source-probe-failed': 'REPORTS SOURCE CHECK FAILED: the target could not be inspected before discovery.',
    'client-error': 'CLIENT ERROR: the Agent API helper failed before the Reports request was sent.',
    unknown: 'UNKNOWN ERROR: the Reports request failed.',
  };

  return {
    kind,
    message: context.message || messages[kind] || messages.unknown,
    technical,
    statusCode,
    details: { ...safeDetails(error), ...(context.details || {}) },
  };
}
