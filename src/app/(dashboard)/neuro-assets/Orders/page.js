'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, CircleDollarSign, Clock3, RefreshCw, ShoppingCart } from 'lucide-react';
import { getAdminOrderId, isAdminOrderId, isAdminOrderPaid, unwrapAdminOrders } from '@/lib/adminOrders.mjs';

function firstValue(order, keys, fallback = '-') {
  for (const key of keys) {
    const value = order?.[key];
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return fallback;
}

function formatDate(value) {
  if (value === null || value === undefined || value === '') return '-';
  const numeric = Number(value);
  const date = Number.isFinite(numeric)
    ? new Date(numeric < 1e12 ? numeric * 1000 : numeric)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function formatMoney(order) {
  const value = firstValue(order, ['paying_price_display', 'total_display'], '');
  if (value) return String(value);
  const amount = firstValue(order, ['paying_price', 'total_price', 'total', 'amount'], '-');
  const currency = firstValue(order, ['currency', 'paying_currency'], '');
  return currency ? `${amount} ${String(currency).toUpperCase()}` : String(amount);
}

async function readPayload(response) {
  return await response.json().catch(() => null);
}

function apiMessage(payload, fallback) {
  const message = payload?.message || payload?.data?.message;
  return typeof message === 'string' && message.trim() ? message : fallback;
}

export default function OffchainOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [markingOrderId, setMarkingOrderId] = useState('');
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
      setOrders(unwrapAdminOrders(payload));
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
          disabled={loading || Boolean(markingOrderId)}
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

      <div className="overflow-x-auto rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)]">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--brand-third)] text-left text-xs uppercase tracking-wide text-[var(--brand-text-secondary)]">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-[var(--brand-text-secondary)]">Loading off-chain orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-[var(--brand-text-secondary)]">No off-chain orders found.</td></tr>
            ) : orders.map((order, index) => {
              const orderId = getAdminOrderId(order);
              const paid = isAdminOrderPaid(order);
              const buyerName = firstValue(order, ['full_name', 'buyer_name', 'buyerName', 'email'], 'Unknown buyer');
              const buyerDetail = firstValue(order, ['email', 'buyer_legal_id', 'buyerLegalId'], '');
              const project = firstValue(order?.extra || {}, ['project_name', 'projectName'], firstValue(order, ['project_name', 'projectName', 'project_id', 'projectId']));
              return (
                <tr key={orderId || `order-${index}`} className="border-t border-[var(--brand-border)] hover:bg-[var(--brand-hover)]/40">
                  <td className="px-4 py-3 font-mono text-xs">{orderId || '-'}</td>
                  <td className="px-4 py-3">{String(project)}</td>
                  <td className="px-4 py-3"><span className="block font-medium">{String(buyerName)}</span>{buyerDetail && buyerDetail !== buyerName ? <span className="block text-xs text-[var(--brand-text-secondary)]">{String(buyerDetail)}</span> : null}</td>
                  <td className="px-4 py-3">{String(firstValue(order, ['token_count', 'tokenCount', 'quantity', 'amount']))}</td>
                  <td className="px-4 py-3">{formatMoney(order)}</td>
                  <td className="px-4 py-3">{formatDate(firstValue(order, ['created', 'created_at', 'createdAt', 'created_date'], ''))}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${paid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      {paid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}{paid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {paid ? <span className="text-xs text-[var(--brand-text-secondary)]">Settled</span> : (
                      <button
                        type="button"
                        onClick={() => markPaid(order)}
                        disabled={!isAdminOrderId(orderId) || Boolean(markingOrderId)}
                        className="rounded-lg bg-[var(--brand-button)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {markingOrderId === orderId ? 'Marking paid...' : 'Mark as paid'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
