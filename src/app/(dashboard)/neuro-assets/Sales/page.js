"use client";
import AssetTokensTable from "@/components/assets/Tokens/AssetTokensTable";
import { Suspense, useEffect, useState } from "react";
import { fetchOrders } from "@/lib/fetchOrders"; 
import { Award, Activity, Timer } from "lucide-react";
import { useLanguage, content as i18nContent } from '../../../../../context/LanguageContext';

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

  const summaryCards = [
    {
      label: t.summary?.active || 'Average daily sales',
      value: '278',
      Icon: Activity,
      accentClass: 'text-blue-500 bg-blue-100',
    },
  ];

  const popularRegions = [
    'FCB Import & Export',
    'Manah Ativos',
    'Bress Capital',
    'Sadi Zanatta',
    'VRPL – Verde Pleno Ltda',
  ];

  const closeModal = () => setSelectedToken(null);
  const handleTokenClick = (token) => setSelectedToken(token);

  return (
    <div className="p-6 min-h-screen bg-[var(--brand-background)]">
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3 bg-[var(--brand-navbar)] shadow-md rounded-2xl p-5">
            <h1 className="p-3 text-3xl font-bold text-[var(--brand-text)]">{t.headin || 'Sales'}</h1>
            <Suspense fallback={<p className="text-[var(--brand-text-secondary)]">{t.loading || 'Loading orders...'}</p>}>
                <AssetTokensTable orders={ordersData.orders} isLoading={ordersData.loading} onRowClick={handleTokenClick} />
            </Suspense>
        </div>
        <div className="col-span-1 gap-6 flex flex-col">
            <section className="flex flex-col gap-4 ">
                {summaryCards.map(({ label, value, Icon, accentClass }) => (
                <div
                    key={label}
                    className="flex flex-col rounded-2xl bg-[var(--brand-navbar)] p-5 shadow-md"
                >
                <div className='flex items-start justify-between'>
                    <p className='text-sm font-medium text-[var(--brand-text-secondary)]'>{label}</p>
                </div>
                <div className='flex flex-row items-center gap-3 mt-3'>
                    <span className={`flex items-center justify-center rounded-full p-2 ${accentClass}`}>
                    <Icon className='h-5 w-5' strokeWidth={2.2} />
                    </span>
                    <p className='text-3xl font-semibold text-[var(--brand-text)]'>{value}</p>
                </div>
                </div>
            ))}
            </section>
            <div className="flex flex-col rounded-2xl bg-[var(--brand-navbar)] p-5 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Popular assets this month</p>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--brand-border)] text-lg text-[var(--brand-text-secondary)]"
              aria-label="Popular regions actions"
            >
              ···
            </button>
          </div>
          <ol className="space-y-2 text-sm text-[var(--brand-text)]">
            {popularRegions.map((region, index) => (
              <li
                key={region}
                className={`flex items-center py-1 text-base font-medium ${
                index === popularRegions.length - 1 ? '' : 'border-b border-[var(--brand-border)]'
                }`}
              >
                <span className="w-6 text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
                  {index + 1}
                </span>
                <span className="ml-3 flex-1">{region}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex flex-col rounded-2xl bg-[var(--brand-navbar)] p-5 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Popular issuers this month</p>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--brand-border)] text-lg text-[var(--brand-text-secondary)]"
              aria-label="Popular regions actions"
            >
              ···
            </button>
          </div>
          <ol className="space-y-2 text-sm text-[var(--brand-text)]">
            {popularRegions.map((region, index) => (
              <li
                key={region}
                className={`flex items-center py-1 text-base font-medium ${
                index === popularRegions.length - 1 ? '' : 'border-b border-[var(--brand-border)]'
                }`}
              >
                <span className="w-6 text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
                  {index + 1}
                </span>
                <span className="ml-3 flex-1">{region}</span>
              </li>
            ))}
          </ol>
        </div>
        </div>
      </div>
      {selectedToken && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-3xl rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 text-[var(--brand-text)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="grid gap-4 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--brand-text-secondary)]">Issuer</p>
                <p className="text-lg font-semibold">{selectedToken.issuer || 'EcoTech Solutions'}</p>
                <p className="text-sm text-[var(--brand-text-secondary)]">{selectedToken.assetName || 'Token'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--brand-text-secondary)]">Buyer</p>
                <p className="text-lg font-semibold">{selectedToken.buyer || 'Anna Lindberg'}</p>
                <p className="text-sm text-[var(--brand-text-secondary)]">EcoTech Solutions</p>
              </div>
            </header>

            <section className="mt-5 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
              <h2 className="text-sm font-semibold text-[var(--brand-text-secondary)]">Order details</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-[var(--brand-text-secondary)]">Token name:</dt>
                  <dd className="font-medium">{selectedToken.assetName || 'Token batch'}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-[var(--brand-text-secondary)]">Token type:</dt>
                  <dd className="font-medium">{selectedToken.category || 'Commodity'}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-[var(--brand-text-secondary)]">Issuer:</dt>
                  <dd className="font-medium">{selectedToken.issuer || 'FCB Import & Export'}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-[var(--brand-text-secondary)]">Time of sale:</dt>
                  <dd className="font-medium">{selectedToken.orderDate || '2024-02-02, 15:29'}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-[var(--brand-text-secondary)]">Purchased by:</dt>
                  <dd className="font-medium">{selectedToken.buyer || 'Anna Lindberg'}</dd>
                </div>
              </dl>
            </section>

            <section className="mt-4 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
              <h2 className="text-sm font-semibold text-[var(--brand-text-secondary)]">Company information</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-[var(--brand-text-secondary)]">Purchase amount:</dt>
                  <dd className="font-medium">{selectedToken.amount || '180 kg'}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-[var(--brand-text-secondary)]">Purchase price:</dt>
                  <dd className="font-medium">{selectedToken.price || '2,045.00 EUR'}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-[var(--brand-text-secondary)]">Payment method:</dt>
                  <dd className="font-medium">{selectedToken.paymentMethod || 'Invoice'}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-[var(--brand-text-secondary)]">Payment due:</dt>
                  <dd className="font-medium">{selectedToken.paymentDue || '2025-03-28'}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-[var(--brand-text-secondary)]">Payment received:</dt>
                  <dd className="font-medium">{selectedToken.paymentReceived || '2025-03-26, 15:29'}</dd>
                </div>
              </dl>
            </section>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="flex-1 rounded-2xl bg-[var(--brand-primary-light,#E1D1FF)] px-4 py-3 text-center text-sm font-semibold text-[var(--brand-primary-text,#4D2C91)] shadow-inner"
              >
                Manage sale
              </button>
              <button
                type="button"
                className="flex-1 rounded-2xl bg-red-100 px-4 py-3 text-center text-sm font-semibold text-red-600"
              >
                Issue refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
