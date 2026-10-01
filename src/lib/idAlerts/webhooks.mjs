import { createHmac, createPublicKey, timingSafeEqual, verify } from 'node:crypto';

export const validAlertId = (value) => /^[a-f0-9]{64}$/.test(value || '');
export const validAttemptId = (value) => /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value || '');

export async function limitedBody(request, maximum = 262144) {
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maximum) { await reader.cancel(); throw Object.assign(new Error('Body limit'), { statusCode: 413 }); }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

export function validTwilioSignature(url, params, signature, token) {
  if (!token || !signature) return false;
  let data = url;
  for (const name of [...new Set(params.keys())].sort()) {
    for (const value of [...new Set(params.getAll(name))].sort()) data += name + value;
  }
  const expected = createHmac('sha1', token).update(data).digest();
  const actual = Buffer.from(signature, 'base64');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function validSendGridSignature(body, timestamp, signature, publicKey) {
  if (!publicKey || !signature || !/^\d+$/.test(timestamp || '')) return false;
  try {
    const key = publicKey.includes('BEGIN PUBLIC KEY') ? createPublicKey(publicKey)
      : createPublicKey({ key: Buffer.from(publicKey, 'base64'), format: 'der', type: 'spki' });
    return verify('sha256', Buffer.concat([Buffer.from(timestamp), body]), key, Buffer.from(signature, 'base64'));
  } catch { return false; }
}
