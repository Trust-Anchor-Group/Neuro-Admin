import setCookie from 'set-cookie-parser';

export const NEURON_SWITCH_DEBUG_STATUSES = {
  SOURCE_SESSION_FOUND: 'SOURCE_SESSION_FOUND',
  SOURCE_SESSION_MISSING: 'SOURCE_SESSION_MISSING',
  SOURCE_JWT_CREATED: 'SOURCE_JWT_CREATED',
  REMOTE_REFERENCES_SESSION_OK: 'REMOTE_REFERENCES_SESSION_OK',
  REMOTE_REFERENCES_SESSION_REJECTED: 'REMOTE_REFERENCES_SESSION_REJECTED',
  REMOTE_REFERENCES_JWT_OK: 'REMOTE_REFERENCES_JWT_OK',
  REMOTE_REFERENCES_JWT_REJECTED: 'REMOTE_REFERENCES_JWT_REJECTED',
  PREPARE_REMOTE_OK: 'PREPARE_REMOTE_OK',
  REMOTE_PETITION_SENT: 'REMOTE_PETITION_SENT',
  REMOTE_ALREADY_LOGGED_IN: 'REMOTE_ALREADY_LOGGED_IN',
  TARGET_SESSION_COOKIE_CAPTURED: 'TARGET_SESSION_COOKIE_CAPTURED',
  TARGET_SESSION_COOKIE_REUSED: 'TARGET_SESSION_COOKIE_REUSED',
  TARGET_SESSION_COOKIE_MISSING: 'TARGET_SESSION_COOKIE_MISSING',
  TARGET_SESSION_TEST_USED_WRONG_HOST: 'TARGET_SESSION_TEST_USED_WRONG_HOST',
  TARGET_SESSION_TEST_USED_SOURCE_COOKIE: 'TARGET_SESSION_TEST_USED_SOURCE_COOKIE',
  TARGET_JWT_CREATED: 'TARGET_JWT_CREATED',
  TARGET_JWT_CREATED_BUT_NOT_USABLE: 'TARGET_JWT_CREATED_BUT_NOT_USABLE',
  END_TO_END_SWITCH_WORKS_WITH_SESSION: 'END_TO_END_SWITCH_WORKS_WITH_SESSION',
  END_TO_END_SWITCH_WORKS_WITH_JWT: 'END_TO_END_SWITCH_WORKS_WITH_JWT',
  SESSION_COOKIE_LOST: 'SESSION_COOKIE_LOST',
  APP_PROXY_PINNED_TO_STATIC_HOST: 'APP_PROXY_PINNED_TO_STATIC_HOST',
  REMOTE_LOGIN_API_MAY_BE_NEEDED: 'REMOTE_LOGIN_API_MAY_BE_NEEDED',
};

const DEBUG_COOKIE_TTL_SECONDS = 60 * 30;

export function isNeuronSwitchDebugEnabled() {
  return process.env.NEXT_PUBLIC_NEURON_SWITCH_DEBUG === 'true';
}

export function sanitizeAttemptId(value) {
  if (!value) return 'unknown-attempt';
  return String(value).trim().toLowerCase().replace(/[^a-z0-9-]/g, '') || 'unknown-attempt';
}

export function getSwitchAttemptPrefix(attemptId) {
  return `[NeuronSwitchDebug] [switchAttemptId=${sanitizeAttemptId(attemptId)}]`;
}

export function logSwitchDebug(logs, attemptId, message, details) {
  const prefix = getSwitchAttemptPrefix(attemptId);
  const line = details === undefined
    ? `${prefix} ${message}`
    : `${prefix} ${message} ${safeJsonLog(details)}`;

  logs.push(line);
  console.info(line);
  return line;
}

export function safeJsonLog(value) {
  try {
    return JSON.stringify(sanitizeLogValue(value));
  } catch {
    return JSON.stringify({ error: 'Unable to serialize log payload' });
  }
}

export function redactToken(token) {
  if (!token || typeof token !== 'string') return null;
  if (token.length <= 12) return '[redacted-token]';
  return `${token.slice(0, 8)}...${token.slice(-6)}`;
}

export function redactCookie(cookieValue) {
  if (!cookieValue || typeof cookieValue !== 'string') return null;
  if (cookieValue.length <= 10) return '[redacted-cookie]';
  return `${cookieValue.slice(0, 4)}...${cookieValue.slice(-4)}`;
}

