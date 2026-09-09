import { NextResponse } from 'next/server';
import {
  callAgentJson,
  createSwitchAttemptId,
  getSwitchCookieOptions,
  getSwitchLegalIdCookieName,
} from '@/lib/neuronSwitchProduction';
import {
  getActiveNeuronContext,
  getCurrentNeuronSummary,
  getNeuronSessionCookieValue,
} from '@/lib/neuronSessionContext';

export async function POST(request) {
  try {
    const requestBody = await request.json().catch(() => ({}));
    const requestedAttemptId = typeof requestBody?.switchAttemptId === 'string'
      ? requestBody.switchAttemptId
      : '';
    const switchAttemptId = requestedAttemptId || createSwitchAttemptId();
    const activeContext = await getActiveNeuronContext(request);
    const sourceJwt = typeof requestBody?.sourceJwt === 'string' && requestBody.sourceJwt.trim()
      ? requestBody.sourceJwt.trim()
      : null;

    const currentSummary = await getCurrentNeuronSummary(request);
    const sourceHost = currentSummary.sourceHost || activeContext.host;
    const storedSourceSession = currentSummary.sourceHost
      ? await getNeuronSessionCookieValue(currentSummary.sourceHost)
      : activeContext.sessionCookieValue;
    const sourceSessionCookieValue = storedSourceSession || (
      sourceHost === activeContext.host ? activeContext.sessionCookieValue : null
    );

    if (!sourceSessionCookieValue) {
      return NextResponse.json(
        {
          error: `The source session for ${sourceHost} is unavailable or expired. Reconnect to that Neuron with Neuro-Access, then retry.`,
          status: 'SOURCE_SESSION_MISSING',
          sourceHost,
          activeHost: activeContext.host,
        },
        { status: 401 },
      );
    }

    const responseInfo = await callAgentJson({
      host: sourceHost,
      path: '/Agent/Account/PrepareRemoteQuickLogin',
      payload: {},
      bearerToken: sourceJwt,
      sessionCookieValue: sourceSessionCookieValue,
    });

    if (!responseInfo.ok || !responseInfo.body?.legalId) {
      return NextResponse.json(
        {
          error: responseInfo.errorBody || 'PrepareRemoteQuickLogin failed.',
          status: responseInfo.httpStatus === 401
            ? 'SOURCE_SESSION_EXPIRED'
            : 'SOURCE_PREPARE_FAILED',
          sourceHost,
          responseKeys: responseInfo.responseKeys,
        },
        { status: responseInfo.httpStatus || 502 },
      );
    }

    const response = NextResponse.json(
      {
        switchAttemptId,
        sourceHost,
        status: 'PREPARE_REMOTE_OK',
      },
      { status: 200 },
    );

    response.cookies.set(
      getSwitchLegalIdCookieName(switchAttemptId),
      responseInfo.body.legalId,
      getSwitchCookieOptions(),
    );

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || 'Failed to prepare Neuron switch.',
      },
      { status: 500 },
    );
  }
}
