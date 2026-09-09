// Runtime agent host resolution.
// Request-provided hosts are accepted only when deployment configuration allows them.

const HOST_PATTERN = /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

function normalizeHost(host) {
  return typeof host === 'string' ? host.trim().toLowerCase() : '';
}

export function validateHost(host) {
  const normalizedHost = normalizeHost(host);
  return HOST_PATTERN.test(normalizedHost);
}

export function getAllowedAgentHosts() {
  const configuredHosts = [
    process.env.AGENT_HOST,
    process.env.NEXT_PUBLIC_AGENT_HOST,
    process.env.NEURON_SWITCH_ALLOWED_HOSTS,
    process.env.NEXT_PUBLIC_NEURON_SWITCH_ALLOWED_HOSTS,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map((value) => normalizeHost(value))
    .filter((value) => validateHost(value));

  return [...new Set(configuredHosts)];
}

export function isAllowedAgentHost(host) {
  const normalizedHost = normalizeHost(host);
  return validateHost(normalizedHost) && getAllowedAgentHosts().includes(normalizedHost);
}

export function resolveAgentHost(headersLike) {
  try {
    const headerHost = typeof headersLike?.get === 'function' ? headersLike.get('x-agent-host') : headersLike?.['x-agent-host'];
    if (headerHost) {
      const h = normalizeHost(decodeURIComponent(headerHost));
      if (isAllowedAgentHost(h)) return h;
    }

    const cookieHeader = typeof headersLike?.get === 'function' ? headersLike.get('cookie') : headersLike?.cookie || '';
    if (cookieHeader) {
      const activeHostMatch = cookieHeader.match(/(?:^|;\s*)neuro-admin-active-neuron-host=([^;]+)/);
      if (activeHostMatch) {
        const h = normalizeHost(decodeURIComponent(activeHostMatch[1]));
        if (isAllowedAgentHost(h) || isPersistedSessionHost(cookieHeader, h)) return h;
      }

      const m = cookieHeader.match(/(?:^|; )agent-host=([^;]+)/);
      if (m) {
        const h = normalizeHost(decodeURIComponent(m[1]));
        if (isAllowedAgentHost(h)) return h;
      }
    }
    const fallbackHost = normalizeHost(process.env.AGENT_HOST);
    return isAllowedAgentHost(fallbackHost) ? fallbackHost : undefined;
  } catch {
    const fallbackHost = normalizeHost(process.env.AGENT_HOST);
    return isAllowedAgentHost(fallbackHost) ? fallbackHost : undefined;
  }
}

function isPersistedSessionHost(cookieHeader, host) {
  const match = cookieHeader.match(/(?:^|;\s*)neuro-admin-neuron-session-hosts=([^;]+)/);
  if (!match) return false;

  try {
    const hosts = JSON.parse(decodeURIComponent(match[1]));
    return Array.isArray(hosts) && hosts.map(normalizeHost).includes(host);
  } catch {
    return false;
  }
}
