"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useLanguage, content } from "../../../context/LanguageContext";
import { Award, Activity, Users, Timer, } from "lucide-react";
import { fetchOrders } from "@/lib/fetchOrders";
import Image from "next/image";
import { useRouter } from 'next/navigation';

export default function AssetsPageIssuer() {
  const { language } = useLanguage();
  const t = content[language]?.Clients;
  const [ordersData, setOrdersData] = useState({ loading: true, orders: [] });
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [page, setPage] = useState(1);
  const pageSize = 8;

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
      name: o.assetName || o.category || t?.table?.columns?.name || 'Unknown asset',
      category: o.category || t?.table?.columns?.category || 'Industry',
      country: o.country || o.location || 'BRA',
      liveTokens: Number(o.liveTokens ?? o.value ?? 0) || 0,
    }));
  }, [ordersData, t]);

  const filteredAssets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const searched = query
      ? assets.filter((asset) =>
          [asset.name, asset.category, asset.country]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(query))
        )
      : assets;

    const sorted = [...searched].sort((a, b) => {
      switch (sortBy) {
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'tokens-desc':
          return b.liveTokens - a.liveTokens;
        case 'tokens-asc':
          return a.liveTokens - b.liveTokens;
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return sorted;
  }, [assets, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / pageSize));
  const paginatedAssets = filteredAssets.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortBy]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

    const summaryCards = [
      {
        label: t?.summary?.activeIssuers || 'Active Issuers',
        value: '57',
        Icon: Users,
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


  const pageTitle = t?.title || "Issuers";

  return (
    <div className="grid grid-cols-4 gap-5 p-6 bg-[var(--brand-background)] min-h-screen">
      <div className="mx-auto col-span-3 w-full rounded-lg bg-[var(--brand-navbar)] p-6 shadow-md">
        <h1 className="text-3xl font-bold text-[var(--brand-text)]">{pageTitle}</h1>
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t?.filters?.searchPlaceholder || 'Search issuers...'}
            className="h-11 w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 text-sm text-[var(--brand-text)] placeholder:text-[var(--brand-text-secondary)]"
          />

          <div className="flex w-full gap-2 md:w-auto md:justify-end">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 text-sm text-[var(--brand-text)] md:w-40"
            >
              <option value="name-asc">{t?.filters?.sortNameAsc || 'Name (A–Z)'}</option>
              <option value="name-desc">{t?.filters?.sortNameDesc || 'Name (Z–A)'}</option>
              <option value="tokens-desc">{t?.filters?.sortCarbonDesc || 'Live tokens (high → low)'}</option>
              <option value="tokens-asc">{t?.filters?.sortCarbonAsc || 'Live tokens (low → high)'}</option>
            </select>
            <button
              type="button"
              className="h-11 w-11 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] text-lg text-[var(--brand-text-secondary)]"
              aria-label="Toggle filters"
            >
              ≡
            </button>
          </div>
        </div>

        {ordersData.loading ? (
          <p className="text-sm text-[var(--brand-text-secondary)]">{t?.loading || 'Loading issuers...'}</p>
        ) : paginatedAssets.length === 0 ? (
          <p className="text-sm text-[var(--brand-text-secondary)]">{t?.emptyState || 'No issuers found.'}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {paginatedAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => router.push(`/neuro-assets/detailpageIssuer?id=${asset.id || ''}`)}
                  className="flex items-start gap-3 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 text-left shadow-sm transition hover:border-[var(--brand-primary)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-navbar)] text-lg font-semibold text-[var(--brand-text)]">
                    {asset.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-[var(--brand-text)]">{asset.name}</p>
                    <p className="text-xs text-[var(--brand-text-secondary)]">{asset.country}</p>
                    <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">{asset.category}</p>
                    <p className="mt-2 text-xs font-semibold text-[var(--brand-text)]">{asset.liveTokens} {t?.table?.columns?.tokens || 'Live tokens'}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-[var(--brand-text-secondary)]">
              <button
                type="button"
                onClick={() => page > 1 && setPage(page - 1)}
                className={`h-9 w-9 rounded-full border border-[var(--brand-border)] ${page === 1 ? 'opacity-50' : 'hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]'}`}
                disabled={page === 1}
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPage(index + 1)}
                  className={`h-9 w-9 rounded-full border border-[var(--brand-border)] ${
                    page === index + 1
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-light,#E1D1FF)] text-[var(--brand-primary)]'
                      : 'hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => page < totalPages && setPage(page + 1)}
                className={`h-9 w-9 rounded-full border border-[var(--brand-border)] ${page === totalPages ? 'opacity-50' : 'hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]'}`}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col gap-5">
        {summaryCards.map(({ label, value, Icon, accentClass }) => (
          <div
            key={label}
            className="flex flex-col rounded-2xl gap-2 bg-[var(--brand-navbar)] p-5 shadow-md backdrop-blur"
          >
            <p className="text-lg font-medium text-[var(--brand-text-secondary)]">{label}</p>
            <div className="flex flex-row items-center gap-3">
              <span className={`flex items-center justify-center rounded-full p-2 ${accentClass}`}>
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <p className="text-3xl font-semibold text-[var(--brand-text)]">{value}</p>
            </div>
          </div>
        ))}
        <div className="shadow-md rounded-xl text-[var(--brand-text)] bg-[var(--brand-navbar)] p-4 w-full max-w-sm flex flex-col gap-3">
          <h2 className="text-lg text-[var(--brand-text-secondary)] font-semibold">
            Issuers by location
          </h2>
          <div className="flex items-center gap-3">
            <Image
              className='mb-5 w-full h-auto rounded-xl border border-[var(--brand-border)]'
              src='/BrazilMapSecondary.png'
              width={800}
              height={450}
              alt={t?.displayDetails?.brazilMapAlt || 'Brazil production map'}
              priority
            />
          </div>
        </div>
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
      </div>
    </div>
  );
}
