"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { fetchOrders } from "@/lib/fetchOrders";
import { Award, Activity, Timer } from "lucide-react";
import { useLanguage, content as i18nContent } from '../../../../../context/LanguageContext';
import SalesTokensTable from "@/components/assets/Tokens/SalesTokensTable";

export default function SalesPage() {
  const { language } = useLanguage();
  const t = i18nContent[language]?.assetOrders || {};
  const [ordersData, setOrdersData] = useState({ loading: true, orders: [] });
  const [selectedToken, setSelectedToken] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchOrders();
        if (mounted) setOrdersData(data);
      } catch (e) {
        if (mounted) setOrdersData({ loading: false, orders: [] });
      }
    })();
    return () => { mounted = false; };
  }, []);


  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const buyerDisplay = useMemo(() => {
    const jid = selectedToken?.OwnerJid || selectedToken?.ownerJid;
    if (typeof jid === 'string') {
      const at = jid.indexOf('@');
      if (at > 0) return jid.slice(0, at);
      return jid;
    }
    return selectedToken?.buyer || selectedToken?.buyerName || '';
  }, [selectedToken]);
  const tags = useMemo(() => {
    const arr = Array.isArray(selectedToken?.token?.Tags)
      ? selectedToken.token.Tags
      : (Array.isArray(selectedToken?.tags) ? selectedToken.tags : []);
    const list = Array.isArray(arr) ? arr : [];
    return list.filter(t => t?.Name !== 'Coffee.Notes');
  }, [selectedToken]);
  const currencyDisplay = useMemo(() => {
    const tagCurrency = tags.find(t => t?.Name === 'Coffee.CurrencyCode')?.Value;
    return selectedToken?.currency || (typeof tagCurrency === 'string' ? tagCurrency : '') || '';
  }, [selectedToken, tags]);
  const amountDisplay = useMemo(() => {
    const cur = currencyDisplay;
    if (selectedToken?.value && cur) return `${selectedToken.value} ${cur}`;
    if (selectedToken?.price && cur) return `${selectedToken.price} ${cur}`;
    if (selectedToken?.amount && cur) return `${selectedToken.amount} ${cur}`;
    return '';
  }, [selectedToken, currencyDisplay]);

  const handleTokenClick = async (token) => {
    setSelectedToken(token);
    setDetailError("");
    const tokenId = token?.id ?? token?.tokenId;
    if (!tokenId) return;
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/tokens/${encodeURIComponent(tokenId)}`, { method: 'GET', credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data[0] : json?.data;
        if (data) {
          setSelectedToken(prev => ({ ...(prev || {}), ...(data || {}) }));
        }
      } else {
        setDetailError(`Failed to load details (${res.status})`);
      }
    } catch (e) {
      setDetailError('Failed to load details');
    } finally {
      setDetailLoading(false);
    }
  };
  const closeModal = () => setSelectedToken(null);
  return (
    <div className="p-6 min-h-screen bg-[var(--brand-background)]">
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-3 bg-[var(--brand-navbar)] shadow-md rounded-2xl p-5">
          <h1 className="p-3 text-3xl font-bold text-[var(--brand-text)]">{t.headin || 'Sales'}</h1>
          <Suspense fallback={<p className="text-[var(--brand-text-secondary)]">{t.loading || 'Loading orders...'}</p>}>
            <SalesTokensTable orders={ordersData.orders} isLoading={ordersData.loading} onRowClick={handleTokenClick} />
          </Suspense>
        </div>
      </div>
      {selectedToken && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full sm:max-w-[90vw] max-w-5xl max-h-[85vh] overflow-y-auto rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 text-[var(--brand-text)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-end gap-2 mb-2">
              <button
                type="button"
                className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-1.5 text-sm text-[var(--brand-text)]"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
            <header className="grid gap-4 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--brand-text-secondary)]">Issuer</p>
                <p className="text-lg font-semibold">{selectedToken.issuer || 'FCB Import & Export Ltda'}</p>
                <p className="text-sm text-[var(--brand-text-secondary)]">{selectedToken.assetName || 'Token'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--brand-text-secondary)]">Buyer</p>
                <p className="text-lg font-semibold">{buyerDisplay || '_'}</p>
              </div>
            </header>

            <section className="mt-5 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
              <h2 className="text-sm font-semibold text-[var(--brand-text-secondary)]">Order details</h2>
              {detailLoading ? (
                <div className="py-6 text-sm text-[var(--brand-text-secondary)]">Loading details…</div>
              ) : detailError ? (
                <div className="py-6 text-sm text-red-500">{detailError}</div>
              ) : (
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                    <dt className="text-[var(--brand-text-secondary)]">Token name:</dt>
                    <dd className="font-medium">{selectedToken.assetName || selectedToken.friendlyName || 'Token batch'}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                    <dt className="text-[var(--brand-text-secondary)]">Token type:</dt>
                    <dd className="font-medium">{selectedToken.category || 'Commodity'}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                    <dt className="text-[var(--brand-text-secondary)]">Issuer:</dt>
                    <dd className="font-medium">{'FCB Import & Export'}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                    <dt className="text-[var(--brand-text-secondary)]">Time of sale:</dt>
                    <dd className="font-medium">{selectedToken.createdDate || selectedToken.orderDate || '—'}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                    <dt className="text-[var(--brand-text-secondary)]">Purchased by:</dt>
                    <dd className="font-medium">{buyerDisplay || '—'}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                    <dt className="text-[var(--brand-text-secondary)]">Amount:</dt>
                    <dd className="font-medium">{amountDisplay || '—'}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                    <dt className="text-[var(--brand-text-secondary)]">Currency:</dt>
                    <dd className="font-medium">{currencyDisplay || '—'}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                    <dt className="text-[var(--brand-text-secondary)]">Payment status:</dt>
                    <dd className="font-medium">{'Paid'}</dd>
                  </div>
                </dl>
              )}
            </section>

            <section className="mt-4 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
              <h2 className="text-sm font-semibold text-[var(--brand-text-secondary)]">Company information</h2>
              {tags.length === 0 ? (
                <div className="py-3 text-sm text-[var(--brand-text-secondary)]">No company tags available.</div>
              ) : (
                <dl className="mt-3 space-y-2 text-sm">
                  {tags.map((tag, idx) => (
                    <div key={idx} className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-[var(--brand-text-secondary)]">{tag?.Name || 'Tag'}</dt>
                      <dd className="font-medium">{String(tag?.Value)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>

            {/* Token details card removed per request */}

            {/* Ownership section removed to focus on essential details */}

            <section className="mt-4 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
              <h2 className="text-sm font-semibold text-[var(--brand-text-secondary)]">Lifecycle</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-[var(--brand-text-secondary)]">Created date/time:</dt>
                  <dd className="font-medium">{selectedToken.createdDate || '—'}{selectedToken.createdTime ? `, ${selectedToken.createdTime}` : ''}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-[var(--brand-text-secondary)]">Updated date:</dt>
                  <dd className="font-medium">{selectedToken.updatedDate || '—'}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-[var(--brand-text-secondary)]">Expires:</dt>
                  <dd className="font-medium">{'Not Applicable'}</dd>
                </div>
              </dl>
            </section>

            {/* Action buttons intentionally hidden for now */}
          </div>
        </div>
      )}
    </div>
  );
}