import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { resolveAgentHost, validateHost } from '@/lib/agentHost';
import {
  NEURON_SWITCH_DEBUG_STATUSES,
  applyCookieWrites,
  buildHttpSessionCookie,
  extractSetCookieInfo,
  getCookieNamesFromHeader,
  getDebugCookieName,
  getResponseKeys,
  isNeuronSwitchDebugEnabled,
  logSwitchDebug,
  pick,
  queueDebugCookie,
  queueDebugCookieDeletion,
  redactLegalId,
  sanitizeAttemptId,
  sanitizeErrorBody,
  summarizeJwt,
} from '@/lib/neuronSwitchDebug';
import {
  buildNeuronSwitchUrl,
  getNeuronSwitchEndpointDefinition,
  getNeuronSwitchEndpointDiagnostics,
} from '@/lib/neuronSwitchEndpoints';
import { setNeuronSessionCookies } from '@/lib/neuronSessionContext';

export const dynamic = 'force-dynamic';

const ACTION_ALIASES = {
  check: 'inspect',
  inspect: 'inspect',
  currentjwt: 'current-jwt',
  'current-jwt': 'current-jwt',
  references: 'remote-references',
  remotereferences: 'remote-references',
  'remote-references': 'remote-references',
  prepare: 'prepare',
  trigger: 'trigger',
  continue: 'continue',
  continuafterapproval: 'continue',
  'continue-after-approval': 'continue',
  activateproduction: 'activate-production',
  'activate-production': 'activate-production',
  'use-target-in-app': 'activate-production',
  testtargetsession: 'continue',
  'test-target-session': 'continue',
  targetsession: 'continue',
  'target-session': 'continue',
  convert: 'convert-target',
  converttarget: 'convert-target',
  'convert-target': 'convert-target',
  optionaljwt: 'convert-target',
  'optional-jwt': 'convert-target',
  full: 'full',
};

const DEFAULT_PURPOSE = 'Neuro Admin remote login test';
const DEFAULT_SECONDS = 3600;
const DEFAULT_TRANSPORT_MODE = 'backend-web-service/proxy';
const DEFAULT_TARGET_SCRIPT_PATH = '/Accounts.ws';
const STATIC_AGENT_HOST = normalizeHost(process.env.AGENT_HOST || '');

export async function POST(request) {
  if (!isNeuronSwitchDebugEnabled()) {
    return NextResponse.json({ error: 'Neuron switch debug mode is disabled.' }, { status: 404 });
  }

  const cookieStore = await cookies();
  const requestCookieHeader = request.headers.get('cookie') || '';
  const requestCookieNames = getCookieNamesFromHeader(requestCookieHeader);
  const cookieWrites = [];

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const action = normalizeAction(body?.action);
  if (!action) {
    return NextResponse.json({ error: `Unsupported action: ${body?.action || ''}` }, { status: 400 });
  }

  const switchAttemptId = sanitizeAttemptId(body?.switchAttemptId || crypto.randomUUID());
  const logs = [];
  const sourceHost = normalizeHost(body?.sourceHost || body?.clientAuth?.activeHost || resolveAgentHost(request.headers));
  const targetHost = normalizeHost(body?.targetHost);

  const purpose = typeof body?.purpose === 'string' && body.purpose.trim()
    ? body.purpose.trim()
    : DEFAULT_PURPOSE;

  const seconds = Number.isFinite(Number(body?.seconds)) && Number(body.seconds) > 0
    ? Number(body.seconds)
    : DEFAULT_SECONDS;

  const transportMode = normalizeTransportMode(body?.transportMode);
  const tabId = normalizeTabId(body?.tabId);
  const targetScriptPath = normalizeScriptPath(body?.targetScriptPath || DEFAULT_TARGET_SCRIPT_PATH);

  const sourceSessionCookieName = 'HttpSessionID';
  const sourceSessionCookieValue = cookieStore.get(sourceSessionCookieName)?.value || null;

  const legalIdCookieName = getDebugCookieName('legal-id', switchAttemptId);
  const sourceJwtCookieName = getDebugCookieName('source-jwt', switchAttemptId);
  const targetSessionCookieName = getDebugCookieName('target-session', switchAttemptId);
  const targetJwtCookieName = getDebugCookieName('target-jwt', switchAttemptId);

  const storedSourceDebugJwt = cookieStore.get(sourceJwtCookieName)?.value || null;
  const storedTargetSessionCookie = cookieStore.get(targetSessionCookieName)?.value || null;
  const storedTargetJwt = cookieStore.get(targetJwtCookieName)?.value || null;

  const sourceJwt = getSourceJwt(body, request, storedSourceDebugJwt);
  const architectureAudit = buildArchitectureAudit(sourceHost, targetHost);
  const architectureObservedStatuses = architectureAudit.appProxyPinnedToStaticHost
    ? [NEURON_SWITCH_DEBUG_STATUSES.APP_PROXY_PINNED_TO_STATIC_HOST]
    : [];

  const apiTrace = [];

  const baseSummary = {
    action,
    switchAttemptId,
    sourceHost: sourceHost || null,
    targetHost: targetHost || null,
    targetScriptPath,
    transportMode,
    requestTransport: 'backend-web-service',
    browserRequestMode: body?.clientRequest?.mode || null,
    browserCredentialsMode: body?.clientRequest?.credentials || null,
    tabId: tabId || null,
    endpointDiagnostics: getNeuronSwitchEndpointDiagnostics(),
    architectureAudit,
  };

  logSwitchDebug(logs, switchAttemptId, 'Debug route received request.', {
    sourceHost,
    targetHost,
    targetScriptPath,
    sourceSessionCookieExists: Boolean(sourceSessionCookieValue),
    sourceJwtExists: Boolean(sourceJwt),
    targetSessionCookieExists: Boolean(storedTargetSessionCookie),
    targetJwtExists: Boolean(storedTargetJwt),
    cookieNames: requestCookieNames,
  });

  try {
    let result;
    let productionActivation = null;

    if (transportMode === 'browser-direct') {
      result = buildBrowserDirectBlockedResult({
        switchAttemptId,
        logs,
        sourceHost,
        targetHost,
      });
    } else if (action === 'inspect') {
      result = buildInspectResult({
        switchAttemptId,
        logs,
        sourceHost,
        targetHost,
        sourceJwt,
        requestCookieNames,
        sourceSessionCookieValue,
        storedSourceDebugJwt,
        storedTargetSessionCookie,
        storedTargetJwt,
        clientAuth: body?.clientAuth,
      });
    } else if (action === 'current-jwt') {
      assertHost(sourceHost, 'sourceHost');

      result = await runCurrentJwt({
        switchAttemptId,
        logs,
        sourceHost,
        seconds,
        sourceSessionCookieValue,
        sourceJwtCookieName,
        cookieWrites,
        apiTrace,
      });
    } else if (action === 'remote-references') {
      assertHost(sourceHost, 'sourceHost');

      result = await runRemoteReferences({
        switchAttemptId,
        logs,
        sourceHost,
        sourceJwt,
        sourceSessionCookieValue,
        apiTrace,
      });
    } else if (action === 'prepare') {
      assertHost(sourceHost, 'sourceHost');

      queueDebugCookieDeletion(cookieWrites, legalIdCookieName);
      queueDebugCookieDeletion(cookieWrites, targetSessionCookieName);
      queueDebugCookieDeletion(cookieWrites, targetJwtCookieName);

      result = await runPrepare({
        switchAttemptId,
        logs,
        sourceHost,
        sourceJwt,
        sourceSessionCookieValue,
        purpose,
        cookieWrites,
        legalIdCookieName,
        apiTrace,
      });
    } else if (action === 'trigger') {
      assertHost(targetHost, 'targetHost');

      result = await runTrigger({
        switchAttemptId,
        logs,
        targetHost,
        purpose,
        cookieStore,
        cookieWrites,
        legalIdCookieName,
        targetSessionCookieName,
        storedTargetSessionCookie,
        tabId,
        apiTrace,
      });
    } else if (action === 'continue') {
      assertHost(targetHost, 'targetHost');

      result = await runTargetSessionProof({
        switchAttemptId,
        logs,
        targetHost,
        hostUsed: targetHost,
        targetScriptPath,
        targetSessionCookieName,
        storedTargetSessionCookie,
        sourceSessionCookieValue,
        apiTrace,
      });
    } else if (action === 'activate-production') {
      assertHost(targetHost, 'targetHost');

      result = await runTargetSessionProof({
        switchAttemptId,
        logs,
        targetHost,
        hostUsed: targetHost,
        targetScriptPath,
        targetSessionCookieName,
        storedTargetSessionCookie,
        sourceSessionCookieValue,
        apiTrace,
      });

      if (result.ok) {
        productionActivation = {
          host: targetHost,
          sessionCookieValue: storedTargetSessionCookie,
        };
        result = {
          ...result,
          diagnosis: 'The verified target session is now the active Neuro Admin session. Reload Neuro Access to fetch data from the target Neuron.',
          recommendation: 'Use the Neuro Access menu. Its API requests now use the selected target host and its per-host session cookie.',
          summary: {
            ...result.summary,
            productionActivated: true,
          },
        };
      }
    } else if (action === 'convert-target') {
      assertHost(targetHost, 'targetHost');

      const converted = await runConvertTarget({
        switchAttemptId,
        logs,
        targetHost,
        seconds,
        cookieWrites,
        targetSessionCookieName,
        targetJwtCookieName,
        storedTargetSessionCookie,
        apiTrace,
      });

      if (!converted.ok) {
        result = converted;
      } else {
        const targetJwt = findLatestCookieValue(cookieWrites, targetJwtCookieName);

        const proved = await runProof({
          switchAttemptId,
          logs,
          targetHost,
          targetJwt,
          apiTrace,
        });

        result = {
          ...proved,
          steps: [converted.step, proved.step],
          observedStatuses: combineObservedStatuses(converted, proved),
        };
      }
    } else {
      assertHost(sourceHost, 'sourceHost');
      assertHost(targetHost, 'targetHost');

      queueDebugCookieDeletion(cookieWrites, legalIdCookieName);
      queueDebugCookieDeletion(cookieWrites, sourceJwtCookieName);
      queueDebugCookieDeletion(cookieWrites, targetSessionCookieName);
      queueDebugCookieDeletion(cookieWrites, targetJwtCookieName);

      const inspected = buildInspectResult({
        switchAttemptId,
        logs,
        sourceHost,
        targetHost,
        sourceJwt,
        requestCookieNames,
        sourceSessionCookieValue,
        storedSourceDebugJwt,
        storedTargetSessionCookie,
        storedTargetJwt,
        clientAuth: body?.clientAuth,
      });

      const steps = [inspected.step];
      const observedStatuses = combineObservedStatuses(inspected);

      const prepared = await runPrepare({
        switchAttemptId,
        logs,
        sourceHost,
        sourceJwt,
        sourceSessionCookieValue,
        purpose,
        cookieWrites,
        legalIdCookieName,
        apiTrace,
      });

      steps.push(prepared.step);

      if (!prepared.ok) {
        result = {
          ...prepared,
          steps,
          observedStatuses: combineObservedStatuses({ observedStatuses }, prepared),
        };
      } else {
        const triggered = await runTrigger({
          switchAttemptId,
          logs,
          targetHost,
          purpose,
          cookieStore,
          cookieWrites,
          legalIdCookieName,
          targetSessionCookieName,
          preparedLegalId: prepared.legalId,
          storedTargetSessionCookie: null,
          tabId,
          apiTrace,
        });

        steps.push(triggered.step);

        if (!triggered.ok || triggered.finalStatus === NEURON_SWITCH_DEBUG_STATUSES.REMOTE_PETITION_SENT) {
          result = {
            ...triggered,
            steps,
            observedStatuses: combineObservedStatuses({ observedStatuses }, prepared, triggered),
          };
        } else {
          const targetSessionValue = findLatestCookieValue(cookieWrites, targetSessionCookieName);

          const sessionProved = await runTargetSessionProof({
            switchAttemptId,
            logs,
            targetHost,
            hostUsed: targetHost,
            targetScriptPath,
            targetSessionCookieName,
            storedTargetSessionCookie: targetSessionValue,
            sourceSessionCookieValue,
            apiTrace,
          });

          steps.push(sessionProved.step);

          result = {
            ...sessionProved,
            steps,
            observedStatuses: combineObservedStatuses({ observedStatuses }, prepared, triggered, sessionProved),
          };
        }
      }
    }

    const finalObservedStatuses = combineObservedStatuses(
      { observedStatuses: architectureObservedStatuses },
      result,
    );

    const response = NextResponse.json({
      ok: result.ok,
      action,
      switchAttemptId,
      finalStatus: result.finalStatus || null,
      observedStatuses: finalObservedStatuses.length
        ? finalObservedStatuses
        : (result.finalStatus ? [result.finalStatus] : []),
      diagnosis: result.diagnosis || null,
      recommendation: result.recommendation || null,
      summary: {
        ...baseSummary,
        humanSummary: buildHumanSummary(result),
        apiTrace,
        ...(result.summary || {}),
      },
      step: result.step,
      steps: result.steps || [result.step],
      logs,
    }, { status: result.httpStatus || 200 });

    if (productionActivation) {
      await setNeuronSessionCookies(response, {
        host: productionActivation.host,
        sessionCookieValue: productionActivation.sessionCookieValue,
        activate: true,
      });
    }

    applyCookieWrites(response, cookieWrites);
    return response;
  } catch (error) {
    logSwitchDebug(logs, switchAttemptId, 'Unhandled debug route error.', {
      sourceHost,
      targetHost,
      targetScriptPath,
      status: 500,
      message: error.message || 'Unknown error',
    });

    const response = NextResponse.json({
      ok: false,
      action,
      switchAttemptId,
      finalStatus: architectureAudit.appProxyPinnedToStaticHost
        ? NEURON_SWITCH_DEBUG_STATUSES.APP_PROXY_PINNED_TO_STATIC_HOST
        : NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST,
      observedStatuses: combineObservedStatuses(
        { observedStatuses: architectureObservedStatuses },
        {
          observedStatuses: architectureAudit.appProxyPinnedToStaticHost
            ? [NEURON_SWITCH_DEBUG_STATUSES.APP_PROXY_PINNED_TO_STATIC_HOST]
            : [NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST],
        },
      ),
      diagnosis: error.message || 'Unhandled error',
      summary: {
        ...baseSummary,
        humanSummary: [error.message || 'Unhandled error'],
        apiTrace,
      },
      logs,
    }, { status: 500 });

    applyCookieWrites(response, cookieWrites);
    return response;
  }
}

