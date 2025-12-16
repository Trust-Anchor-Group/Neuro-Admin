"use client";
import React, { useState, useMemo } from "react";
import AssetTokensTable from "@/components/assets/Tokens/AssetTokensTable";
import { Award, Activity, Coins } from "lucide-react"; // Added Coins icon
import { useLanguage, content as i18nContent } from '../../../../../context/LanguageContext';

// 1. Import your JSON file here
import projectsData from "@/data/projects.json";

export default function TokensPage() {
  const { language } = useLanguage();
  const t = i18nContent[language]?.assetOrders || {};

  const [ordersData] = useState({
    loading: false,
    orders: projectsData
  });

  // 2. Calculate Important Admin Metrics
  const stats = useMemo(() => {
    // A. Total Financial Value (Sum of all Initial CPR Values)
    const totalCPRValue = projectsData.reduce((acc, curr) => {
      return acc + (curr.series?.[0]?.tokenContent?.Coffee_InitialCPRValue || 0);
    }, 0);

    // B. Total Physical Volume (Sum of all bags -> converted to Tons)
    const totalBags = projectsData.reduce((acc, curr) => {
      return acc + (curr.series?.[0]?.quantity || 0);
    }, 0);
    const totalTons = (totalBags * 60) / 1000; // 60kg per bag / 1000kg per ton

    // C. Average Price per Bag (Market Average)
    const avgPrice = projectsData.length > 0
      ? projectsData.reduce((acc, curr) => acc + (curr.series?.[0]?.price || 0), 0) / projectsData.length
      : 0;

    return { totalCPRValue, totalTons, avgPrice };
  }, []);

  // Formatters for clean display (e.g., "R$ 161M")
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: "compact",
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const summaryCards = [
    {
      label: 'Total Asset Value (CPR)', // Financial Depth
      value: formatCurrency(stats.totalCPRValue),
      Icon: Coins,
      accentClass: 'text-emerald-500 bg-emerald-100',
    },
    {
      label: 'Total Volume (Tons)', // Physical Scale
      value: `${formatNumber(stats.totalTons)} tons`,
      Icon: Activity,
      accentClass: 'text-blue-500 bg-blue-100',
    },
    {
      label: 'Avg. Bag Price', // Market Position
      value: formatCurrency(stats.avgPrice),
      Icon: Award,
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

      <h1 className="p-3 text-3xl font-bold text-[var(--brand-text)]">
        {t.heading || 'Live projects'}
      </h1>

      <AssetTokensTable
        orders={ordersData.orders}
        isLoading={ordersData.loading}
      />
    </div>
  );
}