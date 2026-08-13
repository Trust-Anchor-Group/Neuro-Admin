'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FiArrowLeft, FiCheck, FiExternalLink, FiMapPin, FiRefreshCw, FiSlash } from 'react-icons/fi';
import ParkingStatusBadge from '@/components/parklet/ParkingStatusBadge';
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
  { status: 'Approved', label: 'Godkända' },
  { status: 'Rejected', label: 'Nekade' },
];

const ACTIONS = {
  approve: {
    endpoint: 'approve',
    title: 'Godkänn parkering?',
    description: 'Parkeringen markeras som godkänd och kan därefter användas enligt Parklets vanliga regler för synlighet och bokning.',
    confirmLabel: 'Godkänn parkering',
    successMessage: 'Parkeringen har godkänts.',
    failureMessage: 'Parkeringen kunde inte godkännas.',
    affectedStatuses: ['Pending', 'Approved'],
  },
  reject: {
    endpoint: 'reject',
    title: 'Neka parkering?',
    confirmLabel: 'Neka parkering',
    successMessage: 'Parkeringen har nekats.',
    failureMessage: 'Parkeringen kunde inte nekas.',
    reasonRequired: true,
    destructive: true,
    affectedStatuses: ['Pending', 'Rejected'],
  },
};

export default function ParkletParkingAreasClient() {
  const [activeStatus, setActiveStatus] = useState('Pending');
  const [lists, setLists] = useState({});
  const [loadingStatuses, setLoadingStatuses] = useState({});
  const [listErrors, setListErrors] = useState({});
  const [selectedId, setSelectedId] = useState('');
  const [parkingArea, setParkingArea] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [notice, setNotice] = useState(null);
  const [dialogAction, setDialogAction] = useState('');
  const [reason, setReason] = useState('');
  const [mutationAction, setMutationAction] = useState('');
  const [requiresRefresh, setRequiresRefresh] = useState(false);
  const mutationRef = useRef(false);

  const loadParkingAreas = useCallback(async (status) => {
    setLoadingStatuses((current) => ({ ...current, [status]: true }));
    setListErrors((current) => ({ ...current, [status]: '' }));
    try {
      const response = await fetch(`/api/admin/parking-areas?status=${encodeURIComponent(status)}`, {
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
        [status]: getReadErrorMessage(error, 'Parklet-parkeringar'),
      }));
      throw error;
    } finally {
      setLoadingStatuses((current) => ({ ...current, [status]: false }));
    }
  }, []);

  const loadParkingArea = useCallback(async (parkingAreaId) => {
    if (!parkingAreaId) return null;
    setLoadingDetail(true);
    setDetailError('');
    try {
      const response = await fetch(`/api/admin/parking-areas/${encodeURIComponent(parkingAreaId)}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      const body = await readJson(response);
      if (!response.ok) throw createRequestError(response, body);
      setParkingArea(body);
      return body;
    } catch (error) {
      setDetailError(getReadErrorMessage(error, 'Parklet-parkeringen'));
      throw error;
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    loadParkingAreas(activeStatus).catch(() => {});
  }, [activeStatus, loadParkingAreas]);

  const changeStatus = (status) => {
    if (mutationRef.current) return;
    setActiveStatus(status);
    setSelectedId('');
    setParkingArea(null);
    setDetailError('');
    setNotice(null);
    setRequiresRefresh(false);
  };

  const handleSelect = (parkingAreaId) => {
    setSelectedId(parkingAreaId);
    setParkingArea(null);
    setNotice(null);
    setRequiresRefresh(false);
    loadParkingArea(parkingAreaId).catch(() => {});
  };

  const handleBack = () => {
    setSelectedId('');
    setParkingArea(null);
    setDetailError('');
    setNotice(null);
    setRequiresRefresh(false);
  };

  const refreshRealData = useCallback(async (statuses = [activeStatus], parkingAreaId = selectedId) => {
    const uniqueStatuses = [...new Set(statuses)];
    const results = await Promise.allSettled([
      ...uniqueStatuses.map((status) => loadParkingAreas(status)),
      parkingAreaId ? loadParkingArea(parkingAreaId) : Promise.resolve(null),
    ]);
    return results.every((result) => result.status === 'fulfilled');
  }, [activeStatus, loadParkingArea, loadParkingAreas, selectedId]);

  const openDialog = (action) => {
    if (mutationRef.current || requiresRefresh) return;
    setDialogAction(action);
    setReason('');
    setNotice(null);
  };

  const handleMutation = async () => {
    const action = ACTIONS[dialogAction];
    const currentParkingArea = parkingArea;
    if (
      !action ||
      !currentParkingArea?.id ||
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
        parkingAreaId: currentParkingArea.id,
        ...(action.reasonRequired ? { reason: reason.trim() } : {}),
      };
      const response = await fetch(
        `/api/admin/parking-areas/${encodeURIComponent(currentParkingArea.id)}/${action.endpoint}`,
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
        setNotice({ type: 'error', message: safeBackendMessage(body) || action.failureMessage });
      } else {
        setNotice({ type: 'success', message: action.successMessage });
      }
    } catch {
      unknownOutcome = true;
      setNotice({ type: 'warning', message: UNKNOWN_OUTCOME_MESSAGE });
    }

    if (unknownOutcome) setRequiresRefresh(true);
    const refreshed = await refreshRealData(action.affectedStatuses, currentParkingArea.id);
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

  const parkingAreas = lists[activeStatus] || [];
  const loadingList = Boolean(loadingStatuses[activeStatus]);
  const listError = listErrors[activeStatus] || '';
  const busy = Boolean(mutationAction);
  const activeTab = TABS.find((tab) => tab.status === activeStatus);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-[#8F40D4]">Parklet</p>
          <h1 className="text-2xl font-bold text-[var(--brand-text-color)]">Parkeringsgranskning</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Granska parkeringsområden och deras faktiska status i Parklet.
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)]">
        <section className="overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-third)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--brand-border)] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[var(--brand-text-color)]">{activeTab?.label}</h2>
              <p className="mt-0.5 text-xs text-slate-500">Serverfiltrerat på status {activeStatus}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{parkingAreas.length}</span>
          </div>

          {loadingList ? (
            <LoadingState label="Läser parkeringar…" />
          ) : listError ? (
            <ErrorState message={listError} onRetry={() => loadParkingAreas(activeStatus).catch(() => {})} />
          ) : parkingAreas.length === 0 ? (
            <EmptyState label={`Inga parkeringar under ${activeTab?.label?.toLowerCase() || activeStatus}`} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Adress</th>
                    <th className="px-5 py-3 font-semibold">Läge</th>
                    <th className="px-5 py-3 font-semibold">Synlighet</th>
                    <th className="px-5 py-3 font-semibold">Kapacitet</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Skapad</th>
                    <th className="px-5 py-3 text-right font-semibold">Åtgärd</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--brand-border)]">
                  {parkingAreas.map((item) => (
                    <tr key={item.id} className={selectedId === item.id ? 'bg-purple-50/70' : ''}>
                      <td className="px-5 py-4">
                        <p className="max-w-[260px] font-semibold text-[var(--brand-text-color)]">{item.address || 'Adress saknas'}</p>
                        <p className="mt-0.5 max-w-[240px] truncate font-mono text-[11px] text-slate-400" title={item.id}>{item.id}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{item.mode || '—'}</td>
                      <td className="px-5 py-4 text-slate-600">{item.parkingVisibility || '—'}</td>
                      <td className="px-5 py-4 text-slate-600">{item.capacity ?? '—'}</td>
                      <td className="px-5 py-4"><ParkingStatusBadge status={item.status} /></td>
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
              <div className="mb-3 rounded-full bg-purple-50 p-3 text-[#8F40D4]"><FiMapPin size={22} /></div>
              <h2 className="font-semibold text-[var(--brand-text-color)]">Välj en parkering</h2>
              <p className="mt-1 max-w-xs text-sm text-slate-500">Öppna en rad för att se adress, geometri, platser och tillåtna granskningsåtgärder.</p>
            </div>
          ) : loadingDetail && !parkingArea ? (
            <LoadingState label="Läser parkering…" />
          ) : detailError && !parkingArea ? (
            <ErrorState message={detailError} onRetry={() => loadParkingArea(selectedId).catch(() => {})} />
          ) : parkingArea ? (
            <ParkingAreaDetail
              parkingArea={parkingArea}
              busy={busy}
              requiresRefresh={requiresRefresh}
              onBack={handleBack}
              onAction={openDialog}
              onRefresh={handleForcedRefresh}
            />
          ) : null}
        </aside>
      </div>

      {dialogAction && parkingArea ? (
        <ReviewActionDialog
          {...ACTIONS[dialogAction]}
          entityLabel={parkingArea.address || parkingArea.id}
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

function ParkingAreaDetail({ parkingArea, busy, requiresRefresh, onBack, onAction, onRefresh }) {
  const fields = [
    ['Parkerings-ID', parkingArea.id, true],
    ['Principal-ID', parkingArea.principalId, true],
    ['Adress', parkingArea.address],
    ['Beskrivning', parkingArea.description],
    ['Läge', parkingArea.mode],
    ['Godkännandeläge', parkingArea.approvalMode],
    ['Synlighet', parkingArea.parkingVisibility],
    ['Kapacitet', parkingArea.capacity],
    ['Platstyp-ID', parkingArea.locationTypeId, true],
    ['Grupp-ID', parkingArea.groupId, true],
    ['Åtkomstkod krävs', formatBoolean(parkingArea.requiresAccessCode)],
    ['Nyckelbricka krävs', formatBoolean(parkingArea.requiresKeyFob)],
    ['Mittpunkt', formatCoordinate(parkingArea.center)],
    ['Gränspunkter', parkingArea.boundary?.corners?.length],
    ['Skapad', formatDate(parkingArea.createdAt)],
    ['Uppdaterad', formatDate(parkingArea.updatedAt)],
  ].filter(([, value]) => value !== undefined && value !== '' && value !== '—');

  return (
    <div>
      <button type="button" onClick={onBack} disabled={busy} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#8F40D4] hover:underline disabled:opacity-50">
        <FiArrowLeft /> Tillbaka
      </button>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Parkeringsområde</p>
          <h2 className="mt-1 text-lg font-bold text-[var(--brand-text-color)]">{parkingArea.address || 'Adress saknas'}</h2>
        </div>
        <ParkingStatusBadge status={parkingArea.status} />
      </div>

      <GeometryPreview parkingArea={parkingArea} />

      <dl className="mt-5 divide-y divide-[var(--brand-border)] border-y border-[var(--brand-border)]">
        {fields.map(([label, value, technical]) => (
          <div key={label} className="py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
            <dd className={`mt-1 break-words text-sm text-[var(--brand-text-color)] ${technical ? 'font-mono text-xs' : ''}`}>{value}</dd>
          </div>
        ))}
      </dl>

      {parkingArea.photoUrls?.length ? (
        <section className="mt-5">
          <h3 className="text-sm font-bold text-[var(--brand-text-color)]">Foton</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {parkingArea.photoUrls.map((url, index) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-2 text-xs font-bold text-[#8F40D4] hover:bg-purple-50">
                Foto {index + 1} <FiExternalLink />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {parkingArea.squares?.length ? <ParkingSquares squares={parkingArea.squares} /> : null}

      <div className="mt-6">
        {requiresRefresh ? (
          <button type="button" onClick={onRefresh} disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-50">
            <FiRefreshCw /> Uppdatera informationen före nytt försök
          </button>
        ) : parkingArea.status === 'Pending' ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <button type="button" onClick={() => onAction('approve')} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#8F40D4] px-4 py-3 text-sm font-bold text-white hover:bg-[#7932b8] disabled:opacity-50">
              <FiCheck /> Godkänn parkering
            </button>
            <button type="button" onClick={() => onAction('reject')} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">
              <FiSlash /> Neka parkering
            </button>
          </div>
        ) : (
          <p className="rounded-lg bg-slate-50 px-3 py-3 text-center text-sm text-slate-500">Inga granskningsåtgärder för den här statusen.</p>
        )}
      </div>
    </div>
  );
}

function GeometryPreview({ parkingArea }) {
  const areaCorners = parkingArea.boundary?.corners || [];
  const squareCorners = (parkingArea.squares || []).flatMap((square) => square.boundary?.corners || []);
  const allCoordinates = [...areaCorners, ...squareCorners, ...(parkingArea.center ? [parkingArea.center] : [])];
  if (!allCoordinates.length) return null;

  const latitudes = allCoordinates.map((coordinate) => coordinate.latitude);
  const longitudes = allCoordinates.map((coordinate) => coordinate.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeSpan = maxLatitude - minLatitude || 0.0001;
  const longitudeSpan = maxLongitude - minLongitude || 0.0001;
  const project = (coordinate) => ({
    x: 12 + ((coordinate.longitude - minLongitude) / longitudeSpan) * 276,
    y: 188 - ((coordinate.latitude - minLatitude) / latitudeSpan) * 176,
  });
  const polygonPoints = (corners) => corners.map(project).map(({ x, y }) => `${x},${y}`).join(' ');
  const center = parkingArea.center ? project(parkingArea.center) : null;

  return (
    <figure className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <svg viewBox="0 0 300 200" role="img" aria-label="Geometrisk förhandsvisning av parkeringsområdet" className="h-48 w-full">
        <defs>
          <pattern id={`parking-grid-${parkingArea.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="300" height="200" fill={`url(#parking-grid-${parkingArea.id})`} />
        {areaCorners.length >= 3 ? (
          <polygon points={polygonPoints(areaCorners)} fill="#8F40D433" stroke="#8F40D4" strokeWidth="3" />
        ) : null}
        {(parkingArea.squares || []).map((square) => square.boundary?.corners?.length >= 3 ? (
          <polygon key={square.id} points={polygonPoints(square.boundary.corners)} fill="#0ea5e922" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 3" />
        ) : null)}
        {center ? <circle cx={center.x} cy={center.y} r="5" fill="#7e22ce" stroke="white" strokeWidth="2" /> : null}
      </svg>
      <figcaption className="border-t border-slate-200 px-3 py-2 text-xs text-slate-500">
        Geometrisk förhandsvisning från API-data. Lila visar området och blå streck visar numrerade platser.
      </figcaption>
    </figure>
  );
}

function ParkingSquares({ squares }) {
  return (
    <section className="mt-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[var(--brand-text-color)]">Numrerade platser</h3>
        <span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700">{squares.length}</span>
      </div>
      <div className="mt-2 space-y-2">
        {squares.map((square, index) => (
          <div key={square.id} className="rounded-lg border border-slate-200 px-3 py-2">
            <p className="text-sm font-semibold text-slate-800">{square.label || `Plats ${index + 1}`}</p>
            <p className="mt-0.5 truncate font-mono text-[10px] text-slate-400" title={square.id}>{square.id}</p>
            <dl className="mt-2 grid gap-1 text-xs text-slate-500">
              {square.queueId ? <div><dt className="inline font-semibold">Queue-ID: </dt><dd className="inline font-mono">{square.queueId}</dd></div> : null}
              {square.center ? <div><dt className="inline font-semibold">Mittpunkt: </dt><dd className="inline">{formatCoordinate(square.center)}</dd></div> : null}
              {square.createdAt ? <div><dt className="inline font-semibold">Skapad: </dt><dd className="inline">{formatDate(square.createdAt)}</dd></div> : null}
              {square.updatedAt ? <div><dt className="inline font-semibold">Uppdaterad: </dt><dd className="inline">{formatDate(square.updatedAt)}</dd></div> : null}
            </dl>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">Godkännandet gäller parkeringsområdet; platserna har inga egna granskningsåtgärder.</p>
    </section>
  );
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

function formatBoolean(value) {
  if (typeof value !== 'boolean') return undefined;
  return value ? 'Ja' : 'Nej';
}

function formatCoordinate(value) {
  if (!value) return undefined;
  return `${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}`;
}
