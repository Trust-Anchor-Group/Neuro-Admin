'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FiArrowLeft, FiCheck, FiRefreshCw, FiSlash } from 'react-icons/fi';
import OrganizationStatusBadge from '@/components/parklet/OrganizationStatusBadge';
import {
  ErrorState,
  FORBIDDEN_ACTION_MESSAGE,
  LoadingState,
  Notice,
  ReviewActionDialog,
  StatusTabs,
  UNKNOWN_OUTCOME_MESSAGE,
  createRequestError,
  formatDate,
  getReadErrorMessage,
  readJson,
  safeBackendMessage,
} from '@/components/parklet/ParkletReviewUi';

const TABS = [
  { status: 'Pending', label: 'Väntar på granskning' },
  { status: 'Active', label: 'Aktiva' },
  { status: 'Denied', label: 'Nekade' },
  { status: 'Deactivated', label: 'Inaktiverade' },
];

const ACTIONS = {
  approve: {
    endpoint: 'approve',
    title: 'Godkänn organisation?',
    description: 'Organisationen aktiveras och får därefter använda de delar av Parklet som kräver en aktiv organisation.',
    confirmLabel: 'Godkänn organisation',
    successMessage: 'Organisationen har godkänts och är nu aktiv.',
    failureMessage: 'Organisationen kunde inte godkännas.',
    affectedStatuses: () => ['Pending', 'Active'],
  },
  deny: {
    endpoint: 'deny',
    title: 'Neka organisation?',
    confirmLabel: 'Neka organisation',
    successMessage: 'Organisationen har nekats.',
    failureMessage: 'Organisationen kunde inte nekas.',
    reasonRequired: true,
    destructive: true,
    affectedStatuses: () => ['Pending', 'Denied'],
  },
  reactivate: {
    endpoint: 'reactivate',
    title: 'Återaktivera organisation?',
    description: 'Organisationen ändras tillbaka till Aktiv.',
    confirmLabel: 'Återaktivera',
    successMessage: 'Organisationen har återaktiverats.',
    failureMessage: 'Organisationen kunde inte återaktiveras.',
    reasonRequired: true,
    affectedStatuses: (sourceStatus) => [sourceStatus, 'Active'],
  },
};

