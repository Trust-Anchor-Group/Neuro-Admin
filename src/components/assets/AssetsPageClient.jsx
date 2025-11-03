"use client";

import React, { Suspense, useMemo, useEffect, useState } from "react";
import { useLanguage, content } from "../../../context/LanguageContext";
import DigitalAssetsTable from "@/components/assets/DigitalAssetsTable";
import { Award, Activity, Users, Timer } from "lucide-react";
import { fetchOrders } from "@/lib/fetchOrders";

export default function AssetsPageClient() {
  const { language } = useLanguage();
  const t = content[language]?.Clients;
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

  const assets = useMemo(() => {
    return (ordersData?.orders || []).map((o) => ({
      id: o.id,
      name: o.assetName || o.category || t?.table?.columns?.name || "Unknown asset",
      address: o.address || t?.table?.columns?.address || "Unknown address",
      carbonProcessed: o.amount || "N/A",
      status: o.status === "Active" ? (t?.table?.statusActive || "Active") : (t?.table?.statusInactive || "Inactive"),
    }));
  }, [ordersData, t]);

  const summaryCards = [
    {
      label: t?.summary?.total || "Total",
      value: "450 ton",
      Icon: Award,
      accentClass: "text-emerald-500 bg-emerald-100",
    },
    {
      label: t?.summary?.activeOrders || "Active orders",
      value: "6",
      Icon: Activity,
      accentClass: "text-blue-500 bg-blue-100",
    },
    {
      label: t?.summary?.totalClients || "Total clients",
      value: "4",
      Icon: Users,
      accentClass: "text-purple-500 bg-purple-100",
    },
    {
      label: t?.summary?.pendingOrders || "Pending orders",
      value: "4",
      Icon: Timer,
      accentClass: "text-amber-500 bg-amber-100",
    },
  ];

  const pageTitle = t?.title || "Asset Clients";

  return (
    <div className="p-6 bg-[var(--brand-background)] min-h-screen">
      <h1 className="p-3 text-3xl font-bold text-[var(--brand-text)]">{pageTitle}</h1>

      <section className="mt-4 mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <Suspense fallback={<p>{t?.loading || "Loading clients..."}</p>}>
        <DigitalAssetsTable assets={assets} />
      </Suspense>
    </div>
  );
}
