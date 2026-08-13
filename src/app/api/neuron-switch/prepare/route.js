import { NextResponse } from 'next/server';
import {
  callAgentJson,
  createSwitchAttemptId,
  getSwitchCookieOptions,
  getSwitchLegalIdCookieName,
} from '@/lib/neuronSwitchProduction';
import { getActiveNeuronContext } from '@/lib/neuronSessionContext';

export async function POST(request) {
  try {
    const requestBody = await request.json().catch(() => ({}));
    const requestedAttemptId = typeof requestBody?.switchAttemptId === 'string'
      ? requestBody.switchAttemptId
      : '';
    const switchAttemptId = requestedAttemptId || createSwitchAttemptId();
    const activeContext = await getActiveNeuronContext(request);

    if (!activeContext.sessionCookieValue) {
      return NextResponse.json(
        {
          error: 'No active source session is available.',
          status: 'SOURCE_SESSION_MISSING',
        },
        { status: 401 },
      );
    }

    const responseInfo = await callAgentJson({
      host: activeContext.host,
      path: '/Agent/Account/PrepareRemoteQuickLogin',
      payload: {},
      sessionCookieValue: activeContext.sessionCookieValue,
    });

    if (!responseInfo.ok || !responseInfo.body?.legalId) {
      return NextResponse.json(
        {
          error: responseInfo.errorBody || 'PrepareRemoteQuickLogin failed.',
          sourceHost: activeContext.host,
          responseKeys: responseInfo.responseKeys,
        },
        { status: responseInfo.httpStatus || 502 },
      );
    }

    const response = NextResponse.json(
      {
        switchAttemptId,
        sourceHost: activeContext.host,
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