function buildInspectResult({
  switchAttemptId,
  logs,
  sourceHost,
  targetHost,
  sourceJwt,
  requestCookieNames,
  sourceSessionCookieValue,
  storedSourceDebugJwt,
  storedTargetSessionCookie,
  storedTargetJwt,
  clientAuth,
}) {
  const clientJwtSummary = summarizeJwt(sourceJwt);
  const storedSourceDebugJwtSummary = summarizeJwt(storedSourceDebugJwt);
  const storedTargetJwtSummary = summarizeJwt(storedTargetJwt);
  const finalStatus = sourceSessionCookieValue
    ? NEURON_SWITCH_DEBUG_STATUSES.SOURCE_SESSION_FOUND
    : NEURON_SWITCH_DEBUG_STATUSES.SOURCE_SESSION_MISSING;

  logSwitchDebug(logs, switchAttemptId, 'Current QuickLogin/session/JWT diagnostic completed.', {
    sourceHost,
    targetHost,
    sourceSessionCookieExists: Boolean(sourceSessionCookieValue),
    sourceJwtExists: Boolean(sourceJwt),
    targetSessionCookieExists: Boolean(storedTargetSessionCookie),
    targetJwtExists: Boolean(storedTargetJwt),
    cookieNames: requestCookieNames,
  });

  return {
    ok: true,
    httpStatus: 200,
    finalStatus,
    observedStatuses: [finalStatus],
    diagnosis: sourceSessionCookieValue
      ? 'The current Neuro Admin login session is present on the app domain.'
      : 'No current QuickLogin session cookie was found on the Neuro Admin domain.',
    recommendation: sourceSessionCookieValue
      ? 'Use the current-session-to-JWT action to prove whether /Agent/Account/QuickLogin can mint a JWT from this session.'
      : 'Log in through the normal QuickLogin flow first, then re-run the inspection.',
    step: {
      name: 'inspect',
      status: 'completed',
      summary: 'Current source session, JWT, and endpoint conventions inspected.',
    },
    summary: {
      requestUsesWebServiceProxy: true,
      activeLoginFlow: {
        loginPage: '/login',
        quickLoginComponent: 'src/components/quickLogin/QuickLogin.jsx',
        quickLoginSessionRoute: '/api/auth/quickLogin/session',
        quickLoginSessionUpstreamPath: getNeuronSwitchEndpointDefinition('quickLoginSessionStart')?.path || null,
        quickLoginTokenRoute: '/api/auth/quickLogin/token',
        quickLoginTokenUpstreamPath: getNeuronSwitchEndpointDefinition('quickLoginToken')?.path || null,
        appPostLoginAuthMode: 'HttpSessionID cookie on the Neuro Admin domain is used by middleware and most Next API routes.',
        jwtUsageMode: 'AgentAPI.Token is only actively used by the QuickLogin component and debug tooling.',
        deadOrUnusedRoutes: [
          'src/app/api/remote/prepare/route.js',
          'src/app/api/remote/trigger/route.js',
          'src/app/api/remote/refresh/route.js',
          'src/app/api/remote/references/route.js',
          'src/app/api/auth/quickLogin/account/route.js',
        ],
      },
      currentAuth: {
        sourceHost,
        targetHost,
        sourceSessionCookieExists: Boolean(sourceSessionCookieValue),
        sourceJwt: clientJwtSummary,
        storedSourceDebugJwt: storedSourceDebugJwtSummary,
        targetDebugSessionExists: Boolean(storedTargetSessionCookie),
        targetDebugJwt: storedTargetJwtSummary,
        incomingCookieNames: requestCookieNames,
        browserTransport: clientAuth?.transport || 'browser->neuro-admin-web-service->neuron',
      },
      sourceTargetSessionSeparation: {
        currentAppSessionCookieName: 'HttpSessionID',
        sourceSessionStoredOnAppDomain: true,
        targetSessionStoredSeparatelyInDebugFlow: Boolean(storedTargetSessionCookie),
        existingAppFlowSeparatesSourceAndTargetSessions: false,
        debugFlowSeparatesSourceAndTargetSessions: true,
      },
      requestSignatureAudit: {
        requestSignatureExistsInInstalledClient: true,
        usedByCurrentQuickLoginSwitchFlow: false,
        note: 'RequestSignature is unrelated to the QuickLogin JWT/session flow and is treated as dead code for this debug task.',
      },
    },
  };
}

