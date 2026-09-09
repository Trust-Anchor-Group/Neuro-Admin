'use client';

import { useEffect, useState } from 'react';
import { getNeuronSwitchClientSnapshot } from '@/lib/neuronSwitchClient';

const WAITING_STATUS = 'WAITING_FOR_APPROVAL';
const TARGET_SESSION_AVAILABLE = 'TARGET_SESSION_AVAILABLE';
const SCRIPT_SESSION_SUCCESS = 'END_TO_END_SWITCH_WORKS_WITH_SCRIPT_SESSION';

function syncActiveHost(host) {
  if (!host) return;
  sessionStorage.setItem('AgentAPI.Host', host);
  window.dispatchEvent(new CustomEvent('neuron-host-changed', { detail: host }));
}

function getReferenceLabel(reference, activeHost) {
  if (!reference) return '';
  if (reference.accessStatus === 'unavailable') {
    return `${reference.host} - No admin access`;
  }
  const state = reference.host === activeHost
    ? 'Current session'
    : reference.hasStoredSession
      ? 'Session available'
      : 'Login required';
  return `${reference.host} - ${state}`;
}

function getSwitchErrorMessage(payload, fallback, currentHost) {
  const rawMessage = payload?.error || fallback;
  if (payload?.status === 'SOURCE_SESSION_MISSING' && payload?.sourceHost) {
    return `Your source session on ${payload.sourceHost} is unavailable or expired. Reconnect to it with Neuro-Access, then retry.`;
  }
  if (payload?.status === 'SOURCE_SESSION_EXPIRED' && payload?.sourceHost) {
    return `The source session on ${payload.sourceHost} has expired. Reconnect to it with Neuro-Access, then retry.`;
  }
  if (payload?.status === 'TARGET_SESSION_ACTIVATION_FAILED' && payload?.targetHost) {
    return `Administrator access could not be verified on ${payload.targetHost}. You may not have an admin role there, or the target session has expired.`;
  }
  if (/unauthorized access prohibited|unauthorized/i.test(String(rawMessage))) {
    return `The source Neuron${currentHost ? ` (${currentHost})` : ''} did not accept the current session. Log out and log in again with Neuro-Access, then retry.`;
  }
  return rawMessage;
}

function normalizeManualHost(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(':')[0];
}

