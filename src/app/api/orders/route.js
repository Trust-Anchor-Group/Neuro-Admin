import ResponseModel from '@/models/ResponseModel';
import { getActiveNeuronContext } from '@/lib/neuronSessionContext';

async function readBody(response) {
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');
}

function jsonResponse(status, message, data = null) {
  return Response.json(new ResponseModel(status, message, data), {
    status,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

export async function GET(request) {
  try {
    const activeContext = await getActiveNeuronContext(request);
    if (!activeContext.host) return jsonResponse(503, 'No active Neuron host is configured.');

    const response = await fetch(`https://${activeContext.host}/nex-api-admin/order`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(activeContext.upstreamCookieHeader ? { Cookie: activeContext.upstreamCookieHeader } : {}),
      },
      cache: 'no-store',
    });
    const body = await readBody(response);

    if (!response.ok) {
      const upstreamMessage = typeof body === 'string' ? body : body?.message;
      return jsonResponse(response.status, upstreamMessage || 'Failed to list off-chain orders.');
    }

    return jsonResponse(200, '', body);
  } catch (error) {
    return jsonResponse(error?.statusCode || 500, error?.message || 'Internal Server Error');
  }
}