// Architecture notes for this debug-only flow:
// - PrepareRemoteQuickLogin gets the Legal ID from the current authenticated source session or JWT.
// - RemoteQuickLogin triggers or resumes a session-based login on the target Neuron.
// - RemoteQuickLogin does not return a JWT; it only affects the target HTTP session.
// - /Agent/Account/QuickLogin converts the current QuickLogin session into a JWT.
// - The real Neuro Admin production-like proof is the .ws script call, not /Agent/Account/Info.
// - When calls are proxied through Neuro Admin, session-cookie continuity between trigger and the target .ws call is the critical variable.
// - If that session model is impractical in production, /RemoteLogin with trusted credentials or mTLS is the later fallback to evaluate.
async function runCurrentJwt({
  switchAttemptId,
  logs,
  sourceHost,
  seconds,
  sourceSessionCookieValue,
  sourceJwtCookieName,
  cookieWrites,
  apiTrace,
}) {
  if (!sourceSessionCookieValue) {
    logSwitchDebug(logs, switchAttemptId, 'Current QuickLogin to JWT conversion aborted because no source HttpSessionID cookie was available.', {
      sourceHost,
      cookieExists: false,
      cookieNames: [],
    });

    return {
      ok: false,
      httpStatus: 400,
      finalStatus: NEURON_SWITCH_DEBUG_STATUSES.SOURCE_SESSION_MISSING,
      observedStatuses: [NEURON_SWITCH_DEBUG_STATUSES.SOURCE_SESSION_MISSING],
      diagnosis: 'The current QuickLogin session cookie is missing, so /Agent/Account/QuickLogin cannot convert it into a JWT.',
      recommendation: 'Establish a normal QuickLogin session first, then retry current-session JWT conversion.',
      step: {
        name: 'current-jwt',
        status: 'failed',
        summary: 'No source session cookie was available for current-session JWT conversion.',
      },
      summary: {
        sourceHost,
        sourceSessionCookieExists: false,
      },
    };
  }

  const responseInfo = await callNeuronJson({
    switchAttemptId,
    logs,
    host: sourceHost,
    endpointKey: 'quickLoginToken',
    payload: { seconds },
    requestSummary: { seconds },
    label: 'Current QuickLogin -> JWT',
    sessionCookieValue: sourceSessionCookieValue,
    apiTrace,
  });

  if (!responseInfo.ok || typeof responseInfo.body?.jwt !== 'string' || !responseInfo.body.jwt) {
    return {
      ok: false,
      httpStatus: responseInfo.httpStatus,
      finalStatus: NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST,
      observedStatuses: [
        NEURON_SWITCH_DEBUG_STATUSES.SOURCE_SESSION_FOUND,
        NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST,
      ],
      diagnosis: 'The current QuickLogin session exists on Neuro Admin, but /Agent/Account/QuickLogin did not mint a JWT from the forwarded session cookie.',
      recommendation: 'Compare the app-domain HttpSessionID with the cookie forwarded to the source Neuron. This is evidence that the source session cookie is not being preserved or accepted end-to-end.',
      step: {
        name: 'current-jwt',
        status: 'failed',
        summary: 'Current-session /Agent/Account/QuickLogin did not return a JWT.',
      },
      summary: {
        sourceHost,
        sourceSessionCookieExists: true,
        quickLoginResponseKeys: responseInfo.responseKeys,
        quickLoginErrorBody: responseInfo.errorBody,
      },
    };
  }

  queueDebugCookie(cookieWrites, sourceJwtCookieName, responseInfo.body.jwt);

  logSwitchDebug(logs, switchAttemptId, 'Stored current source JWT in a debug-only httpOnly cookie.', {
    sourceHost,
    jwtExists: true,
  });

  return {
    ok: true,
    httpStatus: 200,
    finalStatus: NEURON_SWITCH_DEBUG_STATUSES.SOURCE_JWT_CREATED,
    observedStatuses: [
      NEURON_SWITCH_DEBUG_STATUSES.SOURCE_SESSION_FOUND,
      NEURON_SWITCH_DEBUG_STATUSES.SOURCE_JWT_CREATED,
    ],
    jwt: responseInfo.body.jwt,
    diagnosis: 'The current QuickLogin session was successfully converted into a JWT.',
    recommendation: 'Use the minted JWT only for debug proof or source PrepareRemoteQuickLogin validation. Do not overwrite production AgentAPI.Token outside explicit debug testing.',
    step: {
      name: 'current-jwt',
      status: 'completed',
      summary: 'Current-session /Agent/Account/QuickLogin returned a JWT.',
    },
    summary: {
      sourceHost,
      sourceSessionCookieExists: true,
      userName: responseInfo.body.userName || null,
      expires: responseInfo.body.expires || null,
      jwt: summarizeJwt(responseInfo.body.jwt),
    },
  };
}

async function runPrepare({
  switchAttemptId,
  logs,
  sourceHost,
  sourceJwt,
  sourceSessionCookieValue,
  purpose,
  cookieWrites,
  legalIdCookieName,
  apiTrace,
}) {
  const responseInfo = await callNeuronJson({
    switchAttemptId,
    logs,
    host: sourceHost,
    endpointKey: 'prepareRemoteQuickLogin',
    payload: {},
    label: 'PrepareRemoteQuickLogin',
    bearerToken: sourceJwt,
    sessionCookieValue: sourceSessionCookieValue,
    apiTrace,
  });

  if (!responseInfo.ok || typeof responseInfo.body?.legalId !== 'string' || !responseInfo.body.legalId) {
    const sourceAuthStatuses = sourceSessionCookieValue
      ? [NEURON_SWITCH_DEBUG_STATUSES.SOURCE_SESSION_FOUND]
      : [];

    return {
      ok: false,
      httpStatus: responseInfo.httpStatus,
      finalStatus: !sourceSessionCookieValue && !sourceJwt
        ? NEURON_SWITCH_DEBUG_STATUSES.SOURCE_SESSION_MISSING
        : NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST,
      observedStatuses: !sourceSessionCookieValue && !sourceJwt
        ? [NEURON_SWITCH_DEBUG_STATUSES.SOURCE_SESSION_MISSING]
        : [...sourceAuthStatuses, NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST],
      diagnosis: 'PrepareRemoteQuickLogin failed: the current source QuickLogin session or JWT was not accepted, or the wrong endpoint/session context was used.',
      recommendation: 'Verify the active source host and compare this result with current-session JWT conversion. If the source session exists but prepare still fails, the authenticated session or JWT context is not being preserved the way Peter described.',
      step: {
        name: 'prepare',
        status: 'failed',
        summary: 'PrepareRemoteQuickLogin did not return a legalId.',
      },
      summary: {
        purpose,
        sourceHost,
        hasSourceSessionCookie: Boolean(sourceSessionCookieValue),
        hasSourceJwt: Boolean(sourceJwt),
        prepareResponseKeys: responseInfo.responseKeys,
        prepareErrorBody: responseInfo.errorBody,
      },
    };
  }

  queueDebugCookie(cookieWrites, legalIdCookieName, responseInfo.body.legalId);

  logSwitchDebug(logs, switchAttemptId, 'Stored redacted legalId in a debug-only cookie for the next remote step.', {
    sourceHost,
  });

  return {
    ok: true,
    httpStatus: 200,
    finalStatus: NEURON_SWITCH_DEBUG_STATUSES.PREPARE_REMOTE_OK,
    observedStatuses: [NEURON_SWITCH_DEBUG_STATUSES.PREPARE_REMOTE_OK],
    legalId: responseInfo.body.legalId,
    diagnosis: 'PrepareRemoteQuickLogin returned a legalId from the current source authentication context.',
    recommendation: 'Proceed to RemoteQuickLogin on the target Neuron with the same switchAttemptId.',
    step: {
      name: 'prepare',
      status: 'completed',
      summary: 'PrepareRemoteQuickLogin returned a legalId.',
    },
    summary: {
      sourceHost,
      legalId: redactLegalId(responseInfo.body.legalId),
      hasSourceSessionCookie: Boolean(sourceSessionCookieValue),
      hasSourceJwt: Boolean(sourceJwt),
      prepareResponseKeys: responseInfo.responseKeys,
    },
  };
}

