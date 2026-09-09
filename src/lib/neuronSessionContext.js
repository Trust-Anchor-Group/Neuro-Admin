import 'server-only';

import { createHash } from 'crypto';
import { cookies } from 'next/headers';
import config from '@/config/config';
import { validateHost } from '@/lib/agentHost';

export const ACTIVE_NEURON_HOST_COOKIE = 'neuro-admin-active-neuron-host';
export const NEURON_SESSION_HOSTS_COOKIE = 'neuro-admin-neuron-session-hosts';
export const NEURON_SWITCH_SOURCE_HOST_COOKIE = 'neuro-admin-neuron-switch-source-host';
export const LEGACY_HTTP_SESSION_COOKIE = 'HttpSessionID';

const PER_HOST_SESSION_COOKIE_PREFIX = 'neuro-admin-neuron-session-';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function normalizeNeuronHost(host) {
  if (!host || typeof host !== 'string') return '';
  return host.trim().toLowerCase();
}

export function getDefaultNeuronHost() {
  return normalizeNeuronHost(config.api.agent.host || process.env.AGENT_HOST || '');
}

export function getConfiguredNeuronHosts() {
  const defaultHost = getDefaultNeuronHost();
  const rawValues = [
    process.env.NEURON_SWITCH_ALLOWED_HOSTS,
    process.env.NEXT_PUBLIC_NEURON_SWITCH_ALLOWED_HOSTS,
  ]
    .filter(Boolean)
    .join(',');

  const hosts = rawValues
    .split(',')
    .map((value) => normalizeNeuronHost(value))
    .filter((host) => validateHost(host));

  if (defaultHost) {
    hosts.unshift(defaultHost);
  }

  return [...new Set(hosts)];
}

export function isNeuronHostAllowed(host, allowedHosts = []) {
  const normalizedHost = normalizeNeuronHost(host);
  if (!validateHost(normalizedHost)) return false;

  const normalizedAllowedHosts = (allowedHosts.length ? allowedHosts : getConfiguredNeuronHosts())
    .map((value) => normalizeNeuronHost(value))
    .filter(Boolean);

  return normalizedAllowedHosts.includes(normalizedHost);
}

export function getNeuronSessionCookieName(host) {
  const normalizedHost = normalizeNeuronHost(host);
  const safeHash = createHash('sha256').update(normalizedHost).digest('hex').slice(0, 16);
  return `${PER_HOST_SESSION_COOKIE_PREFIX}${safeHash}`;
}

export async function getNeuronSessionCookieValue(host) {
  const normalizedHost = normalizeNeuronHost(host);
  if (!validateHost(normalizedHost)) return null;

  const cookieStore = await cookies();
  return cookieStore.get(getNeuronSessionCookieName(normalizedHost))?.value || null;
}

export function buildUpstreamCookieHeader(sessionCookieValue) {
  if (!sessionCookieValue) return '';
  return `HttpSessionID=${encodeURIComponent(sessionCookieValue)}`;
}

export async function getStoredNeuronSessionHosts() {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(NEURON_SESSION_HOSTS_COOKIE)?.value || '[]';

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((value) => normalizeNeuronHost(value))
      .filter((host) => validateHost(host));
  } catch {
    return [];
  }
}

export async function getActiveNeuronContext(request, options = {}) {
  const cookieStore = await cookies();
  const defaultHost = getDefaultNeuronHost();
  const storedSessionHosts = await getStoredNeuronSessionHosts();
  const allowedHosts = normalizeAllowedHosts(options.allowedHosts, storedSessionHosts);
  const activeHostCookieValue = normalizeNeuronHost(cookieStore.get(ACTIVE_NEURON_HOST_COOKIE)?.value || '');

  let host = activeHostCookieValue || defaultHost;
  if (!isNeuronHostAllowed(host, allowedHosts)) {
    host = defaultHost;
  }

  const perHostSessionCookieValue = host
    ? cookieStore.get(getNeuronSessionCookieName(host))?.value || ''
    : '';
  const legacySessionCookieValue = cookieStore.get(LEGACY_HTTP_SESSION_COOKIE)?.value || '';

  let sessionCookieValue = '';
  let sessionSource = 'missing';

  if (perHostSessionCookieValue) {
    sessionCookieValue = perHostSessionCookieValue;
    sessionSource = 'per-host-session-cookie';
  } else if (host === defaultHost && legacySessionCookieValue) {
    sessionCookieValue = legacySessionCookieValue;
    sessionSource = 'legacy-active-session-cookie';
  }

  return {
    host,
    sessionCookieValue: sessionCookieValue || null,
    upstreamCookieHeader: buildUpstreamCookieHeader(sessionCookieValue),
    isDefaultHost: host === defaultHost,
    activeHostCookieExists: Boolean(activeHostCookieValue),
    sessionSource,
  };
}

