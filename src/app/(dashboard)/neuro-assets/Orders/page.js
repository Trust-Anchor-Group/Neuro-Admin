'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, CircleDollarSign, Clock3, FileClock, RefreshCw, ShoppingCart } from 'lucide-react';
import {
  ADMIN_CONTRACT_STATUSES,
  getAdminContractStatus,
  getAdminContractStatusHistory,
  getAdminOrderId,
  getAdminOrderTimestamp,
  isAdminOrderId,
  isAdminOrderPaid,
  unwrapAdminOrders,
} from '@/lib/adminOrders.mjs';

function firstValue(order, keys, fallback = '-') {
  for (const key of keys) {
    const value = order?.[key];
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return fallback;
}

async function readPayload(response) {
  return await response.json().catch(() => null);
}

function apiMessage(payload, fallback) {
  const message = payload?.message || payload?.data?.message;
  return typeof message === 'string' && message.trim() ? message : fallback;
}

function formatTimestamp(value) {
  if (value === null || value === undefined || value === '') return 'Timestamp not provided';
  const numeric = Number(value);
  const date = typeof value === 'number' || (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value))
    ? new Date(numeric < 1e12 ? numeric * 1000 : numeric)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function formatStatusLabel(status) {
  return ({
    NotCreated: 'Not created',
    ContractSent: 'Contract sent',
    Created: 'Created',
  })[status] || status;
}

export default function OffchainOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [projectNames, setProjectNames] = useState({});
  const [contractStatusDrafts, setContractStatusDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [markingOrderId, setMarkingOrderId] = useState('');
  const [savingContractOrderId, setSavingContractOrderId] = useState('');
  const mutationRef = useRef(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/orders', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
        cache: 'no-store',
      });
      const payload = await readPayload(response);
      if (!response.ok) throw new Error(apiMessage(payload, `Failed to load orders (${response.status}).`));
      const loadedOrders = unwrapAdminOrders(payload);
      setOrders(loadedOrders);
      setContractStatusDrafts(Object.fromEntries(loadedOrders.map((order) => [
        getAdminOrderId(order), getAdminContractStatus(order),
      ])));

      const projectIds = [...new Set(loadedOrders
        .map((order) => String(order?.project_id ?? order?.projectId ?? '').trim())
        .filter(Boolean))];
      const projectEntries = await Promise.all(projectIds.map(async (projectId) => {
        try {
          const projectResponse = await fetch(`/api/projects?projectId=${encodeURIComponent(projectId)}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            credentials: 'include',
            cache: 'no-store',
          });
          if (!projectResponse.ok) return [projectId, projectId];
          const projectPayload = await readPayload(projectResponse);
          const project = projectPayload?.data?.data?.data
            ?? projectPayload?.data?.data
            ?? projectPayload?.data
            ?? projectPayload;
          const name = project?.localization?.title
            || project?.title
            || project?.token?.project_label
            || project?.token?.friendly_name
            || project?.project_name
            || project?.projectName;
          return [projectId, name ? String(name) : projectId];
        } catch {
          return [projectId, projectId];
        }
      }));
      setProjectNames(Object.fromEntries(projectEntries));
    } catch (requestError) {
      setError(requestError?.message || 'Failed to load off-chain orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const paidCount = useMemo(() => orders.filter(isAdminOrderPaid).length, [orders]);
  const pendingCount = orders.length - paidCount;

  const markPaid = async (order) => {
    const orderId = getAdminOrderId(order);
    if (!orderId || mutationRef.current) return;
    if (!window.confirm(`Mark order ${orderId} as paid? This will settle the off-chain payment.`)) return;

    mutationRef.current = true;
    setMarkingOrderId(orderId);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/paid`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });
      const payload = await readPayload(response);
      if (!response.ok) throw new Error(apiMessage(payload, `Failed to mark the order as paid (${response.status}).`));

      await loadOrders();
      setNotice(`Order ${orderId} was marked as paid.`);
    } catch (requestError) {
      setError(requestError?.message || 'Failed to mark the order as paid. Refresh before trying again.');
    } finally {
      mutationRef.current = false;
      setMarkingOrderId('');
    }
  };

  const updateContractStatus = async (order) => {
    const orderId = getAdminOrderId(order);
    const contractStatus = String(contractStatusDrafts[orderId] ?? '').trim();
    if (!orderId || !contractStatus || mutationRef.current) return;

    mutationRef.current = true;
    setSavingContractOrderId(orderId);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/contract-status`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ contract_status: contractStatus }),
      });
      const payload = await readPayload(response);
      if (!response.ok) throw new Error(apiMessage(payload, `Failed to update contract status (${response.status}).`));

      await loadOrders();
      setNotice(`Contract status for order ${orderId} was updated.`);
    } catch (requestError) {
      setError(requestError?.message || 'Failed to update contract status.');
    } finally {
      mutationRef.current = false;
      setSavingContractOrderId('');
    }
  };

  const cards = [
    { label: 'All orders', value: orders.length, Icon: ShoppingCart, className: 'text-blue-600 bg-blue-100' },
    { label: 'Awaiting payment', value: pendingCount, Icon: Clock3, className: 'text-amber-600 bg-amber-100' },
    { label: 'Paid', value: paidCount, Icon: CircleDollarSign, className: 'text-emerald-600 bg-emerald-100' },
  ];

  return (
    <div className="min-h-screen bg-[var(--brand-background)] p-6 text-[var(--brand-text)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Off-chain orders</h1>
          <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">Review Innova orders and confirm payments received outside the platform.</p>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          disabled={loading || Boolean(markingOrderId) || Boolean(savingContractOrderId)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <section className="my-6 grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, Icon, className }) => (
          <div key={label} className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-[var(--brand-text-secondary)]">{label}</p>
              <span className={`rounded-full p-2 ${className}`}><Icon className="h-5 w-5" /></span>
            </div>
            <p className="mt-5 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      {notice ? <p role="status" className="mb-4 rounded-lg border border-emerald-300/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">{notice}</p> : null}
      {error ? <p role="alert" className="mb-4 rounded-lg border border-rose-300/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-4 py-12 text-center text-sm text-[var(--brand-text-secondary)]">Loading off-chain orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-4 py-12 text-center text-sm text-[var(--brand-text-secondary)]">No off-chain orders found.</div>
        ) : orders.map((order, index) => {
              const orderId = getAdminOrderId(order);
              const paid = isAdminOrderPaid(order);
              const projectId = firstValue(order, ['project_id', 'projectId']);
              const contractStatus = getAdminContractStatus(order);
              const contractStatusDraft = contractStatusDrafts[orderId] ?? contractStatus;
              const contractHistory = getAdminContractStatusHistory(order);
              const tokenAmount = firstValue(order, ['token_amount', 'tokenAmount']);
              const paymentMethod = firstValue(order, ['payment_method', 'paymentMethod']);
              const legalId = firstValue(order, ['legal_id', 'legalId']);
              const email = firstValue(order, ['email']);
              const paymentStatus = firstValue(order, ['payment_status', 'paymentStatus', 'status'], paid ? 'Paid' : 'Unpaid');
              return (
                    <article key={orderId || `order-${index}`} className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-4 shadow-sm sm:p-5">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-semibold">{projectNames[String(projectId)] || String(projectId)}</h2>
                            <span className="rounded-full bg-[var(--brand-navbar)] px-2.5 py-1 text-xs font-medium">{String(tokenAmount)} tokens</span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${paid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                              {paid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}{String(paymentStatus)}
                            </span>
                          </div>
                          <p className="mt-1 break-all font-mono text-xs text-[var(--brand-text-secondary)]">Order {orderId || '-'}</p>

                          <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 2xl:grid-cols-4">
                            <div className="min-w-0"><dt className="text-xs text-[var(--brand-text-secondary)]">Buyer email</dt><dd className="break-all font-medium">{String(email)}</dd></div>
                            <div className="min-w-0"><dt className="text-xs text-[var(--brand-text-secondary)]">Legal ID</dt><dd className="break-all font-mono text-xs">{String(legalId)}</dd></div>
                            <div><dt className="text-xs text-[var(--brand-text-secondary)]">Payment method</dt><dd className="font-medium">{String(paymentMethod)}</dd></div>
                            <div><dt className="text-xs text-[var(--brand-text-secondary)]">Order timestamp</dt><dd className="font-medium">{formatTimestamp(getAdminOrderTimestamp(order))}</dd></div>
                          </dl>
                        </div>

                        <div className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-3 xl:max-w-md">
                          <label htmlFor={`contract-status-${orderId}`} className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">Contract status</label>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <select
                              id={`contract-status-${orderId}`}
                              value={contractStatusDraft}
                              onChange={(event) => setContractStatusDrafts((current) => ({ ...current, [orderId]: event.target.value }))}
                              disabled={Boolean(savingContractOrderId) || Boolean(markingOrderId)}
                              className="min-w-0 flex-1 rounded-md border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm"
                            >
                              {ADMIN_CONTRACT_STATUSES.map((status) => <option key={status} value={status}>{formatStatusLabel(status)}</option>)}
                            </select>
                            <button
                              type="button"
                              onClick={() => updateContractStatus(order)}
                              disabled={!isAdminOrderId(orderId) || contractStatusDraft === contractStatus || Boolean(savingContractOrderId) || Boolean(markingOrderId)}
                              className="rounded-md bg-[var(--brand-button)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                              {savingContractOrderId === orderId ? 'Saving...' : 'Save status'}
                            </button>
                          </div>
                          <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">Current: <span className="font-semibold text-[var(--brand-text)]">{formatStatusLabel(contractStatus)}</span></p>
                          {!paid ? (
                            <button
                              type="button"
                              onClick={() => markPaid(order)}
                              disabled={!isAdminOrderId(orderId) || Boolean(markingOrderId) || Boolean(savingContractOrderId)}
                              className="mt-3 w-full rounded-md border border-[var(--brand-border)] px-3 py-2 text-sm font-semibold disabled:opacity-50"
                            >
                              {markingOrderId === orderId ? 'Marking paid...' : 'Mark payment as paid'}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <details className="group mt-4 border-t border-[var(--brand-border)] pt-3">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold">
                          <span className="flex items-center gap-2">
                          <FileClock className="h-4 w-4 text-[var(--brand-text-secondary)]" />
                          Contract history <span className="font-normal text-[var(--brand-text-secondary)]">({contractHistory.length} {contractHistory.length === 1 ? 'event' : 'events'})</span>
                          </span>
                          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                        </summary>
                        {contractHistory.length ? (
                          <ol className="mt-4 space-y-3 pl-1">
                            {contractHistory.map((event, eventIndex) => (
                              <li key={`${event.status}-${eventIndex}`} className="flex gap-3">
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-accent)]" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium">{formatStatusLabel(event.status)}</p>
                                  <p className="mt-0.5 text-xs text-[var(--brand-text-secondary)]">{formatTimestamp(event.timestamp)}</p>
                                </div>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="mt-3 text-sm text-[var(--brand-text-secondary)]">No contract status history was returned for this order.</p>
                        )}
                      </details>
                    </article>
              );
        })}
      </div>
    </div>
  );
}