async function runRemoteReferences({
  switchAttemptId,
  logs,
  sourceHost,
  sourceJwt,
  sourceSessionCookieValue,
  apiTrace,
}) {
  const observedStatuses = [];

  if (!sourceSessionCookieValue) {
    logSwitchDebug(logs, switchAttemptId, 'RemoteReferences test aborted because no source HttpSessionID cookie was available.', {
      sourceHost,
      cookieExists: false,
      cookieNames: [],
      jwtExists: Boolean(sourceJwt),
    });

    return {
      ok: false,
      httpStatus: 400,
      finalStatus: NEURON_SWITCH_DEBUG_STATUSES.SOURCE_SESSION_MISSING,
      observedStatuses: [NEURON_SWITCH_DEBUG_STATUSES.SOURCE_SESSION_MISSING],
      diagnosis: 'The current QuickLogin session cookie is missing, so /Agent/Account/RemoteReferences cannot be tested through the source session-cookie path.',
      recommendation: 'Establish a normal QuickLogin session first, then re-run the RemoteReferences test. If you also want the JWT comparison, run the current-session JWT action first.',
      step: {
        name: 'remote-references',
        status: 'failed',
        summary: 'No source session cookie was available for the RemoteReferences test.',
      },
      summary: {
        sourceHost,
        sourceSessionCookieExists: false,
        sourceJwtExists: Boolean(sourceJwt),
      },
    };
  }

  observedStatuses.push(NEURON_SWITCH_DEBUG_STATUSES.SOURCE_SESSION_FOUND);

  const sessionResult = await callNeuronJson({
    switchAttemptId,
    logs,
    host: sourceHost,
    endpointKey: 'remoteReferences',
    payload: {},
    label: 'RemoteReferences via current session',
    sessionCookieValue: sourceSessionCookieValue,
    cookieSource: 'current-source-HttpSessionID',
    apiTrace,
  });

  const sessionStatus = sessionResult.ok
    ? NEURON_SWITCH_DEBUG_STATUSES.REMOTE_REFERENCES_SESSION_OK
    : NEURON_SWITCH_DEBUG_STATUSES.REMOTE_REFERENCES_SESSION_REJECTED;
  observedStatuses.push(sessionStatus);

  let jwtResult = null;
  let jwtStatus = null;

  if (sourceJwt) {
    jwtResult = await callNeuronJson({
      switchAttemptId,
      logs,
      host: sourceHost,
      endpointKey: 'remoteReferences',
      payload: {},
      label: 'RemoteReferences via source JWT',
      bearerToken: sourceJwt,
      apiTrace,
    });

    jwtStatus = jwtResult.ok
      ? NEURON_SWITCH_DEBUG_STATUSES.REMOTE_REFERENCES_JWT_OK
      : NEURON_SWITCH_DEBUG_STATUSES.REMOTE_REFERENCES_JWT_REJECTED;
    observedStatuses.push(jwtStatus);
  }

  const sessionDomains = extractRemoteReferenceDomains(sessionResult.body);
  const jwtDomains = extractRemoteReferenceDomains(jwtResult?.body);

  const finalStatus = jwtStatus || sessionStatus;
  const sessionRejected = !sessionResult.ok;
  const jwtRejected = sourceJwt ? !jwtResult?.ok : false;

  return {
    ok: sessionResult.ok || Boolean(jwtResult?.ok),
    httpStatus: jwtResult?.httpStatus || sessionResult.httpStatus || 200,
    finalStatus,
    observedStatuses,
    diagnosis: buildRemoteReferencesDiagnosis({
      sessionResult,
      jwtResult,
      sourceJwtExists: Boolean(sourceJwt),
    }),
    recommendation: buildRemoteReferencesRecommendation({
      sessionResult,
      jwtResult,
      sourceJwtExists: Boolean(sourceJwt),
    }),
    step: {
      name: 'remote-references',
      status: sessionRejected && (!sourceJwt || jwtRejected) ? 'failed' : 'completed',
      summary: sourceJwt
        ? 'Tested /Agent/Account/RemoteReferences with the current session cookie and the optional source JWT.'
        : 'Tested /Agent/Account/RemoteReferences with the current session cookie.',
    },
    summary: {
      sourceHost,
      sourceSessionCookieExists: true,
      sourceJwtExists: Boolean(sourceJwt),
      sessionRemoteReferencesStatus: sessionResult.httpStatus,
      sessionRemoteReferencesResponseKeys: sessionResult.responseKeys,
      sessionRemoteReferencesResponseBody: sanitizePlainPayload(sessionResult.body),
      sessionRemoteReferenceDomains: sessionDomains,
      jwtRemoteReferencesStatus: jwtResult?.httpStatus || null,
      jwtRemoteReferencesResponseKeys: jwtResult?.responseKeys || [],
      jwtRemoteReferencesResponseBody: sanitizePlainPayload(jwtResult?.body ?? null),
      jwtRemoteReferenceDomains: jwtDomains,
    },
  };
}

async function runTrigger({
  switchAttemptId,
  logs,
  targetHost,
  purpose,
  cookieStore,
  cookieWrites,
  legalIdCookieName,
  targetSessionCookieName,
  preparedLegalId,
  storedTargetSessionCookie,
  tabId,
  apiTrace,
}) {
  const legalId = preparedLegalId || cookieStore.get(legalIdCookieName)?.value || null;

  if (!legalId) {
    logSwitchDebug(logs, switchAttemptId, 'RemoteQuickLogin aborted because no prepared legalId was available.', {
      targetHost,
    });

    return {
      ok: false,
      httpStatus: 400,
      finalStatus: NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST,
      observedStatuses: [NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST],
      diagnosis: 'No prepared legalId was available for RemoteQuickLogin. The source prepare step must succeed first.',
      recommendation: 'Run PrepareRemoteQuickLogin again with the same switchAttemptId before triggering the target login.',
      step: {
        name: 'trigger',
        status: 'failed',
        summary: 'No prepared legalId was available for RemoteQuickLogin.',
      },
      summary: {
        targetHost,
      },
    };
  }

  const responseInfo = await callNeuronJson({
    switchAttemptId,
    logs,
    host: targetHost,
    endpointKey: 'remoteQuickLogin',
    payload: {
      legalId,
      purpose,
      ...(tabId ? { tabId } : {}),
    },
    requestSummary: {
      legalId: redactLegalId(legalId),
      purpose,
      tabId: tabId || null,
    },
    label: 'RemoteQuickLogin',
    sessionCookieValue: storedTargetSessionCookie,
    apiTrace,
  });

  const responseBody = responseInfo.body && typeof responseInfo.body === 'object'
    ? responseInfo.body
    : {};

  const loggedIn = responseBody.loggedIn === true;
  const petitionSent = responseBody.petitionSent === true;
  const cookieCaptured = Boolean(responseInfo.setCookieInfo.sessionCookieValue);
  const targetSessionStatuses = [];

  if (storedTargetSessionCookie) {
    targetSessionStatuses.push(NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_COOKIE_REUSED);
  }

  if (cookieCaptured) {
    targetSessionStatuses.push(NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_COOKIE_CAPTURED);
  }

  if (cookieCaptured) {
    queueDebugCookie(cookieWrites, targetSessionCookieName, responseInfo.setCookieInfo.sessionCookieValue);

    logSwitchDebug(logs, switchAttemptId, 'Target session cookie captured and stored as a debug-only app cookie.', {
      targetHost,
      setCookieExists: true,
      cookieNames: responseInfo.setCookieInfo.cookieNames,
    });
  } else {
    logSwitchDebug(logs, switchAttemptId, 'Target response did not provide a new HttpSessionID cookie.', {
      targetHost,
      setCookieExists: false,
      cookieNames: responseInfo.setCookieInfo.cookieNames,
    });
  }

  if (!responseInfo.ok) {
    return {
      ok: false,
      httpStatus: responseInfo.httpStatus,
      finalStatus: NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST,
      observedStatuses: combineObservedStatuses(
        { observedStatuses: targetSessionStatuses },
        { observedStatuses: [NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST] },
      ),
      diagnosis: 'RemoteQuickLogin failed before a usable target session could be confirmed.',
      recommendation: 'Inspect the target Neuron response and target session-cookie handling. If the target session cannot be captured or reused through Neuro Admin, Peter’s session-cookie model is failing in this architecture.',
      step: {
        name: 'trigger',
        status: 'failed',
        summary: 'RemoteQuickLogin request failed.',
      },
      summary: {
        targetHost,
        loggedIn,
        petitionSent,
        remoteResponseKeys: responseInfo.responseKeys,
        remoteErrorBody: responseInfo.errorBody,
        hasTargetSessionCookie: cookieCaptured || Boolean(storedTargetSessionCookie),
      },
    };
  }

  if (loggedIn) {
    return {
      ok: true,
      httpStatus: 200,
      finalStatus: NEURON_SWITCH_DEBUG_STATUSES.REMOTE_ALREADY_LOGGED_IN,
      observedStatuses: combineObservedStatuses(
        { observedStatuses: targetSessionStatuses },
        { observedStatuses: [NEURON_SWITCH_DEBUG_STATUSES.REMOTE_ALREADY_LOGGED_IN] },
      ),
      diagnosis: 'The target Neuron reports that the target session is already logged in.',
      recommendation: 'Proceed directly to the target .ws script session test. JWT conversion remains optional diagnostics.',
      step: {
        name: 'trigger',
        status: 'completed',
        summary: 'RemoteQuickLogin reports the target session is already logged in.',
      },
      summary: {
        targetHost,
        loggedIn,
        petitionSent,
        remoteResponseKeys: responseInfo.responseKeys,
        hasTargetSessionCookie: cookieCaptured || Boolean(storedTargetSessionCookie),
      },
    };
  }

  if (petitionSent) {
    logSwitchDebug(logs, switchAttemptId, 'Remote petition sent. Waiting for manual approval before testing the target .ws script session.', {
      targetHost,
      status: 200,
      targetSessionCookieExists: cookieCaptured || Boolean(storedTargetSessionCookie),
    });

    return {
      ok: true,
      httpStatus: 200,
      finalStatus: NEURON_SWITCH_DEBUG_STATUSES.REMOTE_PETITION_SENT,
      observedStatuses: combineObservedStatuses(
        { observedStatuses: targetSessionStatuses },
        { observedStatuses: [NEURON_SWITCH_DEBUG_STATUSES.REMOTE_PETITION_SENT] },
      ),
      diagnosis: 'RemoteQuickLogin reached the target Neuron and sent a petition. Manual approval is now required before the captured target session can be tested against a real Neuro Admin .ws script.',
      recommendation: 'Approve the petition in the app, then run the target .ws script session test with the same switchAttemptId. Convert to JWT only as optional diagnostics.',
      step: {
        name: 'trigger',
        status: 'completed',
        summary: 'RemoteQuickLogin sent a petition to the user.',
      },
      summary: {
        targetHost,
        loggedIn,
        petitionSent,
        remoteResponseKeys: responseInfo.responseKeys,
        hasTargetSessionCookie: cookieCaptured || Boolean(storedTargetSessionCookie),
      },
    };
  }

  return {
    ok: false,
    httpStatus: 200,
    finalStatus: NEURON_SWITCH_DEBUG_STATUSES.REMOTE_LOGIN_API_MAY_BE_NEEDED,
    observedStatuses: combineObservedStatuses(
      { observedStatuses: targetSessionStatuses },
      {
        observedStatuses: [
          NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST,
          NEURON_SWITCH_DEBUG_STATUSES.REMOTE_LOGIN_API_MAY_BE_NEEDED,
        ],
      },
    ),
    diagnosis: 'RemoteQuickLogin neither logged in the target session nor sent a petition. The target domain config or the proxy/session architecture may be wrong for this flow.',
    recommendation: 'Verify the target host and whether the target session cookie can survive the proxy flow. If repeated tests still cannot preserve a usable target session, Remote Login API may be needed later as a session-free fallback.',
    step: {
      name: 'trigger',
      status: 'failed',
      summary: 'RemoteQuickLogin neither logged in the target session nor sent a petition.',
    },
    summary: {
      targetHost,
      loggedIn,
      petitionSent,
      remoteResponseKeys: responseInfo.responseKeys,
      hasTargetSessionCookie: cookieCaptured || Boolean(storedTargetSessionCookie),
    },
  };
}

