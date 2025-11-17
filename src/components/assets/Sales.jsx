import React, { Suspense, useState, useEffect, useMemo } from "react";
import { useLanguage, content as i18nContent } from "../../../context/LanguageContext";
import AssetTokensTable from "./Tokens/AssetTokensTable";
import { fetchTokensClientSide } from "./Tokens/tokenFetch";
import { Activity } from 'lucide-react';


const Sales = () => {
  const { language } = useLanguage();
  const t = i18nContent[language]?.Manage || {};
  const [ordersData, setOrdersData] = useState({ loading: true, orders: [], rawTokens: [] });
  // Fetch tokens on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchTokensClientSide(50, 0);
        const raw = data?.data || [];
        const mapped = raw.map(token => ({
          id: token.tokenId,
          assetName: token.friendlyName || token.assetName || '',
          category: token.category || token.type || '',
          amount: `${token.value ?? token.amount ?? ''} ${token.currency || ''}`.trim(),
          orderDate: token.createdDate || token.createdAt || '',
          status: token.status || 'pending'
        }));
        if (mounted) setOrdersData({ loading: false, orders: mapped, rawTokens: raw });
      } catch (e) {
        if (mounted) setOrdersData({ loading: false, orders: [], rawTokens: [], error: true });
      }
    })();
    return () => { mounted = false; };
  }, []);
  // Summary metrics (only active tokens for now)
  const summaryCards = useMemo(() => {
    const activeCount = ordersData.orders.filter(o => ['active','pending','in-progress'].includes(o.status?.toLowerCase())).length;
    return [
      { label: t.summary?.activeToken || 'Average daily sales', value: String(activeCount), Icon: Activity, accentClass: 'text-blue-500 bg-blue-100' },
    ];
  }, [ordersData.orders, t.summary]);
  const popularRegions = useMemo(() => ['Brazil','Sweden','USA','Germany','Finland'], []);
  return (
    <div className="space-y-6">
      <div className='grid grid-cols-4 gap-5'>
        <div className='mx-auto col-span-3 w-full bg-[var(--brand-navbar)] shadow-md p-5 rounded-lg '>
          <h1 className='font-semibold text-xl mb-5'>
            Sales
          </h1>
          <Suspense fallback={<p className="text-[var(--brand-text-secondary)]">{t.loading || 'Loading orders...'}</p>}>
            <AssetTokensTable orders={ordersData.orders} isLoading={ordersData.loading} />
          </Suspense>
          </div>
          <div className='flex flex-col gap-5'>
            {summaryCards.map(({ label, value, Icon, accentClass }) => (
              <div
                key={label}
                className="flex flex-col rounded-2xl gap-2 bg-[var(--brand-navbar)] p-5 shadow-md backdrop-blur"
              >
                <p className="text-sm font-medium text-[var(--brand-text-secondary)]">{label}</p>
                <div className="flex flex-row items-center gap-3">
                  <span className={`flex items-center justify-center rounded-full p-2 ${accentClass}`}>
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <p className="text-3xl font-semibold text-[var(--brand-text)]">{value}</p>
                </div>
                      
              </div>
            ))}
                  <div className="flex flex-col rounded-2xl bg-[var(--brand-navbar)] p-5 shadow-md">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Popular regions</p>
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
    </div>
  );
};
export default Sales;