"use client";
import AssetTokensTable from "@/components/assets/Tokens/AssetTokensTable";
import { Suspense, useEffect, useState } from "react";
import { fetchOrders } from "@/lib/fetchOrders"; 
import { Activity } from "lucide-react";
import { useLanguage, content as i18nContent } from '../../../../../context/LanguageContext';
import SaleModal from "@/components/assets/Sales/SaleModal";

export default function SalesPage() {
  const { language } = useLanguage();
  const t = i18nContent[language]?.assetOrders || {};
  const [ordersData, setOrdersData] = useState({ loading: true, orders: [] });
  const [selectedSale, setSelectedSale] = useState(null);

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

  const closeModal = () => setSelectedSale(null);
  const handleTokenClick = (token) => setSelectedSale(token);

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
      <SaleModal sale={selectedSale} onClose={closeModal} />
    </div>
  );
}
