import 'server-only';

import { validateParkletActionPayload } from '@/lib/parkletAdmin.mjs';

const MAX_REQUEST_BODY_BYTES = 2048;

export async function parseParkletActionRequest(request, {
  idField,
  idValue,
  requiresReason = false,
}) {
  if (!(request.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
    return invalid(415, 'Content-Type måste vara application/json.');
  }

  let payload;
  try {
    const requestBody = await request.text();
    if (new TextEncoder().encode(requestBody).byteLength > MAX_REQUEST_BODY_BYTES) {
      return invalid(413, 'Begäran är för stor.');
    }
    payload = JSON.parse(requestBody);
  } catch {
    return invalid(400, 'En giltig JSON-begäran krävs.');
  }

  const validated = validateParkletActionPayload(payload, { idField, idValue, requiresReason });
  return validated.ok ? validated : invalid(400, validated.error);
}

function invalid(status, error) {
  return { ok: false, status, error };
}
