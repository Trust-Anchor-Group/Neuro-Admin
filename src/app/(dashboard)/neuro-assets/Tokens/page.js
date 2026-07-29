"use client";

import React, { useState, useMemo, useEffect } from "react";
import AssetTokensTable from "@/components/assets/Tokens/AssetTokensTable";
import { Award, Activity, Coins, Plus } from "lucide-react";
import { useLanguage, content as i18nContent } from "../../../../../context/LanguageContext";
import { fetchProjects } from "@/lib/fetchProjects";
import CreateProjectWizard from "@/components/assets/Tokens/CreateProjectWizard";

export default function TokensPage() {
  const { language } = useLanguage();
  const t = i18nContent[language]?.assetOrders || {};

  const [ordersData, setOrdersData] = useState({
    loading: true,
    orders: [],
  });
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const getProjects = async () => {
      const result = await fetchProjects(language);
      if (active) {
        setOrdersData(result);
      }
    };

    getProjects();

    return () => {
      active = false;
    };
  }, [language]);

  const stats = useMemo(() => {
    const totalOfferingValue = ordersData.orders.reduce((acc, curr) => {
      const tokenPrice = Number(curr.token_price || 0);
      const tokenQty = Number(curr.token?.token_quantity || 0);
      return acc + (tokenPrice * tokenQty);
    }, 0);

    const totalTokensLeft = ordersData.orders.reduce((acc, curr) => {
      return acc + Number(curr.token?.tokens_left || 0);
    }, 0);

    const avgTokenPrice = ordersData.orders.length > 0
      ? ordersData.orders.reduce((acc, curr) => acc + Number(curr.token_price || 0), 0) / ordersData.orders.length
      : 0;

    return {
      totalOfferingValue,
      totalTokensLeft,
      avgTokenPrice,
      totalProjects: ordersData.orders.length,
    };
  }, [ordersData.orders]);

  const displayCurrency = (ordersData.orders?.[0]?.currency || "BRL").toUpperCase();

  const formatCurrency = (value) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: displayCurrency,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${displayCurrency} ${Number(value || 0).toFixed(2)}`;
    }
  };

  const formatNumber = (value) => new Intl.NumberFormat("en-US").format(value);

  const summaryCards = [
    {
      label: "Total Offering Value",
      value: formatCurrency(stats.totalOfferingValue),
      Icon: Coins,
      accentClass: "text-emerald-500 bg-emerald-100",
    },
    {
      label: "Tokens Available",
      value: formatNumber(stats.totalTokensLeft),
      Icon: Activity,
      accentClass: "text-blue-500 bg-blue-100",
    },
    {
      label: "Avg. Token Price",
      value: formatCurrency(stats.avgTokenPrice),
      Icon: Award,
      accentClass: "text-amber-500 bg-amber-100",
    },
    {
      label: "Total Projects",
      value: formatNumber(stats.totalProjects),
      Icon: Activity,
      accentClass: "text-violet-500 bg-violet-100",
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-[var(--brand-background)]">
      <section className="mb-6 grid gap-4 xl:grid-cols-2 xl:items-stretch">
        <div className="grid gap-4 sm:grid-cols-2 sm:auto-rows-fr">
          {summaryCards.map(({ label, value, Icon, accentClass }) => (
            <div
              key={label}
              className="flex h-full flex-col rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-5 shadow-sm backdrop-blur"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-[var(--brand-text-secondary)]">{label}</p>
                <span className={`inline-flex items-center justify-center rounded-full p-2 ${accentClass}`}>
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
              </div>
              <p className="mt-5 text-3xl font-semibold text-[var(--brand-text)]">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex h-full flex-col rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm backdrop-blur">
          <h2 className="text-2xl font-bold text-[var(--brand-text)]">Create Project</h2>
          <button
            type="button"
            onClick={() => setIsCreatePanelOpen(true)}
            className="mt-auto inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </button>
        </div>
      </section>

      <h2 className="p-1 text-2xl font-bold text-[var(--brand-text)]">
        {t.heading || "Live projects"}
      </h2>

      <AssetTokensTable orders={ordersData.orders} isLoading={ordersData.loading} />

      {isCreatePanelOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-project-panel-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsCreatePanelOpen(false);
          }}
        >
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-y-auto rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 id="create-project-panel-title" className="text-2xl font-bold text-[var(--brand-text)]">
                Create Project
              </h2>
              <button
                type="button"
                onClick={() => setIsCreatePanelOpen(false)}
                className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-3 py-2 text-sm font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-hover)]"
              >
                Close
              </button>
            </div>
            <CreateProjectWizard />
          </div>
        </div>
      )}
    </div>
  );
}
