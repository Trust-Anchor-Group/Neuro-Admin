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

export default function NeuronSwitchLandingPanel() {
  const [attemptId, setAttemptId] = useState('');
  const [sourceHost, setSourceHost] = useState('');
  const [targetHost, setTargetHost] = useState('');
  const [purpose, setPurpose] = useState(DEFAULT_PURPOSE);
  const [seconds, setSeconds] = useState(DEFAULT_SECONDS);
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [logLines, setLogLines] = useState([]);
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
      transportMode: 'backend-web-service/proxy',
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
        transport: 'backend-web-service/proxy',
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
      setLogLines((current) => [
        ...current,
        formatNeuronSwitchClientLog(nextAttemptId, 'Browser fetch failed before the request completed.', {
          error: error.message || 'Unknown browser error',
        }),
      ]);
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

  const targetRequired = !targetHost.trim();

  return (
    <div className="mt-4 rounded-[12px] border border-amber-300 bg-amber-50 px-[16px] py-[16px]">
      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-amber-900">Neuron switch test</p>
        <p className="text-[12px] leading-[1.5] text-amber-900/90">
          Debug-only. This runs Peter&apos;s session-cookie flow from the same destination area on the landing page without changing production auth behavior.
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <ReadOnlyField label="Source/current host" value={sourceHost || 'Not found'} />
        <TextField
          label="Destination target host"
          value={targetHost}
          onChange={setTargetHost}
          placeholder="lab.tagroot.io"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Purpose" value={purpose} onChange={setPurpose} placeholder={DEFAULT_PURPOSE} />
          <TextField label="JWT seconds" value={seconds} onChange={setSeconds} placeholder={DEFAULT_SECONDS} inputMode="numeric" />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <ActionButton disabled={isLoading} onClick={() => runAction('inspect')}>
          Inspect
        </ActionButton>
        <ActionButton disabled={isLoading} onClick={() => runAction('current-jwt')}>
          Optional: source JWT
        </ActionButton>
        <ActionButton disabled={isLoading} onClick={() => runAction('remote-references')}>
          Test RemoteReferences
        </ActionButton>
        <ActionButton disabled={isLoading} onClick={() => runAction('prepare')}>
          Prepare
        </ActionButton>
        <ActionButton disabled={isLoading || targetRequired} onClick={() => runAction('trigger')}>
          Trigger
        </ActionButton>
        <ActionButton disabled={isLoading || targetRequired} onClick={() => runAction('continue')}>
          After approval: test target session
        </ActionButton>
        <ActionButton disabled={isLoading || targetRequired} onClick={() => runAction('convert-target')}>
          Optional: convert target session to JWT
        </ActionButton>
        <ActionButton disabled={isLoading || targetRequired} onClick={() => runAction('full', { freshAttempt: true })}>
          Full session test
        </ActionButton>
      </div>

      {waitingForApproval ? (
        <p className="mt-3 rounded-[10px] border border-amber-400 bg-white px-3 py-2 text-[12px] text-amber-900">
          Petition sent. Approve it in Neuro Access, then press <strong>After approval: test target session</strong>.
        </p>
      ) : null}

      <div className="mt-4 rounded-[10px] bg-white/80 px-3 py-3">
        <p className="text-[12px] font-medium text-[var(--brand-text)]">Client snapshot</p>
        <dl className="mt-2 space-y-2 text-[12px]">
          <StatusRow label="Attempt ID" value={attemptId || '-'} />
          <StatusRow label="JWT in browser" value={clientSnapshot?.sourceJwt ? 'true' : 'false'} />
          <StatusRow label="JWT user" value={decodedSourceJwt?.claims?.userName || '-'} />
        </dl>
      </div>

      {responseData ? (
        <div className="mt-4">
          <NeuronSwitchResultPanels responseData={responseData} compact />
        </div>
      ) : null}

      <div className="mt-4 rounded-[10px] bg-slate-950 px-3 py-3">
        <p className="text-[12px] font-medium text-slate-100">Logs</p>
        <pre className="mt-2 max-h-[220px] overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-slate-200">
          {logLines.length ? logLines.join('\n') : 'No logs yet.'}
        </pre>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, inputMode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-[var(--brand-text-secondary)]">{label}</span>
      <input
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[8px] border border-[var(--brand-border)] bg-white px-3 py-2 text-[13px] text-[var(--brand-text)] outline-none"
      />
    </label>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <span className="mb-1 block text-[12px] font-medium text-[var(--brand-text-secondary)]">{label}</span>
      <div className="rounded-[8px] border border-[var(--brand-border)] bg-white px-3 py-2 text-[13px] text-[var(--brand-text)]">
        {value}
      </div>
    </div>
  );
}

function ActionButton({ children, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-[8px] bg-slate-900 px-3 py-2 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function StatusRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-[var(--brand-text-secondary)]">{label}</dt>
      <dd className="break-all text-[var(--brand-text)]">{value}</dd>
    </div>
  );
}