export function redactLegalId(legalId) {
  if (!legalId || typeof legalId !== 'string') return null;
  if (legalId.length <= 8) return '[redacted-legal-id]';
  return `${legalId.slice(0, 4)}...${legalId.slice(-4)}`;
}

export function decodeJwtWithoutVerification(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    return {
      header: JSON.parse(base64UrlDecode(parts[0])),
      payload: JSON.parse(base64UrlDecode(parts[1])),
    };
  } catch {
    return null;
  }
}

export function summarizeJwt(token) {
  const decoded = decodeJwtWithoutVerification(token);
  if (!decoded) return null;

  const payload = decoded.payload || {};
  return {
    exists: true,
    redacted: redactToken(token),
    header: pick(decoded.header, ['alg', 'typ', 'kid']),
    claims: {
      iss: payload.iss || null,
      aud: payload.aud || null,
      sub: payload.sub || null,
      userName: payload.userName || payload.name || null,
      exp: payload.exp || null,
      expIso: unixToIso(payload.exp),
      iat: payload.iat || null,
      iatIso: unixToIso(payload.iat),
      nbf: payload.nbf || null,
      nbfIso: unixToIso(payload.nbf),
    },
  };
}

export function getCookieNamesFromHeader(cookieHeader = '') {
  return String(cookieHeader)
    .split(';')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => segment.split('=')[0])
    .filter(Boolean);
}

export function getCookieValueFromHeader(cookieHeader = '', cookieName) {
  if (!cookieName) return null;

  const pattern = new RegExp(`(?:^|; )${escapeRegExp(cookieName)}=([^;]+)`);
  const match = String(cookieHeader).match(pattern);
  if (!match?.[1]) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function buildHttpSessionCookie(sessionValue) {
  if (!sessionValue) return null;
  return `HttpSessionID=${encodeURIComponent(sessionValue)}`;
}

export function extractSetCookieInfo(setCookieHeader) {
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

export function getDebugCookieName(kind, attemptId) {
  const sanitizedAttemptId = sanitizeAttemptId(attemptId).slice(0, 48);
  return `nsd-${kind}-${sanitizedAttemptId}`;
}

export function queueDebugCookie(cookieWrites, name, value, options = {}) {
  cookieWrites.push({
    name,
    value,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: DEBUG_COOKIE_TTL_SECONDS,
      ...options,
    },
  });
}

export function queueDebugCookieDeletion(cookieWrites, name) {
  cookieWrites.push({
    name,
    value: '',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    },
  });
}

export function applyCookieWrites(response, cookieWrites) {
  cookieWrites.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
}

export function getResponseKeys(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? Object.keys(value)
    : [];
}

export function sanitizeErrorBody(value) {
  if (typeof value === 'string') return truncate(value, 400);
  return sanitizeLogValue(value);
}

export function pick(value, keys) {
  if (!value || typeof value !== 'object') return {};
  const result = {};
  keys.forEach((key) => {
    if (value[key] !== undefined) result[key] = value[key];
  });
  return result;
}

function sanitizeLogValue(value, depth = 0) {
  if (value === null || value === undefined) return value;
  if (depth > 3) return '[truncated]';
  if (typeof value === 'string') return truncate(value, 400);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitizeLogValue(item, depth + 1));
  if (typeof value !== 'object') return String(value);

  const result = {};
  Object.entries(value).forEach(([key, nestedValue]) => {
    if (key === 'jwt' || key === 'token' || key === 'authorization' || key === 'sourceJwt') {
      result[key] = redactToken(typeof nestedValue === 'string' ? nestedValue : String(nestedValue));
    } else if (key === 'cookie' || key === 'set-cookie') {
      result[key] = redactCookie(typeof nestedValue === 'string' ? nestedValue : String(nestedValue));
    } else if (key === 'legalId') {
      result[key] = redactLegalId(typeof nestedValue === 'string' ? nestedValue : String(nestedValue));
    } else {
      result[key] = sanitizeLogValue(nestedValue, depth + 1);
    }
  });
  return result;
}

function base64UrlDecode(value) {
  const normalized = String(value).replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function unixToIso(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return null;
  return new Date(numericValue * 1000).toISOString();
}

function truncate(value, maxLength) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
