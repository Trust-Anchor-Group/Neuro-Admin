'use client';

export default function NeuronSwitchResultPanels({ responseData, compact = false }) {
  const humanSummary = Array.isArray(responseData?.summary?.humanSummary)
    ? responseData.summary.humanSummary
    : [];
  const apiTrace = Array.isArray(responseData?.summary?.apiTrace)
    ? responseData.summary.apiTrace
    : [];

  return (
    <div className={`grid gap-4 ${compact ? '' : 'lg:grid-cols-2'}`}>
      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
        <h3 className="text-sm font-semibold text-[var(--brand-text)]">What Happened</h3>
        <div className="mt-3 space-y-2 text-sm">
          <InfoRow label="HTTP status" value={responseData?.httpStatus ?? '-'} />
          <InfoRow label="Final status" value={responseData?.finalStatus || '-'} />
          <InfoRow
            label="Observed statuses"
            value={Array.isArray(responseData?.observedStatuses) ? responseData.observedStatuses.join(', ') : '-'}
          />
        </div>
        <div className="mt-4 space-y-2">
          {humanSummary.length ? humanSummary.map((line, index) => (
            <p key={`${index}-${line}`} className="rounded-lg bg-white px-3 py-2 text-sm text-[var(--brand-text)]">
              {index + 1}. {line}
            </p>
          )) : (
            <p className="text-sm text-[var(--brand-text-secondary)]">No human summary yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
        <h3 className="text-sm font-semibold text-[var(--brand-text)]">Upstream API Responses</h3>
        <div className="mt-3 space-y-3">
          {apiTrace.length ? apiTrace.map((entry, index) => (
            <div key={`${entry.label}-${index}`} className="rounded-lg bg-white px-3 py-3">
              <div className="flex flex-col gap-1 text-sm">
                <div className="font-medium text-[var(--brand-text)]">{entry.label}</div>
                <div className="text-[var(--brand-text-secondary)]">{entry.host}{entry.path}</div>
                <div className="text-[var(--brand-text-secondary)]">
                  status: {entry.status} | cookie: {String(entry.cookieExists)} | set-cookie: {String(entry.setCookieExists)} | jwt: {String(entry.jwtExists)}
                </div>
              </div>
              <div className="mt-3 grid gap-3">
                <TraceBlock label="Request body" value={entry.requestBody} />
                <TraceBlock label="Response body" value={entry.responseBody} />
              </div>
            </div>
          )) : (
            <p className="text-sm text-[var(--brand-text-secondary)]">No upstream API calls yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--brand-border)] pb-2 last:border-b-0 last:pb-0">
      <div className="text-[var(--brand-text-secondary)]">{label}</div>
      <div className="break-all text-[var(--brand-text)]">{value}</div>
    </div>
  );
}

function TraceBlock({ label, value }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-[var(--brand-text-secondary)]">{label}</div>
      <pre className="overflow-auto rounded-md bg-slate-950 px-3 py-2 text-xs leading-5 text-slate-100">
        {formatTraceValue(value)}
      </pre>
    </div>
  );
}

function formatTraceValue(value) {
  if (value === null || value === undefined || value === '') return 'None';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
