export function createNeuronSwitchAttemptId() {
  return crypto.randomUUID().toLowerCase();
}

export function getNeuronSwitchTabId() {
  if (typeof window === 'undefined') return '';

  if (typeof window.name === 'string' && isGuidLike(window.name)) {
    return window.name;
  }

  window.name = createNeuronSwitchAttemptId();
  return window.name;
}

export function getCurrentNeuronHost() {
  if (typeof window === 'undefined') return '';

  const storedHost = sessionStorage.getItem('AgentAPI.Host');
  if (storedHost) return storedHost;

  const metaHost = document.querySelector('meta[name="NEURON"]')?.getAttribute('content');
  return metaHost || '';
}

export function getNeuronSwitchClientSnapshot() {
  if (typeof window === 'undefined') {
    return {
      activeHost: '',
      sourceJwt: '',
    };
  }

  return {
    activeHost: getCurrentNeuronHost(),
    sourceJwt: sessionStorage.getItem('AgentAPI.Token') || '',
  };
}

export function formatNeuronSwitchClientLog(attemptId, message, details) {
  const prefix = `[NeuronSwitchDebug] [switchAttemptId=${attemptId}]`;
  return details ? `${prefix} ${message} ${JSON.stringify(details)}` : `${prefix} ${message}`;
}

export function summarizeJwtClient(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(base64UrlDecodeInBrowser(parts[1]));
    return {
      claims: {
        iss: payload.iss || null,
        aud: payload.aud || null,
        sub: payload.sub || null,
        userName: payload.userName || payload.name || null,
        exp: payload.exp || null,
        expIso: toIso(payload.exp),
        iat: payload.iat || null,
        iatIso: toIso(payload.iat),
      },
    };
  } catch {
    return null;
  }
}

function base64UrlDecodeInBrowser(value) {
  const normalized = String(value).replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = window.atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function toIso(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return new Date(numeric * 1000).toISOString();
}

function isGuidLike(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value));
}
