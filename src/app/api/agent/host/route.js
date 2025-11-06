import { validateHost } from '../../../../lib/agentHost';

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: 'Invalid JSON'}), { status: 400 }); }
  const host = body?.host?.trim();
  if (!validateHost(host)) return new Response(JSON.stringify({ error: 'Invalid host'}), { status: 400 });

  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append('Set-Cookie', `agent-host=${encodeURIComponent(host)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400; Secure`);
  return new Response(JSON.stringify({ host }), { status: 200, headers });
}

export function OPTIONS() { return new Response(null, { status: 204 }); }
