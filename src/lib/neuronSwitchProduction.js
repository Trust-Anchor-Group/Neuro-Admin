import 'server-only';

import setCookie from 'set-cookie-parser';
import { randomUUID } from 'crypto';
import { getResponseKeys, sanitizeErrorBody } from '@/lib/neuronSwitchDebug';
import {
  buildUpstreamCookieHeader,
  getActiveNeuronContext,
  getConfiguredNeuronHosts,
  getCurrentNeuronSummary,
  getNeuronSessionCookieValue,
  getStoredNeuronSessionHosts,
  isNeuronHostAllowed,
  normalizeNeuronHost,
} from '@/lib/neuronSessionContext';

export const NEURON_SWITCH_PRODUCTION_STATUSES = {
  WAITING_FOR_APPROVAL: 'WAITING_FOR_APPROVAL',
  TARGET_SESSION_AVAILABLE: 'TARGET_SESSION_AVAILABLE',
  END_TO_END_SWITCH_WORKS_WITH_SCRIPT_SESSION: 'END_TO_END_SWITCH_WORKS_WITH_SCRIPT_SESSION',
  TARGET_SESSION_COOKIE_MISSING: 'TARGET_SESSION_COOKIE_MISSING',
  TARGET_SESSION_TEST_USED_WRONG_HOST: 'TARGET_SESSION_TEST_USED_WRONG_HOST',
  TARGET_SESSION_TEST_USED_SOURCE_COOKIE: 'TARGET_SESSION_TEST_USED_SOURCE_COOKIE',
};

export const SWITCH_LEGAL_ID_COOKIE_PREFIX = 'neuro-admin-neuron-switch-legal-id-';
export const SWITCH_TARGET_HOST_COOKIE_PREFIX = 'neuro-admin-neuron-switch-target-host-';
export const SWITCH_ATTEMPT_TTL_SECONDS = 60 * 15;
export const DEFAULT_SWITCH_PURPOSE = 'Neuro Admin remote login test';
export const DEFAULT_TARGET_SCRIPT_PATH = '/Accounts.ws';

export function createSwitchAttemptId() {
  return randomUUID().toLowerCase();
}

export function getSwitchLegalIdCookieName(attemptId) {
  return `${SWITCH_LEGAL_ID_COOKIE_PREFIX}${sanitizeAttemptId(attemptId)}`;
}

export function getSwitchTargetHostCookieName(attemptId) {
  return `${SWITCH_TARGET_HOST_COOKIE_PREFIX}${sanitizeAttemptId(attemptId)}`;
}

export async function getNeuronReferences(request) {
  const activeContext = await getActiveNeuronContext(request);
  const currentSummary = await getCurrentNeuronSummary(request);
  const sourceHost = currentSummary.sourceHost || activeContext.host;
  const sourceSessionCookieValue = currentSummary.sourceHost
    ? await getNeuronSessionCookieValue(currentSummary.sourceHost)
    : activeContext.sessionCookieValue;
  const storedSessionHosts = await getStoredNeuronSessionHosts();
  const configuredHosts = getConfiguredNeuronHosts();

  let remoteHosts = [];
  let remoteReferencesDebug = {
    called: false,
    sourceHost,
    hasSourceSession: Boolean(sourceSessionCookieValue),
    status: null,
    ok: false,
    responseBody: null,
    responseKeys: [],
    parsedHosts: [],
    attempts: [],
  };

  if (sourceSessionCookieValue) {
    remoteReferencesDebug.called = true;
    const responseInfo = await callAgentJson({
      host: sourceHost,
      path: '/Agent/Account/RemoteReferences',
      payload: {},
      sessionCookieValue: sourceSessionCookieValue,
    });

    remoteReferencesDebug.attempts.push({
      path: '/Agent/Account/RemoteReferences',
      status: responseInfo.httpStatus,
      ok: responseInfo.ok,
      responseKeys: responseInfo.responseKeys,
      responseBody: responseInfo.body,
    });

    remoteReferencesDebug = {
      ...remoteReferencesDebug,
      status: responseInfo.httpStatus,
      ok: responseInfo.ok,
      responseBody: responseInfo.body,
      responseKeys: responseInfo.responseKeys,
    };

    if (responseInfo.ok) {
      remoteHosts = normalizeRemoteReferences(responseInfo.body);
      remoteReferencesDebug.parsedHosts = remoteHosts;
    }
  }

  const allowedHosts = [...new Set([
    activeContext.host,
    ...configuredHosts,
    ...remoteHosts,
    ...storedSessionHosts,
  ].filter(Boolean))];
  const refreshedSummary = await getCurrentNeuronSummary(request, { allowedHosts });
  const fallbackReason = !remoteHosts.length && remoteReferencesDebug.called && !remoteReferencesDebug.ok
    ? 'REMOTE_REFERENCES_FAILED_USING_FALLBACK_HOSTS'
    : null;

  return {
    activeHost: refreshedSummary.activeHost,
    defaultHost: refreshedSummary.defaultHost,
    references: allowedHosts.map((host) => ({
      host,
      label: host,
      description: host === refreshedSummary.defaultHost ? 'Default configured Neuron' : 'Remote Neuron',
      isActive: host === refreshedSummary.activeHost,
      hasStoredSession: storedSessionHosts.includes(host),
    })),
    sourceHost: refreshedSummary.sourceHost,
    hasSourceSession: refreshedSummary.hasSourceSession,
    canStartRemoteLogin: refreshedSummary.canStartRemoteLogin,
    debug: remoteReferencesDebug,
    fallbackReason,
  };
}