async function runConvertTarget({
  switchAttemptId,
  logs,
  targetHost,
  seconds,
  cookieWrites,
  targetSessionCookieName,
  targetJwtCookieName,
  storedTargetSessionCookie,
  apiTrace,
}) {
  if (!storedTargetSessionCookie) {
    logSwitchDebug(logs, switchAttemptId, 'Target-session JWT conversion aborted because no target debug session cookie was available.', {
      targetHost,
      cookieExists: false,
      cookieNames: [targetSessionCookieName],
    });

    return {
      ok: false,
      httpStatus: 400,
      finalStatus: NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_COOKIE_MISSING,
      observedStatuses: [NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_COOKIE_MISSING],
      diagnosis: 'No target session cookie is available for /Agent/Account/QuickLogin. The target session was not captured or was lost before JWT conversion.',
      recommendation: 'Fix target-session cookie capture and reuse between RemoteQuickLogin and target-session JWT conversion.',
      step: {
        name: 'convert-target',
        status: 'failed',
        summary: 'No target session cookie was available for target-session JWT conversion.',
      },
      summary: {
        targetHost,
        targetSessionCookieName,
      },
    };
  }

  const responseInfo = await callNeuronJson({
    switchAttemptId,
    logs,
    host: targetHost,
    endpointKey: 'quickLoginToken',
    payload: { seconds },
    requestSummary: { seconds },
    label: 'Target QuickLogin -> JWT',
    sessionCookieValue: storedTargetSessionCookie,
    apiTrace,
  });

  if (responseInfo.setCookieInfo.sessionCookieValue) {
    queueDebugCookie(cookieWrites, targetSessionCookieName, responseInfo.setCookieInfo.sessionCookieValue);

    logSwitchDebug(logs, switchAttemptId, 'Updated target debug session cookie after target-session /Agent/Account/QuickLogin.', {
      targetHost,
      setCookieExists: true,
      cookieNames: responseInfo.setCookieInfo.cookieNames,
    });
  }

  if (!responseInfo.ok || typeof responseInfo.body?.jwt !== 'string' || !responseInfo.body.jwt) {
    return {
      ok: false,
      httpStatus: responseInfo.httpStatus,
      finalStatus: NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST,
      observedStatuses: combineObservedStatuses(
        {
          observedStatuses: [
            NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_COOKIE_REUSED,
            responseInfo.setCookieInfo.sessionCookieValue
              ? NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_COOKIE_CAPTURED
              : null,
          ].filter(Boolean),
        },
        {
          observedStatuses: [
            NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST,
            NEURON_SWITCH_DEBUG_STATUSES.REMOTE_LOGIN_API_MAY_BE_NEEDED,
          ],
        },
      ),
      diagnosis: 'The target session reached /Agent/Account/QuickLogin, but no target JWT was returned.',
      recommendation: 'Inspect whether the exact same target HttpSessionID is being reused and whether the upstream response indicates that the target session was never fully established or was replaced.',
      step: {
        name: 'convert-target',
        status: 'failed',
        summary: 'Target-session /Agent/Account/QuickLogin did not return a JWT.',
      },
      summary: {
        targetHost,
        quickLoginResponseKeys: responseInfo.responseKeys,
        quickLoginErrorBody: responseInfo.errorBody,
      },
    };
  }

  queueDebugCookie(cookieWrites, targetJwtCookieName, responseInfo.body.jwt);

  logSwitchDebug(logs, switchAttemptId, 'Stored target JWT in a debug-only httpOnly cookie.', {
    targetHost,
    jwtExists: true,
  });

  return {
    ok: true,
    httpStatus: 200,
    finalStatus: NEURON_SWITCH_DEBUG_STATUSES.TARGET_JWT_CREATED,
    observedStatuses: combineObservedStatuses(
      {
        observedStatuses: [
          NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_COOKIE_REUSED,
          responseInfo.setCookieInfo.sessionCookieValue
            ? NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_COOKIE_CAPTURED
            : null,
        ].filter(Boolean),
      },
      { observedStatuses: [NEURON_SWITCH_DEBUG_STATUSES.TARGET_JWT_CREATED] },
    ),
    diagnosis: 'Target-session /Agent/Account/QuickLogin returned a JWT for the target Neuron.',
    recommendation: 'Use the target JWT only for harmless proof calls until the full flow is proven.',
    step: {
      name: 'convert-target',
      status: 'completed',
      summary: 'Target-session /Agent/Account/QuickLogin returned a JWT.',
    },
    summary: {
      targetHost,
      userName: responseInfo.body.userName || null,
      expires: responseInfo.body.expires || null,
      jwt: summarizeJwt(responseInfo.body.jwt),
      quickLoginResponseKeys: responseInfo.responseKeys,
    },
  };
}

