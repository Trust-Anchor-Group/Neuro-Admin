export function sameOrigin(request, publicOrigin = process.env.ID_ALERT_PUBLIC_ORIGIN) {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  const requestOrigin = new URL(request.url).origin;
  if (origin === requestOrigin) return true;
  if (!publicOrigin) return false;

  let configured;
  try { configured = new URL(publicOrigin); }
  catch { return false; }
  if (!['http:', 'https:'].includes(configured.protocol) ||
      configured.href !== `${configured.origin}/`) return false;

  const allowed = origin === configured.origin;
  if (allowed && process.env.ID_ALERT_ORIGIN_DIAGNOSTICS === 'true') {
    console.info('[id-alerts] public origin accepted', {
      origin, requestOrigin,
      host: request.headers.get('host'),
      forwardedHost: request.headers.get('x-forwarded-host'),
      forwardedProto: request.headers.get('x-forwarded-proto'),
    });
  }
  return allowed;
}