export async function callAgentJson({ host, path, payload, bearerToken, sessionCookieValue }) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    ...(sessionCookieValue ? { Cookie: buildUpstreamCookieHeader(sessionCookieValue) } : {}),
  };

  try {
    const response = await fetch(`https://${host}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload ?? {}),
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => '');

    return {
      ok: response.ok,
      httpStatus: response.status,
      body,
      responseKeys: getResponseKeys(body),
      errorBody: response.ok ? null : sanitizeErrorBody(body),
      setCookieInfo: extractSetCookieInfo(response.headers.get('set-cookie')),
    };
  } catch (error) {
    return {
      ok: false,
      httpStatus: 502,
      body: null,
      responseKeys: [],
      errorBody: sanitizeErrorBody(error.message || 'Unknown network error'),
      setCookieInfo: {
        hasSetCookie: false,
        cookieNames: [],
        sessionCookieValue: null,
      },
    };
  }
}

export async function callNeuronScript({ host, path, payload, sessionCookieValue }) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(sessionCookieValue ? { Cookie: buildUpstreamCookieHeader(sessionCookieValue) } : {}),
  };

  try {
    const response = await fetch(`https://${host}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload ?? {}),
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => '');

    return {
      ok: response.ok,
      httpStatus: response.status,
      body,
      responseKeys: getResponseKeys(body),
      errorBody: response.ok ? null : sanitizeErrorBody(body),
    };
  } catch (error) {
    return {
      ok: false,
      httpStatus: 502,
      body: null,
      responseKeys: [],
      errorBody: sanitizeErrorBody(error.message || 'Unknown network error'),
    };
  }
}

export function ensureTargetHostAllowed(targetHost, references) {
  const normalizedTargetHost = normalizeNeuronHost(targetHost);
  const allowedHosts = Array.isArray(references?.references)
    ? references.references.map((reference) => reference.host)
    : getConfiguredNeuronHosts();

  if (!isNeuronHostAllowed(normalizedTargetHost, allowedHosts)) {
    throw new Error('Target host is not allowed.');
  }

  return normalizedTargetHost;
}

export function getSwitchCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SWITCH_ATTEMPT_TTL_SECONDS,
  };
}

export function getSwitchDeleteCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  };
}

function normalizeRemoteReferences(body) {
  const rawReferences = body?.References ?? body?.references ?? body?.items ?? body;
  const records = Array.isArray(rawReferences)
    ? rawReferences
    : rawReferences && typeof rawReferences === 'object'
      ? Array.isArray(rawReferences.Reference)
        ? rawReferences.Reference
        : [rawReferences]
      : [];

  return [...new Set(records
    .map((value) => {
      if (typeof value === 'string') return normalizeNeuronHost(value);
      if (!value || typeof value !== 'object') return '';
      return normalizeNeuronHost(
        value.host ||
        value.domain ||
        value.Domain ||
        value.remoteHost ||
        value.reference ||
        '',
      );
    })
    .filter(Boolean))];
}

function extractSetCookieInfo(setCookieHeader) {
  if (!setCookieHeader) {
    return {
      hasSetCookie: false,
      cookieNames: [],
      sessionCookieValue: null,
    };
  }

  const parsed = setCookie.parse(setCookie.splitCookiesString(setCookieHeader), {
    decodeValues: false,
    map: true,
  });

  return {
    hasSetCookie: true,
    cookieNames: Object.keys(parsed),
    sessionCookieValue: parsed.HttpSessionID?.value || null,
  };
}

function sanitizeAttemptId(value) {
  if (!value) return 'switch';
  return String(value).trim().toLowerCase().replace(/[^a-z0-9-]/g, '') || 'switch';
}
