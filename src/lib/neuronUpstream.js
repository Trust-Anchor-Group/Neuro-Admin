import 'server-only';

import { getActiveNeuronContext } from '@/lib/neuronSessionContext';

export function buildNeuronHeaders({
  upstreamCookieHeader,
  accept = 'application/json',
  contentType = 'application/json',
  extraHeaders = {},
} = {}) {
  const headers = {
    ...extraHeaders,
  };

  if (accept) {
    headers.Accept = accept;
  }

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  if (upstreamCookieHeader) {
    headers.Cookie = upstreamCookieHeader;
  }

  return headers;
}

export async function readNeuronResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  return {
    contentType,
    body,
  };
}

export async function fetchActiveNeuronJson(request, {
  path,
  method = 'POST',
  payload,
  extraHeaders = {},
  accept = 'application/json',
  contentType = 'application/json',
} = {}) {
  const activeContext = await getActiveNeuronContext(request);

  if (!activeContext.host) {
    throw new Error('No active Neuron host is configured.');
  }

  const init = {
    method,
    headers: buildNeuronHeaders({
      upstreamCookieHeader: activeContext.upstreamCookieHeader,
      accept,
      contentType,
      extraHeaders,
    }),
    cache: 'no-store',
  };

  if (payload !== undefined) {
    init.body = JSON.stringify(payload);
  }

  const response = await fetch(`https://${activeContext.host}${path}`, init);
  const parsed = await readNeuronResponseBody(response);

  return {
    response,
    host: activeContext.host,
    activeContext,
    ...parsed,
  };
}
