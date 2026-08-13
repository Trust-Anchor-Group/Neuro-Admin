'use client';

import { startTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const WAITING_STATUS = 'WAITING_FOR_APPROVAL';
const TARGET_SESSION_AVAILABLE = 'TARGET_SESSION_AVAILABLE';
const SCRIPT_SESSION_SUCCESS = 'END_TO_END_SWITCH_WORKS_WITH_SCRIPT_SESSION';

function syncActiveHost(host) {
  if (!host) return;
  sessionStorage.setItem('AgentAPI.Host', host);
  window.dispatchEvent(new CustomEvent('neuron-host-changed', { detail: host }));
}

function getReferenceLabel(reference) {
  if (!reference) return '';
  return `${reference.host} - ${reference.hasStoredSession ? 'Session available' : 'Login required'}`;
}

export default function NeuronSwitchControl({ variant = 'panel' }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [references, setReferences] = useState([]);
  const [selectedHost, setSelectedHost] = useState('');
  const [switchAttemptId, setSwitchAttemptId] = useState('');
  const [workflow, setWorkflow] = useState(null);
  const [fallbackReason, setFallbackReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setMessage('');

    try {
      const prepareResponse = await fetch('/api/neuron-switch/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const preparePayload = await prepareResponse.json();

      if (!prepareResponse.ok) {
        throw new Error(preparePayload?.error || 'Failed to prepare remote quick login.');
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
        throw new Error(triggerPayload?.error || 'Failed to trigger remote quick login.');
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
        throw new Error(activatePayload?.error || 'Target Accounts.ws activation failed.');
      }

      if (activatePayload.status !== SCRIPT_SESSION_SUCCESS) {
        throw new Error('The selected Neuron was not activated.');
      }

      syncActiveHost(activatePayload.activeHost);
      setWorkflow(activatePayload);
      setMessage(`Connected to ${activatePayload.activeHost}. All admin data now uses this Neuron.`);
      setOpen(false);
      await loadState();
      startTransition(() => router.refresh());
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
              {getReferenceLabel(reference)}
            </option>
          ))}
        </select>

        {selectedReference ? (
          <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
            {selectedReference.hasStoredSession ? 'Session available' : 'Login required'}
          </p>
        ) : null}

        {fallbackReason ? (
          <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Remote references lookup failed. Showing fallback hosts from the configured allowlist and stored sessions.
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleStartLogin}
            disabled={isLoading || isSubmitting || !selectedHost}
            className="rounded-md bg-[var(--brand-text)] px-3 py-2 text-xs font-semibold text-[var(--brand-navbar)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Working...' : 'Start login'}
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