export default function NeuronSwitchControl({ variant = 'panel' }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [references, setReferences] = useState([]);
  const [selectedHost, setSelectedHost] = useState('');
  const [switchAttemptId, setSwitchAttemptId] = useState('');
  const [workflow, setWorkflow] = useState(null);
  const [fallbackReason, setFallbackReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [manualHost, setManualHost] = useState('');
  const [manualHostError, setManualHostError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceHost, setSourceHost] = useState('');
  const [canStartRemoteLogin, setCanStartRemoteLogin] = useState(true);

  const isNavbar = variant === 'navbar';
  const selectedReference = references.find((reference) => reference.host === selectedHost) || null;
  const showContinue = workflow
    && workflow.targetHost === selectedHost
    && (workflow.status === WAITING_STATUS || workflow.status === TARGET_SESSION_AVAILABLE);

  async function loadState() {
    setIsLoading(true);
    setError('');

    try {
      const [currentResponse, referencesResponse] = await Promise.all([
        fetch('/api/neuron-switch/current', { cache: 'no-store' }),
        fetch('/api/neuron-switch/references', { cache: 'no-store' }),
      ]);

      const currentPayload = await currentResponse.json();
      const referencesPayload = await referencesResponse.json();

      if (!currentResponse.ok) {
        throw new Error(currentPayload?.error || 'Failed to load current Neuron.');
      }

      if (!referencesResponse.ok) {
        throw new Error(referencesPayload?.error || 'Failed to load available Neurons.');
      }

      setCurrent(currentPayload);
      setReferences(Array.isArray(referencesPayload.references) ? referencesPayload.references : []);
      setFallbackReason(referencesPayload.fallbackReason || '');
      setSourceHost(currentPayload.sourceHost || referencesPayload.sourceHost || '');
      setCanStartRemoteLogin(currentPayload.canStartRemoteLogin !== false && referencesPayload.canStartRemoteLogin !== false);
      syncActiveHost(currentPayload.activeHost);

      const nextSelectedHost = selectedHost
        && referencesPayload.references?.some((reference) => reference.host === selectedHost)
        ? selectedHost
        : referencesPayload.activeHost || currentPayload.activeHost || referencesPayload.references?.[0]?.host || '';
      setSelectedHost(nextSelectedHost);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load Neuron state.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadState();
  }, []);

  async function handleStartLogin() {
    if (!selectedHost) return;
    if (selectedHost === current?.activeHost) {
      setMessage(`Already connected to ${selectedHost}.`);
      setError('');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage(sourceHost && sourceHost !== current?.activeHost
      ? `Preparing remote login using your source session on ${sourceHost}...`
      : `Preparing remote login from ${current?.activeHost || 'the current Neuron'}...`);

    try {
      const prepareResponse = await fetch('/api/neuron-switch/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
            sourceJwt: getNeuronSwitchClientSnapshot().sourceJwt || '',
          }),
      });
      const preparePayload = await prepareResponse.json();

      if (!prepareResponse.ok) {
        throw new Error(getSwitchErrorMessage(preparePayload, 'Failed to prepare remote quick login.', current?.activeHost));
      }

      const nextAttemptId = preparePayload.switchAttemptId;
      setSwitchAttemptId(nextAttemptId);

      const triggerResponse = await fetch('/api/neuron-switch/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          switchAttemptId: nextAttemptId,
          targetHost: selectedHost,
          tabId: typeof window !== 'undefined' ? window.name || undefined : undefined,
        }),
      });
      const triggerPayload = await triggerResponse.json();

      if (!triggerResponse.ok) {
        throw new Error(getSwitchErrorMessage(triggerPayload, 'Failed to trigger remote quick login.', current?.activeHost));
      }

      setWorkflow(triggerPayload);

      if (triggerPayload.status === WAITING_STATUS) {
        setMessage('Approve the login request in your app, then continue.');
      } else if (triggerPayload.status === TARGET_SESSION_AVAILABLE) {
        setMessage('Target session available. Continue to verify Accounts.ws and switch.');
      } else {
        setMessage('Remote quick login returned an unexpected result. Review the response and try again.');
      }

      await loadState();
    } catch (submitError) {
      setError(submitError.message || 'Failed to start Neuron switch.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleActivate() {
    if (!selectedHost) return;

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const activateResponse = await fetch('/api/neuron-switch/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          switchAttemptId,
          targetHost: selectedHost,
        }),
      });
      const activatePayload = await activateResponse.json();

      if (!activateResponse.ok) {
        if (activatePayload?.status === 'TARGET_SESSION_ACTIVATION_FAILED') {
          setReferences((previousReferences) => previousReferences.map((reference) => (
            reference.host === selectedHost
              ? { ...reference, accessStatus: 'unavailable' }
              : reference
          )));
        }
        throw new Error(getSwitchErrorMessage(activatePayload, 'Target Accounts.ws activation failed.', selectedHost));
      }

      if (activatePayload.status !== SCRIPT_SESSION_SUCCESS) {
        throw new Error('The selected Neuron was not activated.');
      }

      syncActiveHost(activatePayload.activeHost);
      setWorkflow(activatePayload);
      setMessage(`Connected to ${activatePayload.activeHost}. All admin data now uses this Neuron.`);
      setOpen(false);
      // Client-side pages keep their own data-fetching state. A full reload makes
      // every page fetch again with the newly activated host/session pair.
      window.location.reload();
    } catch (activateError) {
      setError(activateError.message || 'Failed to activate the selected Neuron.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUseStoredSession() {
    setWorkflow({
      switchAttemptId,
      status: TARGET_SESSION_AVAILABLE,
      targetHost: selectedHost,
    });
    await handleActivate();
  }

  async function handleClearStoredSession() {
    if (!selectedHost) return;

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/neuron-switch/logout-target', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: selectedHost,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to clear stored session.');
      }

      setWorkflow(null);
      setSwitchAttemptId('');
      setMessage(`Cleared stored session for ${selectedHost}.`);
      await loadState();
      startTransition(() => router.refresh());
    } catch (clearError) {
      setError(clearError.message || 'Failed to clear stored session.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleAddManualHost() {
    const normalizedHost = normalizeManualHost(manualHost);
    setManualHostError('');

    if (!normalizedHost) {
      setManualHostError('Enter a Neuron hostname.');
      return;
    }

    const matchingReference = references.find((reference) => reference.host === normalizedHost);
    if (!matchingReference) {
      setManualHostError('This Neuron is not in the server-approved list. Add it to NEURON_SWITCH_ALLOWED_HOSTS first.');
      return;
    }

    setSelectedHost(normalizedHost);
    setManualHost('');
  }

  function renderPanel() {
    return (
      <div className="w-full rounded-[14px] border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-text-secondary)]">
              Active Neuron
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--brand-text)]">
              {current?.activeHost || 'Loading...'}
            </p>
          </div>
          {current?.activeHost && current?.defaultHost && current.activeHost !== current.defaultHost ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-900">
              Remote Neuron
            </span>
          ) : null}
        </div>

        <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
          {current?.activeHost && current?.defaultHost && current.activeHost !== current.defaultHost
            ? 'You are working on a remote Neuron. Actions will affect this Neuron.'
            : 'All admin data and actions are sent to the selected Neuron session.'}
        </p>

        <div className="mt-3 rounded-md bg-[var(--brand-background)] px-3 py-2 text-xs text-[var(--brand-text-secondary)]">
          Your current login is the source Neuron. Select another Neuron below to request remote access; after approval, the admin data will move to that Neuron.
        </div>

        {sourceHost && current?.activeHost !== sourceHost && canStartRemoteLogin ? (
          <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
            You are currently using a remote session on <strong>{current?.activeHost}</strong>. New login requests will use your stored source session on <strong>{sourceHost}</strong> automatically.
          </div>
        ) : null}

        {sourceHost && !canStartRemoteLogin ? (
          <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Your stored source session on <strong>{sourceHost}</strong> is unavailable. Reconnect to that Neuron with Neuro-Access before starting a new login.
          </div>
        ) : null}

        <label className="mt-4 block text-xs font-medium text-[var(--brand-text-secondary)]">
          Destination
        </label>
        <select
          value={selectedHost}
          onChange={(event) => setSelectedHost(event.target.value)}
          className="mt-2 w-full rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm text-[var(--brand-text)] outline-none"
          disabled={isLoading || isSubmitting}
        >
          {references.map((reference) => (
            <option key={reference.host} value={reference.host}>
              {getReferenceLabel(reference, current?.activeHost)}
            </option>
          ))}
        </select>

        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={manualHost}
            onChange={(event) => {
              setManualHost(event.target.value);
              setManualHostError('');
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleAddManualHost();
            }}
            placeholder="Specific approved host"
            aria-label="Specific approved Neuron host"
            className="min-w-[220px] flex-1 rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm text-[var(--brand-text)] outline-none"
            disabled={isLoading || isSubmitting}
          />
          <button
            type="button"
            onClick={handleAddManualHost}
            disabled={isLoading || isSubmitting || !manualHost.trim()}
            className="rounded-md border border-[var(--brand-border)] px-3 py-2 text-xs font-semibold text-[var(--brand-text)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add host
          </button>
        </div>

        {manualHostError ? (
          <p className="mt-2 text-xs text-red-700">{manualHostError}</p>
        ) : null}

        {selectedReference ? (
          <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
            {selectedReference.host === current?.activeHost
              ? 'This is the Neuron you are currently logged into.'
              : selectedReference.accessStatus === 'unavailable'
                ? 'Administrator access could not be verified on this Neuron.'
              : selectedReference.hasStoredSession
                ? 'A previously approved session is available. You can use it directly.'
                : 'Start login to send an approval request to Neuro-Access.'}
          </p>
        ) : null}

        <p className="mt-2 text-[11px] text-[var(--brand-text-secondary)]">
          The list contains configured and previously discovered Neurons. Administrator access is verified when you connect.
        </p>

        {fallbackReason ? (
          <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Remote references lookup failed. Showing fallback hosts from the configured allowlist and stored sessions.
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleStartLogin}
            disabled={isLoading || isSubmitting || !selectedHost || selectedHost === current?.activeHost || !canStartRemoteLogin}
            className="rounded-md px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: '#A160E8', color: '#FFFFFF' }}
          >
            {selectedHost === current?.activeHost
              ? 'Already connected'
              : !canStartRemoteLogin
                ? 'Reconnect source session'
                : isSubmitting
                  ? 'Working...'
                  : 'Start login'}
          </button>

          {showContinue ? (
            <button
              type="button"
              onClick={handleActivate}
              disabled={isSubmitting}
              className="rounded-md border border-[var(--brand-border)] px-3 py-2 text-xs font-semibold text-[var(--brand-text)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue
            </button>
          ) : null}

          {selectedReference?.hasStoredSession && selectedHost !== current?.activeHost ? (
            <button
              type="button"
              onClick={handleUseStoredSession}
              disabled={isSubmitting}
              className="rounded-md border border-[var(--brand-border)] px-3 py-2 text-xs font-semibold text-[var(--brand-text)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Use stored session
            </button>
          ) : null}

          {selectedReference?.hasStoredSession ? (
            <button
              type="button"
              onClick={handleClearStoredSession}
              disabled={isSubmitting}
              className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear stored session
            </button>
          ) : null}
        </div>

        {workflow?.status === WAITING_STATUS ? (
          <div className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-900">
            Approval requested for <strong>{workflow.targetHost}</strong>. Approve it in Neuro-Access, then return here and click Continue.
          </div>
        ) : null}

        {workflow?.status === TARGET_SESSION_AVAILABLE ? (
          <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            Approval received for <strong>{workflow.targetHost}</strong>. Click Continue to activate that Neuron.
          </div>
        ) : null}

        {message ? (
          <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">
            {error}
          </div>
        ) : null}
      </div>
    );
  }

  if (isNavbar) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-[220px] items-center justify-between gap-3 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-2 text-left"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-text-secondary)]">
              Connected to
            </p>
            <p className="text-sm font-semibold text-[var(--brand-text)]">
              {current?.activeHost || 'Loading...'}
            </p>
          </div>
          <span className="text-xs text-[var(--brand-text-secondary)]">
            {open ? 'Close' : 'Switch'}
          </span>
        </button>

        {open ? (
          <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[360px] max-w-[calc(100vw-32px)]">
            {renderPanel()}
          </div>
        ) : null}
      </div>
    );
  }

  return renderPanel();
}
