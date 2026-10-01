const KEY = ['receiver', 'leader'];
export const LEASE_MS = 30000;

const missing = (error) => error.statusCode === 404;
const conflict = (error) => error.statusCode === 409 || error.statusCode === 412;

export async function readReceiverLease(client) {
  try { return await client.getEntity(...KEY); }
  catch (error) { if (missing(error)) return null; throw error; }
}

export async function acquireReceiverLease(client, owner, now = Date.now()) {
  const current = await readReceiverLease(client);
  if (current && Date.parse(current.expiresAt) > now) return false;
  const next = { partitionKey: KEY[0], rowKey: KEY[1], owner,
    expiresAt: new Date(now + LEASE_MS).toISOString(), connected: false };
  try {
    if (current) await client.updateEntity(next, 'Replace', { etag: current.etag });
    else await client.createEntity(next);
    return true;
  } catch (error) { if (conflict(error)) return false; throw error; }
}

export async function renewReceiverLease(client, owner, connected, now = Date.now()) {
  const current = await readReceiverLease(client);
  if (!current || current.owner !== owner || Date.parse(current.expiresAt) <= now) return false;
  try {
    await client.updateEntity({ partitionKey: KEY[0], rowKey: KEY[1], owner,
      expiresAt: new Date(now + LEASE_MS).toISOString(), connected }, 'Replace', { etag: current.etag });
    return true;
  } catch (error) { if (conflict(error)) return false; throw error; }
}

export async function releaseReceiverLease(client, owner) {
  const current = await readReceiverLease(client);
  if (!current || current.owner !== owner) return;
  try { await client.deleteEntity(...KEY, { etag: current.etag }); }
  catch (error) { if (!missing(error) && !conflict(error)) throw error; }
}
