'use client';

import { FiAlertTriangle, FiCheck, FiRefreshCw, FiX } from 'react-icons/fi';
import { MAX_PARKLET_REASON_LENGTH } from '@/lib/parkletAdmin.mjs';

export function StatusTabs({ tabs, activeStatus, onChange, disabled }) {
  return (
    <div className="mb-5 overflow-x-auto">
      <div role="tablist" aria-label="Status" className="inline-flex min-w-full gap-1 rounded-xl border border-[var(--brand-border)] bg-white p-1 sm:min-w-0">
        {tabs.map((tab) => (
          <button
            key={tab.status}
            type="button"
            role="tab"
            aria-selected={activeStatus === tab.status}
            onClick={() => onChange(tab.status)}
            disabled={disabled}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              activeStatus === tab.status
                ? 'bg-[#8F40D4] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewActionDialog({
  title,
  description,
  entityLabel,
  confirmLabel,
  destructive = false,
  reasonRequired = false,
  reason,
  onReasonChange,
  busy,
  onCancel,
  onConfirm,
}) {
  const reasonIsValid = !reasonRequired || Boolean(reason.trim());

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="parklet-action-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2 id="parklet-action-title" className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            aria-label="Stäng"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
        </div>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
        <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
          {entityLabel}
        </p>

        {reasonRequired ? (
          <label className="mt-5 block text-sm font-semibold text-slate-800">
            Anledning
            <textarea
              autoFocus
              required
              rows={4}
              maxLength={MAX_PARKLET_REASON_LENGTH}
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              disabled={busy}
              className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 outline-none transition focus:border-[#8F40D4] focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
            />
            <span className="mt-1 block text-right text-xs font-normal text-slate-400">
              {reason.length}/{MAX_PARKLET_REASON_LENGTH}
            </span>
          </label>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy || !reasonIsValid}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-[#8F40D4] hover:bg-[#7932b8]'
            }`}
          >
            {busy ? <FiRefreshCw className="animate-spin" /> : destructive ? <FiAlertTriangle /> : <FiCheck />}
            {busy ? 'Sparar…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Notice({ notice }) {
  const styles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    info: 'border-blue-200 bg-blue-50 text-blue-900',
  };
  return (
    <div role="status" className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles[notice.type] || styles.info}`}>
      {notice.type === 'warning' || notice.type === 'error'
        ? <FiAlertTriangle className="mt-0.5 shrink-0" />
        : <FiCheck className="mt-0.5 shrink-0" />}
      <span>{notice.message}</span>
    </div>
  );
}

export function LoadingState({ label }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center gap-2 text-sm text-slate-500">
      <FiRefreshCw className="animate-spin" /> {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
      <FiAlertTriangle className="mb-3 text-red-600" size={24} />
      <p className="text-sm font-semibold text-red-800">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-800 hover:bg-red-50">
        Försök läsa igen
      </button>
    </div>
  );
}

export function createRequestError(response, body) {
  const error = new Error(safeBackendMessage(body) || `Anropet misslyckades (${response.status}).`);
  error.status = response.status;
  return error;
}

export function getReadErrorMessage(error, resourceName) {
  if (error?.status === 401) return 'Administratörssessionen saknas eller har gått ut.';
  if (error?.status === 403) return `Du har inte behörighet att läsa ${resourceName}.`;
  return error?.message || `Kunde inte läsa ${resourceName}.`;
}

export function safeBackendMessage(body) {
  if (!body || typeof body !== 'object') return '';
  const message = typeof body.error === 'string'
    ? body.error
    : typeof body.message === 'string'
      ? body.message
      : '';
  return message.trim().replace(/[\r\n\t]+/g, ' ').slice(0, 300);
}

export async function readJson(response) {
  return response.json().catch(() => null);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export const UNKNOWN_OUTCOME_MESSAGE =
  'Det gick inte att bekräfta om ändringen genomfördes. Uppdatera informationen innan du försöker igen.';

export const FORBIDDEN_ACTION_MESSAGE = 'Du har inte behörighet att utföra den här åtgärden.';
