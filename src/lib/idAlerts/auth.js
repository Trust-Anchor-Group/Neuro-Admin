import 'server-only';

import jwt from 'jsonwebtoken';
import { getActiveNeuronContext } from '@/lib/neuronSessionContext';
import { getIdAlertConfig } from './config.mjs';
export { sameOrigin } from './origin.mjs';

export async function identifyIdAlertSession(request) {
  const context = await getActiveNeuronContext(request);
  if (!context.host || !context.sessionCookieValue) return null;
  const response = await fetch(`https://${context.host}/Agent/Account/QuickLogin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: context.upstreamCookieHeader },
    body: JSON.stringify({ seconds: 60 }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  const body = await response.json().catch(() => ({}));
  const claims = jwt.decode(body.jwt);
  const subject = typeof claims?.sub === 'string' ? claims.sub : '';
  if (!subject) return null;
  const id = `${context.host}:${subject}`;
  return { id, host: context.host };
}

export async function requireIdAlertOperator(request, { debug = false } = {}) {
  const identity = await identifyIdAlertSession(request);
  if (!identity) return null;
  const config = getIdAlertConfig();
  if (!config.operatorIds.has(identity.id)) return null;
  if (debug && !config.debugOperatorIds.has(identity.id)) return null;
  return identity;
}
