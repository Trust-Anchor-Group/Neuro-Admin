export const NEURON_SWITCH_ENDPOINTS = {
  quickLoginSessionStart: {
    key: 'quickLoginSessionStart',
    path: '/QuickLogin',
    label: 'QuickLogin session start',
    alternatives: ['/Agent/Account/QuickLogin'],
    evidence: [
      'src/app/api/auth/quickLogin/session/route.js calls https://<host>/QuickLogin',
      'This is the active QR/session bootstrap path in Neuro Admin today.',
    ],
  },
  quickLoginToken: {
    key: 'quickLoginToken',
    path: '/Agent/Account/QuickLogin',
    label: 'QuickLogin JWT conversion',
    alternatives: ['/Account/QuickLogin'],
    evidence: [
      'src/app/api/auth/quickLogin/token/route.js calls https://<host>/Agent/Account/QuickLogin',
      'node_modules/agent-api/Root/Agent.js QuickLogin() uses /Agent/Account/QuickLogin',
    ],
  },
  prepareRemoteQuickLogin: {
    key: 'prepareRemoteQuickLogin',
    path: '/Agent/Account/PrepareRemoteQuickLogin',
    label: 'Prepare remote quick login',
    alternatives: ['/Account/PrepareRemoteQuickLogin'],
    evidence: [
      'node_modules/agent-api/Root/Agent.js PrepareRemoteQuickLogin() uses /Agent/Account/PrepareRemoteQuickLogin',
      'No active project code proves a plain /Account/PrepareRemoteQuickLogin path.',
    ],
  },
  remoteQuickLogin: {
    key: 'remoteQuickLogin',
    path: '/Agent/Account/RemoteQuickLogin',
    label: 'Remote quick login',
    alternatives: ['/Account/RemoteQuickLogin'],
    evidence: [
      'node_modules/agent-api/Root/Agent.js RemoteQuickLogin() uses https://<domain>/Agent/Account/RemoteQuickLogin',
      'The project contains empty remote route placeholders but no live implementation using plain /Account/RemoteQuickLogin.',
    ],
  },
  remoteReferences: {
    key: 'remoteReferences',
    path: '/Agent/Account/RemoteReferences',
    label: 'Remote references',
    alternatives: ['/Account/RemoteReferences'],
    evidence: [
      'node_modules/agent-api/Root/Agent.js RemoteReferences() uses /Agent/Account/RemoteReferences',
    ],
  },
  accountInfo: {
    key: 'accountInfo',
    path: '/Agent/Account/Info',
    label: 'Account info',
    alternatives: ['/Account/Info'],
    evidence: [
      'node_modules/agent-api/Root/Agent.js Info() uses /Agent/Account/Info',
      'This is a harmless authenticated Agent Account endpoint suitable for proving a session cookie authenticates against the selected target Neuron.',
    ],
  },
};

export function getNeuronSwitchEndpointDefinition(key) {
  return NEURON_SWITCH_ENDPOINTS[key] || null;
}

export function buildNeuronSwitchUrl(host, key) {
  const definition = getNeuronSwitchEndpointDefinition(key);
  if (!definition) {
    throw new Error(`Unknown Neuron switch endpoint key: ${key}`);
  }

  return `https://${host}${definition.path}`;
}

export function getNeuronSwitchEndpointDiagnostics() {
  return Object.values(NEURON_SWITCH_ENDPOINTS).map((definition) => ({
    key: definition.key,
    label: definition.label,
    path: definition.path,
    alternatives: definition.alternatives,
    evidence: definition.evidence,
  }));
}
