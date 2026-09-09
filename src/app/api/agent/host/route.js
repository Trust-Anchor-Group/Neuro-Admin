import { isAllowedAgentHost } from '../../../../lib/agentHost';

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: 'Invalid JSON'}), { status: 400 }); }
  const host = typeof body?.host === 'string' ? body.host.trim().toLowerCase() : '';
  if (!isAllowedAgentHost(host)) return new Response(JSON.stringify({ error: 'Host is not allowed'}), { status: 400 });

  const headers = new Headers({ 'Content-Type': 'application/json' });
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  headers.append('Set-Cookie', `agent-host=${encodeURIComponent(host)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${secureFlag}`);
  return new Response(JSON.stringify({ host }), { status: 200, headers });
}

export function OPTIONS() { return new Response(null, { status: 204 }); }