async function runTargetSessionProof({
  switchAttemptId,
  logs,
  targetHost,
  hostUsed,
  targetScriptPath = DEFAULT_TARGET_SCRIPT_PATH,
  targetSessionCookieName,
  storedTargetSessionCookie,
  sourceSessionCookieValue,
  apiTrace,
}) {
  if (hostUsed !== targetHost) {
    logSwitchDebug(logs, switchAttemptId, 'Target session proof blocked because the host used did not match targetHost.', {
      targetHost,
      hostUsed,
      targetScriptPath,
      cookieSource: 'debug-target-session',
    });

    return {
      ok: false,
      httpStatus: 400,
      finalStatus: NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_TEST_USED_WRONG_HOST,
      observedStatuses: [NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_TEST_USED_WRONG_HOST],
      diagnosis: 'The target session test was blocked because it would not call the selected target host.',
      recommendation: 'Use targetHost for target session validation. Do not let static AGENT_HOST decide this proof call.',
      step: {
        name: 'target-session-proof',
        status: 'failed',
        summary: 'Target session proof used the wrong host.',
      },
      summary: {
        targetHost,
        hostUsed,
        targetScriptPath,
        cookieSource: 'debug-target-session',
      },
    };
  }

  if (!storedTargetSessionCookie) {
    logSwitchDebug(logs, switchAttemptId, 'Target session proof aborted because no target debug session cookie was available.', {
      targetHost,
      hostUsed,
      targetScriptPath,
      cookieSource: 'missing',
      cookieExists: false,
      cookieNames: [targetSessionCookieName],
    });

    return {
      ok: false,
      httpStatus: 400,
      finalStatus: NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_COOKIE_MISSING,
      observedStatuses: [NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_COOKIE_MISSING],
      diagnosis: 'No captured target session cookie is available. The target session proof cannot run.',
      recommendation: 'Run RemoteQuickLogin first, approve the petition if needed, then run the target .ws script session test with the same switchAttemptId.',
      step: {
        name: 'target-session-proof',
        status: 'failed',
        summary: 'No target session cookie was available for the target authenticated call.',
      },
      summary: {
        targetHost,
        hostUsed,
        targetScriptPath,
        cookieSource: 'missing',
        targetSessionCookieName,
      },
    };
  }

  if (sourceSessionCookieValue && storedTargetSessionCookie === sourceSessionCookieValue) {
    logSwitchDebug(logs, switchAttemptId, 'Target session proof blocked because it would reuse the normal source HttpSessionID.', {
      targetHost,
      hostUsed,
      targetScriptPath,
      cookieSource: 'normal-source-HttpSessionID',
      cookieExists: true,
      cookieNames: ['HttpSessionID'],
    });

    return {
      ok: false,
      httpStatus: 400,
      finalStatus: NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_TEST_USED_SOURCE_COOKIE,
      observedStatuses: [NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_TEST_USED_SOURCE_COOKIE],
      diagnosis: 'The target session test was blocked because the cookie matched the normal/source HttpSessionID.',
      recommendation: 'Use only the debug target session cookie captured from RemoteQuickLogin for the target proof call.',
      step: {
        name: 'target-session-proof',
        status: 'failed',
        summary: 'Target session proof attempted to use the source session cookie.',
      },
      summary: {
        targetHost,
        hostUsed,
        targetScriptPath,
        cookieSource: 'normal-source-HttpSessionID',
      },
    };
  }

  const responseInfo = await callNeuronScript({
    switchAttemptId,
    logs,
    host: hostUsed,
    scriptPath: targetScriptPath,
    payload: {},
    label: 'Target script authenticated call',
    sessionCookieValue: storedTargetSessionCookie,
    cookieSource: 'debug-target-session',
    apiTrace,
  });

  if (!responseInfo.ok) {
    return {
      ok: false,
      httpStatus: responseInfo.httpStatus,
      finalStatus: NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST,
      observedStatuses: [
        NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_COOKIE_REUSED,
        NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST,
      ],
      diagnosis: 'The target session cookie was reused against the target host, but the real Neuro Admin .ws script call failed.',
      recommendation: 'Inspect the target response body. This means the cookie exists, but it is not accepted by the target .ws script session flow.',
      step: {
        name: 'target-session-proof',
        status: 'failed',
        summary: 'The target session cookie did not authenticate the target .ws script call.',
      },
      summary: {
        targetHost,
        hostUsed,
        endpointPath: targetScriptPath,
        responseKeys: responseInfo.responseKeys,
        errorBody: responseInfo.errorBody,
        cookieSource: 'debug-target-session',
      },
    };
  }

  logSwitchDebug(logs, switchAttemptId, 'Target script session proof call succeeded.', {
    targetHost,
    hostUsed,
    endpointPath: targetScriptPath,
    status: responseInfo.httpStatus,
    responseKeys: responseInfo.responseKeys,
    cookieSource: 'debug-target-session',
  });

  return {
    ok: true,
    httpStatus: 200,
    finalStatus: NEURON_SWITCH_DEBUG_STATUSES.END_TO_END_SWITCH_WORKS_WITH_SESSION,
    observedStatuses: [
      NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_COOKIE_REUSED,
      NEURON_SWITCH_DEBUG_STATUSES.END_TO_END_SWITCH_WORKS_WITH_SESSION,
    ],
    diagnosis: 'The captured target session cookie authenticated a real Neuro Admin .ws script call against the selected target Neuron. This proves the production-like session-cookie switch path works.',
    recommendation: 'Treat JWT conversion as optional diagnostics unless a production feature proves it needs bearer auth.',
    step: {
      name: 'target-session-proof',
      status: 'completed',
      summary: 'The captured target session cookie authenticated against the target .ws script.',
    },
    summary: {
      targetHost,
      hostUsed,
      endpointPath: targetScriptPath,
      responseKeys: responseInfo.responseKeys,
      cookieSource: 'debug-target-session',
    },
  };
}

async function runProof({
  switchAttemptId,
  logs,
  targetHost,
  targetJwt,
  apiTrace,
}) {
  if (!targetJwt) {
    return {
      ok: false,
      httpStatus: 400,
      finalStatus: NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST,
      observedStatuses: [NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST],
      diagnosis: 'A target JWT was not available for the harmless proof call.',
      recommendation: 'Run target-session JWT conversion again before retrying the proof call.',
      step: {
        name: 'proof',
        status: 'failed',
        summary: 'No target JWT was available for the proof call.',
      },
      summary: {
        targetHost,
      },
    };
  }

  const responseInfo = await callNeuronJson({
    switchAttemptId,
    logs,
    host: targetHost,
    endpointKey: 'prepareRemoteQuickLogin',
    payload: {},
    label: 'Target JWT proof call',
    bearerToken: targetJwt,
    apiTrace,
  });

  if (!responseInfo.ok) {
    logSwitchDebug(logs, switchAttemptId, 'Target JWT proof call failed.', {
      targetHost,
      status: responseInfo.httpStatus,
      targetJwtUsable: false,
    });

    return {
      ok: false,
      httpStatus: responseInfo.httpStatus,
      finalStatus: NEURON_SWITCH_DEBUG_STATUSES.TARGET_JWT_CREATED_BUT_NOT_USABLE,
      observedStatuses: [
        NEURON_SWITCH_DEBUG_STATUSES.TARGET_JWT_CREATED,
        NEURON_SWITCH_DEBUG_STATUSES.TARGET_JWT_CREATED_BUT_NOT_USABLE,
      ],
      diagnosis: 'A target JWT was minted, but the harmless proof call did not succeed.',
      recommendation: 'Inspect the decoded target JWT claims and target Neuron response before relying on this token in production logic.',
      step: {
        name: 'proof',
        status: 'failed',
        summary: 'The harmless proof call using the target JWT failed.',
      },
      summary: {
        targetHost,
        proofResponseKeys: responseInfo.responseKeys,
        proofErrorBody: responseInfo.errorBody,
      },
    };
  }

  logSwitchDebug(logs, switchAttemptId, 'Target JWT proof call succeeded.', {
    targetHost,
    status: responseInfo.httpStatus,
    targetJwtUsable: true,
  });

  return {
    ok: true,
    httpStatus: 200,
    finalStatus: NEURON_SWITCH_DEBUG_STATUSES.END_TO_END_SWITCH_WORKS_WITH_JWT,
    observedStatuses: [
      NEURON_SWITCH_DEBUG_STATUSES.TARGET_JWT_CREATED,
      NEURON_SWITCH_DEBUG_STATUSES.END_TO_END_SWITCH_WORKS_WITH_JWT,
    ],
    diagnosis: 'The optional JWT diagnostic succeeded: the target session was converted into a JWT, and that JWT authenticated a harmless target Neuron call.',
    recommendation: 'JWT conversion works for this target session, but production switching can still use session-cookie auth unless a feature specifically requires bearer auth.',
    step: {
      name: 'proof',
      status: 'completed',
      summary: 'A harmless authenticated proof call succeeded with the target JWT.',
    },
    summary: {
      targetHost,
      proofResponseKeys: responseInfo.responseKeys,
      proofLegalId: redactLegalId(responseInfo.body?.legalId),
    },
  };
}

