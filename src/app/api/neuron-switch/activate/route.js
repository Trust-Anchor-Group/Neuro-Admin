import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  DEFAULT_TARGET_SCRIPT_PATH,
  NEURON_SWITCH_PRODUCTION_STATUSES,
  callNeuronScript,
  ensureTargetHostAllowed,
  getNeuronReferences,
  getSwitchDeleteCookieOptions,
  getSwitchLegalIdCookieName,
  getSwitchTargetHostCookieName,
} from '@/lib/neuronSwitchProduction';
import {
  getActiveNeuronContext,
  getNeuronSessionCookieValue,
  setNeuronSessionCookies,
} from '@/lib/neuronSessionContext';

export async function POST(request) {
  try {
    const requestBody = await request.json().catch(() => ({}));
    const switchAttemptId = String(requestBody?.switchAttemptId || '').trim();
    const cookieStore = await cookies();
    const requestedTargetHost = requestBody?.targetHost || cookieStore.get(getSwitchTargetHostCookieName(switchAttemptId))?.value;
    const references = await getNeuronReferences(request);
    const targetHost = ensureTargetHostAllowed(requestedTargetHost, references);
    const currentActive = await getActiveNeuronContext(request);
    const targetSessionCookieValue = await getNeuronSessionCookieValue(targetHost);

    if (!targetSessionCookieValue) {
      return NextResponse.json(
        {
          error: 'No target session cookie is stored for the selected Neuron.',
          status: NEURON_SWITCH_PRODUCTION_STATUSES.TARGET_SESSION_COOKIE_MISSING,
          targetHost,
        },
        { status: 400 },
      );
    }

    if (
      currentActive.host !== targetHost &&
      currentActive.sessionCookieValue &&
      currentActive.sessionCookieValue === targetSessionCookieValue
    ) {
      return NextResponse.json(
        {
          error: 'The stored target session matches the current active source session.',
          status: NEURON_SWITCH_PRODUCTION_STATUSES.TARGET_SESSION_TEST_USED_SOURCE_COOKIE,
          targetHost,
        },
        { status: 400 },
      );
    }

    const responseInfo = await callNeuronScript({
      host: targetHost,
      path: DEFAULT_TARGET_SCRIPT_PATH,
      payload: {},
      sessionCookieValue: targetSessionCookieValue,
    });

    if (!responseInfo.ok) {
      return NextResponse.json(
        {
          error: responseInfo.errorBody || 'The target session was not accepted by Accounts.ws.',
          status: 'TARGET_SESSION_ACTIVATION_FAILED',
          targetHost,
          endpointPath: DEFAULT_TARGET_SCRIPT_PATH,
          responseKeys: responseInfo.responseKeys,
        },
        { status: responseInfo.httpStatus || 502 },
      );
    }

    const response = NextResponse.json(
      {
        activeHost: targetHost,
        status: NEURON_SWITCH_PRODUCTION_STATUSES.END_TO_END_SWITCH_WORKS_WITH_SCRIPT_SESSION,
        endpointPath: DEFAULT_TARGET_SCRIPT_PATH,
        responseKeys: responseInfo.responseKeys,
      },
      { status: 200 },
    );

    await setNeuronSessionCookies(response, {
      host: targetHost,
      sessionCookieValue: targetSessionCookieValue,
      activate: true,
    });

    if (switchAttemptId) {
      response.cookies.set(
        getSwitchLegalIdCookieName(switchAttemptId),
        '',
        getSwitchDeleteCookieOptions(),
      );
      response.cookies.set(
        getSwitchTargetHostCookieName(switchAttemptId),
        '',
        getSwitchDeleteCookieOptions(),
      );
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || 'Failed to activate the selected Neuron.',
      },
      { status: 500 },
    );
  }
}
