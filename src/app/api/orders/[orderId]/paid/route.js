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

  try {
    const activeContext = await getActiveNeuronContext(request);
    if (!activeContext.host) return jsonResponse(503, 'No active Neuron host is configured.');

    const response = await fetch(
      `https://${activeContext.host}/nex-api-admin/order/${encodeURIComponent(orderId)}/paid`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(activeContext.upstreamCookieHeader ? { Cookie: activeContext.upstreamCookieHeader } : {}),
        },
        cache: 'no-store',
      },
    );
    const body = await readBody(response);

    if (!response.ok) {
      const upstreamMessage = typeof body === 'string' ? body : body?.message;
      return jsonResponse(response.status, upstreamMessage || 'Failed to mark the order as paid.');
    }

    return jsonResponse(200, '', body);
  } catch (error) {
    return jsonResponse(error?.statusCode || 500, error?.message || 'Internal Server Error');
  }
}
