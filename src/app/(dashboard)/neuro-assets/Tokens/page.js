"use client";
import AssetTokensTable from "@/components/assets/Tokens/AssetTokensTable";
import { Suspense, useEffect, useState } from "react";
import { fetchOrders } from "@/lib/fetchOrders"; 
import { Award, Activity, Timer, ArrowRight } from "lucide-react";
import { useLanguage, content as i18nContent } from '../../../../../context/LanguageContext';
import { useRouter } from "next/navigation";

export default function TokensPage() {
  const { language } = useLanguage();
  const t = i18nContent[language]?.assetOrders || {};
  const [ordersData, setOrdersData] = useState({ loading: true, orders: [] });
  const router = useRouter();

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

  const popularRegions = [
    'FCB Import & Export',
    'Manah Ativos',
    'Bress Capital',
    'Sadi Zanatta',
    'VRPL – Verde Pleno Ltda',
  ];

  const summaryCards = [
    {
      label: t.summary?.total || 'Total',
      value: `450 ${t.units?.tons || 'ton'}`,
      Icon: Award,
      accentClass: 'text-emerald-500 bg-emerald-100',
    },
    {
      label: t.summary?.activ || 'Live tokens',
      value: '278',
      Icon: Activity,
      accentClass: 'text-blue-500 bg-blue-100',
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-[var(--brand-background)]">
      <div className="grid grid-cols-3 gap-6">
        <section className="flex flex-col gap-6 ">
          {summaryCards.map(({ label, value, Icon, accentClass }) => (
            <div
              key={label}
              className="flex flex-col max-h-[150px] h-full rounded-2xl bg-[var(--brand-navbar)] p-5 shadow-md backdrop-blur"
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
        <div className="flex flex-col rounded-2xl bg-[var(--brand-navbar)] p-5 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Top issuers by sales</p>
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
        <div className="flex flex-col rounded-2xl bg-[var(--brand-navbar)] p-5 shadow-md min-h-[300px]">
          <h1 className="text-2xl font-semibold text-[var(--brand-text)]">Set up a new token</h1>
          <p className="mt-2 text-sm text-[var(--brand-text-secondary)]">
            Create and manage your neuro-assets tokens to facilitate trading and tracking of assets on the blockchain.
          </p>
          <button
            type="button"
            className="mt-auto w-[80%] self-end inline-flex items-center justify-center rounded-lg bg-[#8F40D4] px-4 py-2 text-sm font-medium text-white"
            onClick={() => router.push("/neuro-assets/createToken")}
          >
            {t.actions?.createToken || 'Create a new token'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-6 mt-6 bg-[var(--brand-navbar)] rounded-2xl shadow-md">
        <h1 className="pb-3 text-3xl font-bold text-[var(--brand-text)]">{t.heading || 'Live tokens'}</h1>
        <Suspense fallback={<p className="text-[var(--brand-text-secondary)]">{t.loading || 'Loading orders...'}</p>}>
          <AssetTokensTable orders={ordersData.orders} isLoading={ordersData.loading} />
        </Suspense>
      </div>
    </div>
  );
}
