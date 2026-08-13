import 'server-only';

import config from '@/config/config';
import { resolveAgentHost, validateHost } from '@/lib/agentHost';

const SESSION_COOKIE_NAME = 'HttpSessionID';

export async function fetchParkletAdminJson(request, {
  path,
  method = 'GET',
  payload,
}) {
  const context = getParkletRequestContext(request);
  assertParkletContext(context);

  const response = await fetch(`https://${context.host}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      Cookie: buildParkletSessionCookie(context.sessionCookieValue),
      ...(payload === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
    cache: 'no-store',
  });

  return {
    response,
    body: await readParkletResponseBody(response),
  };
}

export async function callFixedParkletScript(request, { path, payload }) {
  const context = getParkletRequestContext(request);

  if (!context.host) {
    return {
      ok: false,
      httpStatus: 503,
      body: { ok: false, error: 'Ingen Neuron är konfigurerad.' },
      errorBody: 'Ingen Neuron är konfigurerad.',
    };
  }

  if (!context.sessionCookieValue) {
    return {
      ok: false,
      httpStatus: 401,
      body: { ok: false, error: 'Administratörssessionen saknas eller har gått ut.' },
      errorBody: 'Administratörssessionen saknas eller har gått ut.',
    };
  }

  try {
    const result = await fetchParkletAdminJson(request, {
      path,
      method: 'POST',
      payload,
    });

    return {
      ok: result.response.ok,
      httpStatus: result.response.status,
      body: result.body,
      errorBody: result.response.ok ? null : safeTransportMessage(result.body),
    };
  } catch (error) {
    return {
      ok: false,
      httpStatus: error?.statusCode || 502,
      body: null,
      errorBody: error?.statusCode === 401
        ? 'Administratörssessionen saknas eller har gått ut.'
        : 'Neuron-anropet kunde inte bekräftas.',
    };
  }
}

function getParkletRequestContext(request) {
  const resolvedHost = resolveAgentHost(request.headers) || config.api.agent.host || '';
  const host = typeof resolvedHost === 'string' ? resolvedHost.trim().toLowerCase() : '';
  const sessionCookieValue = request.cookies?.get(SESSION_COOKIE_NAME)?.value ||
    readCookieValue(request.headers.get('cookie') || '', SESSION_COOKIE_NAME);

  return {
    host: validateHost(host) ? host : '',
    sessionCookieValue: sessionCookieValue || '',
  };
}

function assertParkletContext(context) {
  if (!context.host) {
    const error = new Error('No configured Neuron host.');
    error.statusCode = 503;
    throw error;
  }
  if (!context.sessionCookieValue) {
    const error = new Error('Missing administrator session.');
    error.statusCode = 401;
    throw error;
  }
}

function buildParkletSessionCookie(sessionCookieValue) {
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionCookieValue)}`;
}

async function readParkletResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json')
    ? response.json().catch(() => null)
    : response.text().catch(() => '');
}

function readCookieValue(cookieHeader, name) {
  const prefix = `${name}=`;
  for (const segment of cookieHeader.split(';')) {
    const normalized = segment.trim();
    if (!normalized.startsWith(prefix)) continue;
    try {
      return decodeURIComponent(normalized.slice(prefix.length));
    } catch {
      return '';
    }
  }
  return '';
}

function safeTransportMessage(body) {
  const candidate = body && typeof body === 'object' && !Array.isArray(body)
    ? body.error || body.message || body.Message
    : body;
  return typeof candidate === 'string'
    ? candidate.trim().replace(/[\r\n\t]+/g, ' ').slice(0, 300)
    : '';
}
