import ResponseModel from '@/models/ResponseModel';
import { isAdminOrderId } from '@/lib/adminOrders.mjs';
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

export async function POST(request, { params }) {
  const { orderId } = await params;
  if (!isAdminOrderId(orderId)) return jsonResponse(400, 'A valid order ID is required.');

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, 'A JSON body with contract_status is required.');
  }

  if (!body || typeof body.contract_status !== 'string') {
    return jsonResponse(400, 'contract_status must be a string.');
  }

  try {
    const activeContext = await getActiveNeuronContext(request);
    if (!activeContext.host) return jsonResponse(503, 'No active Neuron host is configured.');

    const response = await fetch(
      `https://${activeContext.host}/nex-api-admin/order/${encodeURIComponent(orderId)}/contract-status`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(activeContext.upstreamCookieHeader ? { Cookie: activeContext.upstreamCookieHeader } : {}),
        },
        body: JSON.stringify({ contract_status: body.contract_status.trim() }),
        cache: 'no-store',
      },
    );
    const result = await readBody(response);

    if (!response.ok) {
      const upstreamMessage = typeof result === 'string' ? result : result?.message;
      return jsonResponse(response.status, upstreamMessage || 'Failed to update contract status.');
    }

    return jsonResponse(200, '', result);
  } catch (error) {
    return jsonResponse(error?.statusCode || 500, error?.message || 'Internal Server Error');
  }
}
