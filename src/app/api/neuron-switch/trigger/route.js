import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  DEFAULT_SWITCH_PURPOSE,
  NEURON_SWITCH_PRODUCTION_STATUSES,
  callAgentJson,
  ensureTargetHostAllowed,
  getNeuronReferences,
  getSwitchCookieOptions,
  getSwitchLegalIdCookieName,
  getSwitchTargetHostCookieName,
} from '@/lib/neuronSwitchProduction';
import {
  getNeuronSessionCookieValue,
  setNeuronSessionCookies,
} from '@/lib/neuronSessionContext';

export async function POST(request) {
  try {
    const requestBody = await request.json();
    const switchAttemptId = String(requestBody?.switchAttemptId || '').trim();
    const references = await getNeuronReferences(request);
    const targetHost = ensureTargetHostAllowed(requestBody?.targetHost, references);

    if (!switchAttemptId) {
      return NextResponse.json(
        { error: 'switchAttemptId is required.' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const legalId = cookieStore.get(getSwitchLegalIdCookieName(switchAttemptId))?.value || '';

    if (!legalId) {
      return NextResponse.json(
        { error: 'No prepared legalId is available for this switch attempt.' },
        { status: 400 },
      );
    }

    const existingTargetSession = await getNeuronSessionCookieValue(targetHost);
    const responseInfo = await callAgentJson({
      host: targetHost,
      path: '/Agent/Account/RemoteQuickLogin',
      payload: {
        legalId,
        purpose: requestBody?.purpose || DEFAULT_SWITCH_PURPOSE,
        ...(requestBody?.tabId ? { tabId: requestBody.tabId } : {}),
      },
      sessionCookieValue: existingTargetSession,
    });

    const responseBody = responseInfo.body && typeof responseInfo.body === 'object'
      ? responseInfo.body
      : {};
    const loggedIn = responseBody.loggedIn === true;
    const petitionSent = responseBody.petitionSent === true;
    const capturedSession = responseInfo.setCookieInfo.sessionCookieValue || null;
    const hasTargetSession = Boolean(capturedSession || existingTargetSession);

    const responsePayload = {
      switchAttemptId,
      targetHost,
      loggedIn,
      petitionSent,
      hasTargetSession,
      remoteResponseKeys: responseInfo.responseKeys,
      status: petitionSent && !loggedIn
        ? NEURON_SWITCH_PRODUCTION_STATUSES.WAITING_FOR_APPROVAL
        : hasTargetSession || loggedIn
          ? NEURON_SWITCH_PRODUCTION_STATUSES.TARGET_SESSION_AVAILABLE
          : 'REMOTE_LOGIN_API_MAY_BE_NEEDED',
    };

    const response = NextResponse.json(
      responseInfo.ok
        ? responsePayload
        : {
          ...responsePayload,
          error: responseInfo.errorBody || 'RemoteQuickLogin failed.',
        },
      { status: responseInfo.ok ? 200 : responseInfo.httpStatus || 502 },
    );

    response.cookies.set(
      getSwitchTargetHostCookieName(switchAttemptId),
      targetHost,
      getSwitchCookieOptions(),
    );

    if (capturedSession) {
      await setNeuronSessionCookies(response, {
        host: targetHost,
        sessionCookieValue: capturedSession,
        activate: false,
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || 'Failed to trigger Neuron switch.',
      },
      { status: 500 },
    );
  }
}