async function callNeuronJson({
  switchAttemptId,
  logs,
  host,
  endpointKey,
  payload,
  label,
  bearerToken,
  sessionCookieValue,
  requestSummary,
  cookieSource = sessionCookieValue ? 'provided-session-cookie' : 'none',
  apiTrace,
}) {
  const endpoint = getNeuronSwitchEndpointDefinition(endpointKey);
  const path = endpoint?.path || null;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(bearerToken ? { 'Authorization': `Bearer ${bearerToken}` } : {}),
    ...(sessionCookieValue ? { 'Cookie': buildHttpSessionCookie(sessionCookieValue) } : {}),
  };

  logSwitchDebug(logs, switchAttemptId, `${label} request.`, {
    host,
    path,
    cookieExists: Boolean(sessionCookieValue),
    cookieNames: sessionCookieValue ? ['HttpSessionID'] : [],
    cookieSource,
    jwtExists: Boolean(bearerToken),
    requestBody: sanitizePlainPayload(payload ?? {}),
  });

  try {
    const response = await fetch(buildNeuronSwitchUrl(host, endpointKey), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload ?? {}),
    });

    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => '');

    const setCookieHeader = response.headers.get('set-cookie');
    const setCookieInfo = extractSetCookieInfo(setCookieHeader);
    const responseKeys = getResponseKeys(body);

    logSwitchDebug(logs, switchAttemptId, `${label} response.`, {
      host,
      path,
      status: response.status,
      cookieExists: Boolean(sessionCookieValue),
      cookieNames: sessionCookieValue ? ['HttpSessionID'] : [],
      cookieSource,
      setCookieExists: setCookieInfo.hasSetCookie,
      setCookieNames: setCookieInfo.cookieNames,
      responseKeys,
      jwtExists: Boolean(body?.jwt),
      responseBody: sanitizePlainPayload(body),
    });

    apiTrace?.push({
      label,
      host,
      path,
      status: response.status,
      ok: response.ok,
      cookieExists: Boolean(sessionCookieValue),
      cookieNames: sessionCookieValue ? ['HttpSessionID'] : [],
      cookieSource,
      setCookieExists: setCookieInfo.hasSetCookie,
      setCookieNames: setCookieInfo.cookieNames,
      responseKeys,
      jwtExists: Boolean(body?.jwt),
      requestBody: sanitizePlainPayload(payload ?? {}),
      responseBody: sanitizePlainPayload(body),
    });

    return {
      ok: response.ok,
      httpStatus: response.status,
      body,
      responseKeys,
      errorBody: response.ok ? null : sanitizeErrorBody(body),
      setCookieInfo,
    };
  } catch (error) {
    logSwitchDebug(logs, switchAttemptId, `${label} network error.`, {
      host,
      path,
      status: 502,
      message: error.message || 'Unknown network error',
    });

    apiTrace?.push({
      label,
      host,
      path,
      status: 502,
      ok: false,
      cookieExists: Boolean(sessionCookieValue),
      cookieNames: sessionCookieValue ? ['HttpSessionID'] : [],
      cookieSource,
      setCookieExists: false,
      setCookieNames: [],
      responseKeys: [],
      jwtExists: false,
      requestBody: sanitizePlainPayload(payload ?? {}),
      responseBody: sanitizePlainPayload(error.message || 'Unknown network error'),
    });

    return {
      ok: false,
      httpStatus: 502,
      body: null,
      responseKeys: [],
      errorBody: sanitizeErrorBody(error.message || 'Unknown network error'),
      setCookieInfo: {
        hasSetCookie: false,
        cookieNames: [],
        sessionCookieValue: null,
      },
    };
  }
}