export async function getCurrentNeuronSummary(request, options = {}) {
  const activeContext = await getActiveNeuronContext(request, options);
  const defaultHost = getDefaultNeuronHost();
  const storedHosts = await getStoredNeuronSessionHosts();
  const cookieStore = await cookies();
  const sourceHost = normalizeNeuronHost(
    cookieStore.get(NEURON_SWITCH_SOURCE_HOST_COOKIE)?.value || '',
  );
  const sourceSessionCookieValue = sourceHost
    ? cookieStore.get(getNeuronSessionCookieName(sourceHost))?.value || ''
    : activeContext.sessionCookieValue || '';

  return {
    activeHost: activeContext.host,
    defaultHost,
    sourceHost: sourceHost || null,
    hasSourceSession: Boolean(sourceSessionCookieValue),
    canStartRemoteLogin: Boolean(sourceSessionCookieValue),
    hasActiveSession: Boolean(activeContext.sessionCookieValue),
    availableStoredSessions: storedHosts,
    activeHostCookieExists: activeContext.activeHostCookieExists,
    sessionSource: activeContext.sessionSource,
  };
}

export function setNeuronSwitchSourceHost(response, host) {
  const normalizedHost = normalizeNeuronHost(host);
  if (!normalizedHost) return;

  response.cookies.set(NEURON_SWITCH_SOURCE_HOST_COOKIE, normalizedHost, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function setNeuronSessionCookies(response, { host, sessionCookieValue, activate = false }) {
  const normalizedHost = normalizeNeuronHost(host);
  if (!validateHost(normalizedHost) || !sessionCookieValue) {
    return;
  }

  const cookieStore = await cookies();
  const currentHosts = await getStoredNeuronSessionHosts();
  const nextHosts = [...new Set([...currentHosts, normalizedHost])];
  const baseOptions = getCookieOptions();

  response.cookies.set(getNeuronSessionCookieName(normalizedHost), sessionCookieValue, baseOptions);
  response.cookies.set(NEURON_SESSION_HOSTS_COOKIE, JSON.stringify(nextHosts), baseOptions);

  if (activate) {
    response.cookies.set(ACTIVE_NEURON_HOST_COOKIE, normalizedHost, baseOptions);
    response.cookies.set(LEGACY_HTTP_SESSION_COOKIE, sessionCookieValue, baseOptions);
  }

  // Keep the index stable even if the current request had a stale cookieStore view.
  if (!cookieStore.get(NEURON_SESSION_HOSTS_COOKIE)?.value && nextHosts.length === 1) {
    response.cookies.set(NEURON_SESSION_HOSTS_COOKIE, JSON.stringify(nextHosts), baseOptions);
  }
}

export async function clearNeuronSessionCookies(response, options = {}) {
  const cookieStore = await cookies();
  const currentHosts = await getStoredNeuronSessionHosts();
  const baseDeleteOptions = getDeleteCookieOptions();
  const clearAll = options.clearAll === true;
  const normalizedHost = normalizeNeuronHost(options.host || '');
  const activeHost = normalizeNeuronHost(cookieStore.get(ACTIVE_NEURON_HOST_COOKIE)?.value || '');

  if (clearAll) {
    currentHosts.forEach((host) => {
      response.cookies.set(getNeuronSessionCookieName(host), '', baseDeleteOptions);
    });
    response.cookies.set(NEURON_SESSION_HOSTS_COOKIE, '', baseDeleteOptions);
    response.cookies.set(ACTIVE_NEURON_HOST_COOKIE, '', baseDeleteOptions);
    response.cookies.set(NEURON_SWITCH_SOURCE_HOST_COOKIE, '', baseDeleteOptions);
    response.cookies.set(LEGACY_HTTP_SESSION_COOKIE, '', baseDeleteOptions);
    return;
  }

  if (!normalizedHost) {
    return;
  }

  response.cookies.set(getNeuronSessionCookieName(normalizedHost), '', baseDeleteOptions);

  const remainingHosts = currentHosts.filter((host) => host !== normalizedHost);
  if (remainingHosts.length) {
    response.cookies.set(NEURON_SESSION_HOSTS_COOKIE, JSON.stringify(remainingHosts), getCookieOptions());
  } else {
    response.cookies.set(NEURON_SESSION_HOSTS_COOKIE, '', baseDeleteOptions);
  }

  if (options.clearLegacyIfActive && activeHost === normalizedHost) {
    response.cookies.set(LEGACY_HTTP_SESSION_COOKIE, '', baseDeleteOptions);
  }

  if (options.clearActiveHostIfMatches && activeHost === normalizedHost) {
    response.cookies.set(ACTIVE_NEURON_HOST_COOKIE, '', baseDeleteOptions);
  }
}

function normalizeAllowedHosts(allowedHosts = [], storedSessionHosts = []) {
  const fallbackHosts = [...getConfiguredNeuronHosts(), ...storedSessionHosts];
  const source = Array.isArray(allowedHosts) && allowedHosts.length ? allowedHosts : fallbackHosts;
  return [...new Set(source.map((value) => normalizeNeuronHost(value)).filter((host) => validateHost(host)))];
}

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
}

function getDeleteCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  };
}