export default function ParkletOrganizationsClient() {
  const [activeStatus, setActiveStatus] = useState('Pending');
  const [lists, setLists] = useState({});
  const [loadingStatuses, setLoadingStatuses] = useState({});
  const [listErrors, setListErrors] = useState({});
  const [selectedId, setSelectedId] = useState('');
  const [organization, setOrganization] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [notice, setNotice] = useState(null);
  const [dialogAction, setDialogAction] = useState('');
  const [reason, setReason] = useState('');
  const [mutationAction, setMutationAction] = useState('');
  const [requiresRefresh, setRequiresRefresh] = useState(false);
  const mutationRef = useRef(false);

  const loadOrganizations = useCallback(async (status) => {
    setLoadingStatuses((current) => ({ ...current, [status]: true }));
    setListErrors((current) => ({ ...current, [status]: '' }));
    try {
      const response = await fetch(`/api/admin/organizations?status=${encodeURIComponent(status)}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      const body = await readJson(response);
      if (!response.ok) throw createRequestError(response, body);
      const items = Array.isArray(body?.items) ? body.items : [];
      setLists((current) => ({ ...current, [status]: items }));
      return items;
    } catch (error) {
      setListErrors((current) => ({
        ...current,
        [status]: getReadErrorMessage(error, 'Parklet-organisationer'),
      }));
      throw error;
    } finally {
      setLoadingStatuses((current) => ({ ...current, [status]: false }));
    }
  }, []);

  const loadOrganization = useCallback(async (organizationId) => {
    if (!organizationId) return null;
    setLoadingDetail(true);
    setDetailError('');
    try {
      const response = await fetch(`/api/admin/organizations/${encodeURIComponent(organizationId)}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      const body = await readJson(response);
      if (!response.ok) throw createRequestError(response, body);
      setOrganization(body);
      return body;
    } catch (error) {
      setDetailError(getReadErrorMessage(error, 'Parklet-organisationen'));
      throw error;
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations(activeStatus).catch(() => {});
  }, [activeStatus, loadOrganizations]);

  const changeStatus = (status) => {
    if (mutationRef.current) return;
    setActiveStatus(status);
    setSelectedId('');
    setOrganization(null);
    setDetailError('');
    setNotice(null);
    setRequiresRefresh(false);
  };

  const handleSelect = (organizationId) => {
    setSelectedId(organizationId);
    setOrganization(null);
    setNotice(null);
    setRequiresRefresh(false);
    loadOrganization(organizationId).catch(() => {});
  };

  const handleBack = () => {
    setSelectedId('');
    setOrganization(null);
    setDetailError('');
    setNotice(null);
    setRequiresRefresh(false);
  };

  const refreshRealData = useCallback(async (statuses = [activeStatus], organizationId = selectedId) => {
    const uniqueStatuses = [...new Set(statuses)];
    const results = await Promise.allSettled([
      ...uniqueStatuses.map((status) => loadOrganizations(status)),
      organizationId ? loadOrganization(organizationId) : Promise.resolve(null),
    ]);
    return results.every((result) => result.status === 'fulfilled');
  }, [activeStatus, loadOrganization, loadOrganizations, selectedId]);

  const openDialog = (action) => {
    if (mutationRef.current || requiresRefresh) return;
    setDialogAction(action);
    setReason('');
    setNotice(null);
  };

  const handleMutation = async () => {
    const action = ACTIONS[dialogAction];
    const currentOrganization = organization;
    if (
      !action ||
      !currentOrganization?.id ||
      mutationRef.current ||
      requiresRefresh ||
      (action.reasonRequired && !reason.trim())
    ) return;

    mutationRef.current = true;
    setMutationAction(dialogAction);
    setNotice(null);

    let unknownOutcome = false;
    try {
      const payload = {
        organizationId: currentOrganization.id,
        ...(action.reasonRequired ? { reason: reason.trim() } : {}),
      };
      const response = await fetch(
        `/api/admin/organizations/${encodeURIComponent(currentOrganization.id)}/${action.endpoint}`,
        {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const body = await readJson(response);

      if (response.status === 401) {
        setNotice({ type: 'error', message: 'Administratörssessionen saknas eller har gått ut.' });
      } else if (response.status === 403) {
        setNotice({ type: 'error', message: FORBIDDEN_ACTION_MESSAGE });
      } else if (response.status === 502 || body?.outcome === 'unknown') {
        unknownOutcome = true;
        setNotice({ type: 'warning', message: UNKNOWN_OUTCOME_MESSAGE });
      } else if (!response.ok || body?.ok !== true) {
        setNotice({
          type: 'error',
          message: safeBackendMessage(body) || action.failureMessage,
        });
      } else if (dialogAction === 'approve' && body.alreadyActive === true) {
        setNotice({ type: 'success', message: 'Organisationen är redan aktiv.' });
      } else {
        setNotice({ type: 'success', message: action.successMessage });
      }
    } catch {
      unknownOutcome = true;
      setNotice({ type: 'warning', message: UNKNOWN_OUTCOME_MESSAGE });
    }

    if (unknownOutcome) setRequiresRefresh(true);
    const refreshed = await refreshRealData(
      action.affectedStatuses(currentOrganization.status),
      currentOrganization.id,
    );
    setRequiresRefresh(!refreshed);
    setDialogAction('');
    setReason('');
    mutationRef.current = false;
    setMutationAction('');
  };

  const handleForcedRefresh = async () => {
    setNotice(null);
    const refreshed = await refreshRealData();
    setRequiresRefresh(!refreshed);
    if (refreshed) setNotice({ type: 'info', message: 'Data har uppdaterats från Parklet.' });
  };

  const organizations = lists[activeStatus] || [];
  const loadingList = Boolean(loadingStatuses[activeStatus]);
  const listError = listErrors[activeStatus] || '';
  const busy = Boolean(mutationAction);
  const activeTab = TABS.find((tab) => tab.status === activeStatus);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-[#8F40D4]">Parklet</p>
          <h1 className="text-2xl font-bold text-[var(--brand-text-color)]">Organisationer</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Granska organisationer och deras aktuella status direkt från Parklet.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refreshRealData().catch(() => {})}
          disabled={loadingList || loadingDetail || busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-third)] px-4 py-2 text-sm font-semibold text-[var(--brand-text-color)] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiRefreshCw className={loadingList || loadingDetail ? 'animate-spin' : ''} />
          Uppdatera
        </button>
      </div>

      <StatusTabs tabs={TABS} activeStatus={activeStatus} onChange={changeStatus} disabled={busy} />
      {notice ? <Notice notice={notice} /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.8fr)]">
        <section className="overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-third)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--brand-border)] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[var(--brand-text-color)]">{activeTab?.label}</h2>
              <p className="mt-0.5 text-xs text-slate-500">Serverfiltrerat på status {activeStatus}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
              {organizations.length}
            </span>
          </div>

          {loadingList ? (
            <LoadingState label="Läser organisationer…" />
          ) : listError ? (
            <ErrorState message={listError} onRetry={() => loadOrganizations(activeStatus).catch(() => {})} />
          ) : organizations.length === 0 ? (
            <EmptyState label={`Inga organisationer med status ${activeTab?.label?.toLowerCase() || activeStatus}`} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Organisation</th>
                    <th className="px-5 py-3 font-semibold">Org.nr</th>
                    <th className="px-5 py-3 font-semibold">Typ</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Skapad</th>
                    <th className="px-5 py-3 text-right font-semibold">Åtgärd</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--brand-border)]">
                  {organizations.map((item) => (
                    <tr key={item.id} className={selectedId === item.id ? 'bg-purple-50/70' : ''}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[var(--brand-text-color)]">{item.name || 'Namnlös organisation'}</p>
                        <p className="mt-0.5 max-w-[220px] truncate font-mono text-[11px] text-slate-400" title={item.id}>{item.id}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{item.registrationNumber || '—'}</td>
                      <td className="px-5 py-4 text-slate-600">{item.type || '—'}</td>
                      <td className="px-5 py-4"><OrganizationStatusBadge status={item.status} /></td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(item.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleSelect(item.id)}
                          disabled={busy}
                          className="rounded-lg border border-purple-200 px-3 py-2 text-xs font-bold text-[#8F40D4] hover:bg-purple-50 disabled:opacity-50"
                        >
                          Granska
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="min-h-[420px] rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-third)] p-5 shadow-sm">
          {!selectedId ? (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
              <div className="mb-3 rounded-full bg-purple-50 p-3 text-[#8F40D4]"><FiCheck size={22} /></div>
              <h2 className="font-semibold text-[var(--brand-text-color)]">Välj en organisation</h2>
              <p className="mt-1 max-w-xs text-sm text-slate-500">Öppna en rad för att se verkliga detaljuppgifter och tillåtna granskningsåtgärder.</p>
            </div>
          ) : loadingDetail && !organization ? (
            <LoadingState label="Läser organisation…" />
          ) : detailError && !organization ? (
            <ErrorState message={detailError} onRetry={() => loadOrganization(selectedId).catch(() => {})} />
          ) : organization ? (
            <OrganizationDetail
              organization={organization}
              busy={busy}
              requiresRefresh={requiresRefresh}
              onBack={handleBack}
              onAction={openDialog}
              onRefresh={handleForcedRefresh}
            />
          ) : null}
        </aside>
      </div>

      {dialogAction && organization ? (
        <ReviewActionDialog
          {...ACTIONS[dialogAction]}
          entityLabel={organization.name || organization.id}
          reason={reason}
          onReasonChange={setReason}
          busy={busy}
          onCancel={() => {
            if (!busy) {
              setDialogAction('');
              setReason('');
            }
          }}
          onConfirm={handleMutation}
        />
      ) : null}
    </main>
  );
}

function OrganizationDetail({ organization, busy, requiresRefresh, onBack, onAction, onRefresh }) {
  const fields = [
    ['Organisations-ID', organization.id, true],
    ['Principal-ID', organization.principalId, true],
    ['Namn', organization.name],
    ['Organisationsnummer', organization.registrationNumber],
    ['Organisationstyp', organization.type],
    ['E-post', organization.email],
    ['Beskrivning', organization.description],
    ['Skapad', formatDate(organization.createdAt)],
    ['Uppdaterad', formatDate(organization.updatedAt)],
  ].filter(([, value]) => value && value !== '—');

  return (
    <div>
      <button type="button" onClick={onBack} disabled={busy} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#8F40D4] hover:underline disabled:opacity-50">
        <FiArrowLeft /> Tillbaka
      </button>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Organisation</p>
          <h2 className="mt-1 text-xl font-bold text-[var(--brand-text-color)]">{organization.name || 'Namnlös organisation'}</h2>
        </div>
        <OrganizationStatusBadge status={organization.status} />
      </div>

      <dl className="divide-y divide-[var(--brand-border)] border-y border-[var(--brand-border)]">
        {fields.map(([label, value, technical]) => (
          <div key={label} className="py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
            <dd className={`mt-1 break-words text-sm text-[var(--brand-text-color)] ${technical ? 'font-mono text-xs' : ''}`}>{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 space-y-3">
        {requiresRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
          >
            <FiRefreshCw /> Uppdatera informationen före nytt försök
          </button>
        ) : (
          <OrganizationActions status={organization.status} busy={busy} onAction={onAction} />
        )}
      </div>
    </div>
  );
}

function OrganizationActions({ status, busy, onAction }) {
  if (status === 'Pending') {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <button type="button" onClick={() => onAction('approve')} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#8F40D4] px-4 py-3 text-sm font-bold text-white hover:bg-[#7932b8] disabled:opacity-50">
          <FiCheck /> Godkänn organisation
        </button>
        <button type="button" onClick={() => onAction('deny')} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">
          <FiSlash /> Neka organisation
        </button>
      </div>
    );
  }

  if (status === 'Denied' || status === 'Deactivated') {
    return (
      <button type="button" onClick={() => onAction('reactivate')} disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#8F40D4] px-4 py-3 text-sm font-bold text-white hover:bg-[#7932b8] disabled:opacity-50">
        <FiRefreshCw /> Återaktivera organisation
      </button>
    );
  }

  return <p className="rounded-lg bg-slate-50 px-3 py-3 text-center text-sm text-slate-500">Inga granskningsåtgärder för den här statusen.</p>;
}

function EmptyState({ label }) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><FiCheck size={20} /></div>
      <h3 className="font-semibold text-[var(--brand-text-color)]">{label}</h3>
      <p className="mt-1 text-sm text-slate-500">Listan är uppdaterad från Parklet.</p>
    </div>
  );
}
