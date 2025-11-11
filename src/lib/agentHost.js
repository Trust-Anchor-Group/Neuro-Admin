// Runtime agent host resolution.
// Falls back to build-time env if no override cookie.

export function validateHost(host) {
  return typeof host === 'string' && /^[a-zA-Z0-9.-]+$/.test(host) && !host.includes('..');
}

export function resolveAgentHost(headersLike) {
  try {
    const cookieHeader = typeof headersLike?.get === 'function' ? headersLike.get('cookie') : headersLike?.cookie || '';
    if (cookieHeader) {
      const m = cookieHeader.match(/(?:^|; )agent-host=([^;]+)/);
      if (m) {
        const h = decodeURIComponent(m[1]);
        if (validateHost(h)) return h;
      }
    }
    return process.env.NEXT_PUBLIC_AGENT_HOST;
  } catch {
    return process.env.NEXT_PUBLIC_AGENT_HOST;
  }
}
