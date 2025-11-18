"use client";
import AssetTokensTable from "@/components/assets/Tokens/AssetTokensTable";
import { Suspense, useEffect, useState } from "react";
import { fetchOrders } from "@/lib/fetchOrders"; 
import { Award, Activity, Timer } from "lucide-react";
import { useLanguage, content as i18nContent } from '../../../../../context/LanguageContext';

export default function TokensPage() {
  const { language } = useLanguage();
  const t = i18nContent[language]?.assetOrders || {};
  const [ordersData, setOrdersData] = useState({ loading: true, orders: [] });

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
      label: t.summary?.total || 'Total',
      value: `450 ${t.units?.tons || 'ton'}`,
      Icon: Award,
      accentClass: 'text-emerald-500 bg-emerald-100',
    },
    {
      label: t.summary?.active || 'Live tokens',
      value: '6',
      Icon: Activity,
      accentClass: 'text-blue-500 bg-blue-100',
    },
    {
      label: t.summary?.pending || 'Pending orders',
      value: '4',
      Icon: Timer,
      accentClass: 'text-amber-500 bg-amber-100',
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-[var(--brand-background)]">
      <h1 className="p-3 text-3xl font-bold text-[var(--brand-text)]">Asset Overview</h1>
      <section className="mt-4 mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map(({ label, value, Icon, accentClass }) => (
          <div
            key={label}
            className="flex flex-col rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-5 shadow-sm backdrop-blur"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-[var(--brand-text-secondary)]">{label}</p>
              <span
                className={`inline-flex items-center justify-center rounded-full p-2 ${accentClass}`}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
            </div>
            <p className="mt-5 text-3xl font-semibold text-[var(--brand-text)]">{value}</p>
          </div>
        ))}
      </section>
      <h1 className="p-3 text-3xl font-bold text-[var(--brand-text)]">{t.heading || 'Live tokens'}</h1>
      <Suspense fallback={<p className="text-[var(--brand-text-secondary)]">{t.loading || 'Loading orders...'}</p>}>
        <AssetTokensTable orders={ordersData.orders} isLoading={ordersData.loading} />
      </Suspense>
    </div>
  );
}
