'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createNeuronSwitchAttemptId,
  formatNeuronSwitchClientLog,
  getCurrentNeuronHost,
  getNeuronSwitchClientSnapshot,
  getNeuronSwitchTabId,
  summarizeJwtClient,
} from '@/lib/neuronSwitchClient';
import NeuronSwitchResultPanels from '@/components/debug/NeuronSwitchResultPanels';

const DEFAULT_PURPOSE = 'Neuro Admin remote login test';
const DEFAULT_SECONDS = '3600';

export default function NeuronSwitchDebugPage() {
  const [attemptId, setAttemptId] = useState('');
  const [sourceHost, setSourceHost] = useState('');
  const [targetHost, setTargetHost] = useState('');
  const [purpose, setPurpose] = useState(DEFAULT_PURPOSE);
  const [seconds, setSeconds] = useState(DEFAULT_SECONDS);
  const [transportMode, setTransportMode] = useState('backend-web-service/proxy');
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [logLines, setLogLines] = useState([]);
  const [responseData, setResponseData] = useState(null);
  const [clientSnapshot, setClientSnapshot] = useState(null);

  useEffect(() => {
    const currentHost = getCurrentNeuronHost();
    setAttemptId(createNeuronSwitchAttemptId());
    setSourceHost(currentHost);
    setClientSnapshot(getNeuronSwitchClientSnapshot());
  }, []);

  const decodedSourceJwt = useMemo(() => summarizeJwtClient(clientSnapshot?.sourceJwt), [clientSnapshot]);

  async function runAction(action, { freshAttempt = false } = {}) {
    const nextAttemptId = freshAttempt || !attemptId ? createNeuronSwitchAttemptId() : attemptId;
    const nextSnapshot = getNeuronSwitchClientSnapshot();
    const tabId = getNeuronSwitchTabId();
    const requestPayload = {
      action,
      switchAttemptId: nextAttemptId,
      sourceHost,
      targetHost,
      tabId,
      purpose,
      seconds: Number(seconds) || 3600,
      transportMode,
      sourceJwt: nextSnapshot.sourceJwt || '',
      clientAuth: {
        activeHost: nextSnapshot.activeHost || '',
        browserCookieVisibility: 'httpOnly-cookies-not-readable-in-browser-js',
        sourceJwtClaims: summarizeJwtClient(nextSnapshot.sourceJwt)?.claims || null,
        transport: 'browser->neuro-admin-web-service->neuron',
        credentials: 'include',
      },
      clientRequest: {
        mode: 'same-origin',
        credentials: 'include',
      },
    };

    const clientLogs = [
      formatNeuronSwitchClientLog(nextAttemptId, `Browser requested ${action}.`, {
        sourceHost,
        targetHost,
        tabId,
        credentials: 'include',
        transport: transportMode,
        hasSourceJwt: Boolean(nextSnapshot.sourceJwt),
      }),
    ];

    if (freshAttempt) {
      setLogLines(clientLogs);
      setResponseData(null);
    } else {
      setLogLines((current) => [...current, ...clientLogs]);
    }

    setAttemptId(nextAttemptId);
    setClientSnapshot(nextSnapshot);
    setIsLoading(true);

    try {
      const response = await fetch('/api/debug/neuron-switch', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const data = await response.json().catch(() => ({
        ok: false,
        diagnosis: 'The debug route did not return JSON.',
        logs: [],
      }));

      const serverLogs = Array.isArray(data.logs) ? data.logs : [];
      setLogLines((current) => [...current, ...serverLogs]);
      setResponseData({
        httpStatus: response.status,
        ...data,
      });
      setWaitingForApproval(data.finalStatus === 'REMOTE_PETITION_SENT');
    } catch (error) {
      const failureLine = formatNeuronSwitchClientLog(nextAttemptId, 'Browser fetch failed before the request completed.', {
        error: error.message || 'Unknown browser error',
      });

      setLogLines((current) => [...current, failureLine]);
      setResponseData({
        ok: false,
        finalStatus: null,
        diagnosis: error.message || 'Unknown browser error',
        httpStatus: 0,
      });
      setWaitingForApproval(false);
    } finally {
      setIsLoading(false);
    }
  }

  function startNewAttempt() {
    const nextAttemptId = createNeuronSwitchAttemptId();
    setAttemptId(nextAttemptId);
    setWaitingForApproval(false);
    setResponseData(null);
    setLogLines([
      formatNeuronSwitchClientLog(nextAttemptId, 'Created a new switch attempt.', {
        sourceHost,
        targetHost,
      }),
    ]);
  }

  return (
    <div className="min-h-screen bg-[var(--brand-background)] px-6 py-8 text-[var(--brand-text)]">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Neuron Switch Debug</h1>
              <p className="mt-2 max-w-3xl text-sm text-[var(--brand-text-secondary)]">
                This page is debug-only. It keeps the source session, target session, and target JWT separate so the switching flow can be proven without changing production auth behavior.
              </p>
            </div>
            <button
              type="button"
              onClick={startNewAttempt}
              className="rounded-lg border border-[var(--brand-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--brand-hover)]"
            >
              New Attempt ID
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Switch Attempt ID" value={attemptId || 'Loading...'} readOnly />
            <Field
              label="Current client host"
              value={clientSnapshot?.activeHost || 'Not found in sessionStorage/meta'}
              readOnly
            />
            <Field
              label="Source/current Neuron domain"
              value={sourceHost}
              onChange={setSourceHost}
              placeholder="mateo.lab.tagroot.io"
            />
            <Field
              label="Target/remote Neuron domain"
              value={targetHost}
              onChange={setTargetHost}
              placeholder="lab.tagroot.io"
            />
            <Field
              label="Purpose"
              value={purpose}
              onChange={setPurpose}
              placeholder={DEFAULT_PURPOSE}
            />
            <Field
              label="JWT seconds"
              value={seconds}
              onChange={setSeconds}
              placeholder={DEFAULT_SECONDS}
              inputMode="numeric"
            />
            <SelectField
              label="Transport mode"
              value={transportMode}
              onChange={setTransportMode}
              options={[
                { value: 'backend-web-service/proxy', label: 'backend-web-service/proxy' },
                { value: 'browser-direct', label: 'browser-direct' },
              ]}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Run Steps</h2>
              <p className="mt-2 text-sm text-[var(--brand-text-secondary)]">
                The current active implementation is proxy-based. If you select <code>browser-direct</code>, the page will fail explicitly instead of silently falling back, so transport behavior stays truthful.
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <ActionButton disabled={isLoading} onClick={() => runAction('inspect')}>
                  Inspect active QuickLogin/session/JWT
                </ActionButton>
                <ActionButton disabled={isLoading} onClick={() => runAction('current-jwt')}>
                  Optional diagnostics: convert source session to JWT
                </ActionButton>
                <ActionButton disabled={isLoading} onClick={() => runAction('remote-references')}>
                  Test /Agent/Account/RemoteReferences
                </ActionButton>
                <ActionButton disabled={isLoading} onClick={() => runAction('prepare')}>
                  Prepare remote quick login
                </ActionButton>
                <ActionButton disabled={isLoading} onClick={() => runAction('trigger')}>
                  Trigger remote quick login
                </ActionButton>
                <ActionButton disabled={isLoading} onClick={() => runAction('continue')}>
                  After approval: test target session
                </ActionButton>
                <ActionButton disabled={isLoading} onClick={() => runAction('convert-target')}>
                  Optional diagnostics: convert target session to JWT
                </ActionButton>
                <ActionButton disabled={isLoading} onClick={() => runAction('full', { freshAttempt: true })}>
                  Run full session-based source → target flow
                </ActionButton>
              </div>

              {waitingForApproval ? (
                <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  The target Neuron reported <code>petitionSent: true</code>. Approve the petition in Neuro Access, then press <strong>After approval: test target session</strong> with the same attempt ID.
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Logs</h2>
                <span className="text-xs text-[var(--brand-text-secondary)]">
                  All log lines are prefixed with the attempt ID.
                </span>
              </div>
              <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-[#0f172a] p-4 text-xs leading-6 text-slate-100">
                {logLines.length ? logLines.join('\n') : 'No logs yet.'}
              </pre>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Client Snapshot</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <SnapshotRow label="AgentAPI.Host" value={clientSnapshot?.activeHost || 'Not set'} />
                <SnapshotRow label="AgentAPI.Token exists" value={clientSnapshot?.sourceJwt ? 'true' : 'false'} />
                <SnapshotRow label="Browser cookie access" value="HttpOnly Neuron session cookie is not readable in browser JS" />
                <SnapshotRow label="Selected transport" value={transportMode} />
              </dl>
              <div className="mt-4 rounded-xl bg-[var(--brand-background)] p-4">
                <h3 className="text-sm font-medium">Decoded source JWT claims</h3>
                <pre className="mt-3 overflow-auto text-xs leading-6 text-[var(--brand-text-secondary)]">
                  {JSON.stringify(decodedSourceJwt?.claims || null, null, 2)}
                </pre>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Latest Response</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <SnapshotRow label="HTTP status" value={responseData?.httpStatus ?? '-'} />
                <SnapshotRow label="Final status" value={responseData?.finalStatus || '-'} />
                <SnapshotRow label="Observed statuses" value={Array.isArray(responseData?.observedStatuses) ? responseData.observedStatuses.join(', ') : '-'} />
                <SnapshotRow label="Diagnosis" value={responseData?.diagnosis || '-'} />
                <SnapshotRow label="Recommendation" value={responseData?.recommendation || '-'} />
              </dl>
              <div className="mt-4">
                <NeuronSwitchResultPanels responseData={responseData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, readOnly = false, inputMode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--brand-text-secondary)]">{label}</span>
      <input
        value={value}
        readOnly={readOnly}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm outline-none focus:border-slate-500"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--brand-text-secondary)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm outline-none focus:border-slate-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SnapshotRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--brand-border)] pb-3 last:border-b-0 last:pb-0">
      <dt className="text-[var(--brand-text-secondary)]">{label}</dt>
      <dd className="break-all">{value}</dd>
    </div>
  );
}

function ActionButton({ children, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
