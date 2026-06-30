import { NextResponse } from 'next/server';
import { hasSessionCookie, sendIdentityNotificationEmail, VALID_IDENTITY_ACTIONS } from '@/lib/server/identityNotifications';
import { resolveAgentHost } from '@/lib/agentHost';

function hasValidTestSecret(req) {
  const configuredSecret = process.env.NOTIFICATION_TEST_SECRET?.trim();
  const providedSecret = req.headers.get('x-notification-test-secret')?.trim();

  return Boolean(configuredSecret && providedSecret && configuredSecret === providedSecret);
}

export async function POST(req) {
  try {
    const cookieHeader = req.headers.get('Cookie') || '';

    if (!hasSessionCookie(cookieHeader) && !hasValidTestSecret(req)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { action, user, reason } = await req.json();

    if (!VALID_IDENTITY_ACTIONS.has(action)) {
      return NextResponse.json(
        { error: `Invalid notification action: ${action}` },
        { status: 400 }
      );
    }

    if (!user?.properties?.EMAIL) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const neuronHost = resolveAgentHost(req.headers);
    const result = await sendIdentityNotificationEmail({ action, user, reason, neuronHost });

    if (!result.success) {
      return NextResponse.json(result, { status: result.status || 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