async function callNeuronScript({
  switchAttemptId,
  logs,
  host,
  scriptPath,
  payload = {},
  label,
  sessionCookieValue,
  cookieSource = sessionCookieValue ? 'provided-session-cookie' : 'none',
  apiTrace,
}) {
  const safeScriptPath = normalizeScriptPath(scriptPath);
  const path = safeScriptPath;
  const url = `https://${host}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(sessionCookieValue ? { 'Cookie': buildHttpSessionCookie(sessionCookieValue) } : {}),
  };

  logSwitchDebug(logs, switchAttemptId, `${label} request.`, {
    host,
    path,
    method: 'POST',
    cookieExists: Boolean(sessionCookieValue),
    cookieNames: sessionCookieValue ? ['HttpSessionID'] : [],
    cookieSource,
    jwtExists: false,
    requestBody: sanitizePlainPayload(payload),
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => '');

    const setCookieHeader = response.headers.get('set-cookie');
    const setCookieInfo = extractSetCookieInfo(setCookieHeader);
    const responseKeys = getResponseKeys(body);

    logSwitchDebug(logs, switchAttemptId, `${label} response.`, {
      host,
      path,
      status: response.status,
      contentType,
      cookieExists: Boolean(sessionCookieValue),
      cookieNames: sessionCookieValue ? ['HttpSessionID'] : [],
      cookieSource,
      setCookieExists: setCookieInfo.hasSetCookie,
      setCookieNames: setCookieInfo.cookieNames,
      responseKeys,
      jwtExists: false,
      responseBody: sanitizePlainPayload(body),
    });

    apiTrace?.push({
      label,
      host,
      path,
      status: response.status,
      ok: response.ok,
      contentType,
      cookieExists: Boolean(sessionCookieValue),
      cookieNames: sessionCookieValue ? ['HttpSessionID'] : [],
      cookieSource,
      setCookieExists: setCookieInfo.hasSetCookie,
      setCookieNames: setCookieInfo.cookieNames,
      responseKeys,
      jwtExists: false,
      requestBody: sanitizePlainPayload(payload),
      responseBody: sanitizePlainPayload(body),
    });

    return {
      ok: response.ok,
      httpStatus: response.status,
      body,
      responseKeys,
      errorBody: response.ok ? null : sanitizeErrorBody(body),
      setCookieInfo,
    };
  } catch (error) {
    logSwitchDebug(logs, switchAttemptId, `${label} network error.`, {
      host,
      path,
      status: 502,
      message: error.message || 'Unknown network error',
    });

    apiTrace?.push({
      label,
      host,
      path,
      status: 502,
      ok: false,
      contentType: null,
      cookieExists: Boolean(sessionCookieValue),
      cookieNames: sessionCookieValue ? ['HttpSessionID'] : [],
      cookieSource,
      setCookieExists: false,
      setCookieNames: [],
      responseKeys: [],
      jwtExists: false,
      requestBody: sanitizePlainPayload(payload),
      responseBody: sanitizePlainPayload(error.message || 'Unknown network error'),
    });

    return {
      ok: false,
      httpStatus: 502,
      body: null,
      responseKeys: [],
      errorBody: sanitizeErrorBody(error.message || 'Unknown network error'),
      setCookieInfo: {
        hasSetCookie: false,
        cookieNames: [],
        sessionCookieValue: null,
      },
    };
  }
}

function buildResponsePreview(body) {
  if (!body || typeof body !== 'object') {
    return typeof body === 'string' ? body.slice(0, 200) : body;
  }

  return {
    ...pick(body, ['loggedIn', 'petitionSent', 'userName', 'expires']),
    legalId: body.legalId ? redactLegalId(body.legalId) : undefined,
    jwt: body.jwt ? summarizeJwt(body.jwt) : undefined,
  };
}

function buildBrowserDirectBlockedResult({
  switchAttemptId,
  logs,
  sourceHost,
  targetHost,
}) {
  logSwitchDebug(logs, switchAttemptId, 'Browser-direct transport was requested, but this debug integration will not silently fall back to the proxy path.', {
    sourceHost,
    targetHost,
  });

  return {
    ok: false,
    httpStatus: 400,
    finalStatus: NEURON_SWITCH_DEBUG_STATUSES.APP_PROXY_PINNED_TO_STATIC_HOST,
    observedStatuses: [NEURON_SWITCH_DEBUG_STATUSES.APP_PROXY_PINNED_TO_STATIC_HOST],
    diagnosis: 'Browser-direct transport is not implemented in this debug flow. The current Neuro Admin login/session model is proxy-based, and silently falling back would hide the transport truth.',
    recommendation: 'Use backend-web-service/proxy transport for this truth-finding integration, or build a separate browser-direct path that explicitly handles CORS and cross-domain session cookies.',
    step: {
      name: 'transport-check',
      status: 'failed',
      summary: 'Browser-direct mode was selected, but no browser-direct implementation exists yet.',
    },
    summary: {
      sourceHost,
      targetHost,
      browserDirectImplemented: false,
    },
  };
}

function buildArchitectureAudit(sourceHost, targetHost) {
  const sourceDiffersFromStaticHost = Boolean(sourceHost && STATIC_AGENT_HOST && sourceHost !== STATIC_AGENT_HOST);
  const targetDiffersFromStaticHost = Boolean(targetHost && STATIC_AGENT_HOST && targetHost !== STATIC_AGENT_HOST);

  return {
    configuredStaticHost: STATIC_AGENT_HOST || null,
    sourceDiffersFromStaticHost,
    targetDiffersFromStaticHost,
    appProxyPinnedToStaticHost: sourceDiffersFromStaticHost || targetDiffersFromStaticHost,
    sourceAndTargetSessionsSeparatedInExistingAppFlow: false,
    sourceAndTargetSessionsSeparatedInDebugFlow: true,
    staticHostPinningNote: sourceDiffersFromStaticHost || targetDiffersFromStaticHost
      ? 'Parts of Neuro Admin still proxy to the configured static AGENT_HOST, so cross-Neuron switching can be masked by host pinning.'
      : 'The selected hosts match the configured static AGENT_HOST.',
  };
}

function buildHumanSummary(result) {
  const parts = [];

  if (result?.finalStatus === NEURON_SWITCH_DEBUG_STATUSES.SOURCE_SESSION_FOUND) {
    parts.push('Source session exists on Neuro Admin.');
  }

  if (result?.observedStatuses?.includes(NEURON_SWITCH_DEBUG_STATUSES.SOURCE_JWT_CREATED)) {
    parts.push('Source /Agent/Account/QuickLogin returned a JWT.');
  }

  if (result?.observedStatuses?.includes(NEURON_SWITCH_DEBUG_STATUSES.REMOTE_REFERENCES_SESSION_OK)) {
    parts.push('Source /Agent/Account/RemoteReferences accepted the current source session cookie.');
  }

  if (result?.observedStatuses?.includes(NEURON_SWITCH_DEBUG_STATUSES.REMOTE_REFERENCES_SESSION_REJECTED)) {
    parts.push('Source /Agent/Account/RemoteReferences rejected the current source session cookie.');
  }

  if (result?.observedStatuses?.includes(NEURON_SWITCH_DEBUG_STATUSES.REMOTE_REFERENCES_JWT_OK)) {
    parts.push('Source /Agent/Account/RemoteReferences accepted the optional source JWT.');
  }

  if (result?.observedStatuses?.includes(NEURON_SWITCH_DEBUG_STATUSES.REMOTE_REFERENCES_JWT_REJECTED)) {
    parts.push('Source /Agent/Account/RemoteReferences rejected the optional source JWT.');
  }

  if (result?.observedStatuses?.includes(NEURON_SWITCH_DEBUG_STATUSES.PREPARE_REMOTE_OK)) {
    parts.push('Source PrepareRemoteQuickLogin returned a legalId.');
  }

  if (result?.observedStatuses?.includes(NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_COOKIE_CAPTURED)) {
    parts.push('Target RemoteQuickLogin returned an HttpSessionID cookie and Neuro Admin captured it.');
  }

  if (result?.observedStatuses?.includes(NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_COOKIE_REUSED)) {
    parts.push('Neuro Admin reused the captured target HttpSessionID on the next target call.');
  }

  if (result?.finalStatus === NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_COOKIE_MISSING) {
    parts.push('No captured target session cookie was available for the target session test.');
  }

  if (result?.finalStatus === NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_TEST_USED_WRONG_HOST) {
    parts.push('The target session test was blocked because it was not using the selected target host.');
  }

  if (result?.finalStatus === NEURON_SWITCH_DEBUG_STATUSES.TARGET_SESSION_TEST_USED_SOURCE_COOKIE) {
    parts.push('The target session test was blocked because it would have used the normal source session cookie.');
  }

  if (result?.observedStatuses?.includes(NEURON_SWITCH_DEBUG_STATUSES.TARGET_JWT_CREATED)) {
    parts.push('Target /Agent/Account/QuickLogin returned a JWT.');
  }

  if (result?.observedStatuses?.includes(NEURON_SWITCH_DEBUG_STATUSES.END_TO_END_SWITCH_WORKS_WITH_SESSION)) {
    parts.push('The captured target session cookie authenticated a real target .ws script call.');
  }

  if (result?.finalStatus === NEURON_SWITCH_DEBUG_STATUSES.TARGET_JWT_CREATED_BUT_NOT_USABLE) {
    parts.push('The target JWT was created, but the harmless authenticated proof call failed.');
  }

  if (result?.finalStatus === NEURON_SWITCH_DEBUG_STATUSES.SESSION_COOKIE_LOST) {
    parts.push('The flow broke before a usable target session or target JWT was proven.');
  }

  if (result?.finalStatus === NEURON_SWITCH_DEBUG_STATUSES.END_TO_END_SWITCH_WORKS_WITH_SESSION) {
    parts.push('The production-like session-cookie .ws script switch flow worked end to end.');
  }

  if (result?.finalStatus === NEURON_SWITCH_DEBUG_STATUSES.END_TO_END_SWITCH_WORKS_WITH_JWT) {
    parts.push('The optional target JWT diagnostic worked end to end.');
  }

  if (result?.diagnosis) {
    parts.push(result.diagnosis);
  }

  return parts;
}

function sanitizePlainPayload(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return truncatePlain(value, 1200);
  if (typeof value !== 'object') return value;
  return sanitizeErrorBody(value);
}

function extractRemoteReferenceDomains(body) {
  const rawReferences = body?.References ?? body?.references ?? body?.items ?? body;
  const records = Array.isArray(rawReferences)
    ? rawReferences
    : rawReferences && typeof rawReferences === 'object'
      ? Array.isArray(rawReferences.Reference)
        ? rawReferences.Reference
        : [rawReferences]
      : [];

  return [...new Set(records
    .map((value) => {
      if (typeof value === 'string') return normalizeHost(value);
      if (!value || typeof value !== 'object') return '';
      return normalizeHost(value.domain || value.Domain || value.host || value.remoteHost || '');
    })
    .filter(Boolean))];
}

function buildRemoteReferencesDiagnosis({ sessionResult, jwtResult, sourceJwtExists }) {
  if (sessionResult.ok && !sourceJwtExists) {
    return 'The current source session cookie authenticated /Agent/Account/RemoteReferences. No optional source JWT comparison was run yet.';
  }

  if (sessionResult.ok && jwtResult?.ok) {
    return 'Both the current source session cookie and the optional source JWT authenticated /Agent/Account/RemoteReferences.';
  }

  if (!sessionResult.ok && jwtResult?.ok) {
    return 'The current source session cookie was rejected by /Agent/Account/RemoteReferences, but the optional source JWT was accepted.';
  }

  if (sessionResult.ok && sourceJwtExists && jwtResult && !jwtResult.ok) {
    return 'The current source session cookie was accepted by /Agent/Account/RemoteReferences, but the optional source JWT was rejected.';
  }

  if (!sessionResult.ok && sourceJwtExists && jwtResult && !jwtResult.ok) {
    return 'Both the current source session cookie and the optional source JWT were rejected by /Agent/Account/RemoteReferences.';
  }

  return 'The current source session cookie was rejected by /Agent/Account/RemoteReferences.';
}

function buildRemoteReferencesRecommendation({ sessionResult, jwtResult, sourceJwtExists }) {
  if (!sourceJwtExists) {
    return 'Run the current-session JWT action first if you want to compare the same /Agent/Account/RemoteReferences call with bearer auth.';
  }

  if (!sessionResult.ok && jwtResult?.ok) {
    return 'Compare this with PrepareRemoteQuickLogin. This isolates RemoteReferences as the endpoint rejecting the session-cookie path while bearer auth succeeds.';
  }

  if (!sessionResult.ok && jwtResult && !jwtResult.ok) {
    return 'Compare this with PrepareRemoteQuickLogin and RemoteQuickLogin. If those still work while RemoteReferences rejects both auth modes, report RemoteReferences as a separate backend authorization issue.';
  }

  if (sessionResult.ok && jwtResult && !jwtResult.ok) {
    return 'This indicates the current session-cookie path is accepted for RemoteReferences, while bearer auth is not required or not accepted for this endpoint.';
  }

  return 'Use this result as a baseline when comparing PrepareRemoteQuickLogin and RemoteQuickLogin on the same source host.';
}

function combineObservedStatuses(...results) {
  const merged = [];

  results.forEach((result) => {
    (result?.observedStatuses || []).forEach((status) => {
      if (status && !merged.includes(status)) {
        merged.push(status);
      }
    });
  });

  return merged;
}

function findLatestCookieValue(cookieWrites, cookieName) {
  for (let index = cookieWrites.length - 1; index >= 0; index -= 1) {
    const write = cookieWrites[index];

    if (write.name === cookieName && write.options?.maxAge !== 0) {
      return write.value;
    }
  }

  return null;
}

function getSourceJwt(body, request, storedSourceDebugJwt) {
  const bodyJwt = typeof body?.sourceJwt === 'string' ? body.sourceJwt.trim() : '';

  if (bodyJwt) return bodyJwt;

  const authHeader = request.headers.get('authorization') || '';

  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }

  return storedSourceDebugJwt || '';
}

function assertHost(host, fieldName) {
  if (!host || !validateHost(host)) {
    throw new Error(`Invalid or missing ${fieldName}.`);
  }
}

function normalizeAction(value) {
  if (!value) return '';

  const key = String(value).trim().toLowerCase().replace(/[^a-z-]/g, '');

  return ACTION_ALIASES[key] || '';
}

function normalizeHost(value) {
  if (!value || typeof value !== 'string') return '';

  return value.trim().toLowerCase();
}

function normalizeTransportMode(value) {
  return value === 'browser-direct' ? 'browser-direct' : DEFAULT_TRANSPORT_MODE;
}

function normalizeTabId(value) {
  if (typeof value !== 'string') return '';

  const trimmed = value.trim();

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)
    ? trimmed
    : '';
}

function normalizeScriptPath(value) {
  if (typeof value !== 'string') return DEFAULT_TARGET_SCRIPT_PATH;

  const trimmed = value.trim();

  if (!trimmed.startsWith('/')) return DEFAULT_TARGET_SCRIPT_PATH;
  if (trimmed.startsWith('/Agent/')) return DEFAULT_TARGET_SCRIPT_PATH;
  if (!trimmed.endsWith('.ws')) return DEFAULT_TARGET_SCRIPT_PATH;

  return trimmed;
}

function truncatePlain(value, maxLength) {
  const stringValue = String(value);

  return stringValue.length > maxLength ? `${stringValue.slice(0, maxLength)}...` : stringValue;
}
