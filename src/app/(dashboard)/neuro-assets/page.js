"use client";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { FiTrendingUp, FiCheckCircle, FiActivity, FiLoader } from "react-icons/fi";
import Link from "next/link";
import UserCard from "@/components/ui/UserCard";
import { useLanguage, content as i18nContent } from "../../../../context/LanguageContext";

// --- Helpers for Date Processing ---
const parseDate = (dateStr, timeStr) => {
  try {
    const d = new Date(`${dateStr} ${timeStr}`);
    return isNaN(d.getTime()) ? new Date() : d;
  } catch (e) {
    return new Date();
  }
};

const getRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const getLast3Months = (locale) => {
  const months = [];
  const today = new Date();
  for (let i = 0; i < 3; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = d.toLocaleString(locale, { month: 'short', year: 'numeric' });
    months.push({ key, dateObj: d });
  }
  return months;
};

// --- Components ---
const statusClasses = {
  live: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  upcoming: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  closed: "bg-slate-500/10 text-slate-500 border border-slate-500/20",
};

const transactionStatusClasses = {
  Paid: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20", // New "Paid" style
  Delivered: "bg-neuroGreen/20 text-neuroGreen",
  Cancelled: "bg-obsoletedRed/20 text-obsoletedRed",
};

const SectionCard = ({ title, subtitle, children, action }) => (
  <div className="bg-[var(--brand-navbar)] border border-[var(--brand-border)] rounded-2xl p-6 w-full shadow-sm">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-[var(--brand-text)]">{title}</h2>
        {subtitle && <p className="text-sm text-[var(--brand-text-secondary)]">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="mt-6">{children}</div>
  </div>
);

const TrendChip = ({ trend }) => {
  // If trend is 0 (like for empty months), render neutral gray
  if (trend === 0) return <span className="text-xs font-semibold text-[var(--brand-text-secondary)]">-</span>;

  const positive = trend > 0;
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${positive ? "text-emerald-500" : "text-rose-500"}`}>
      <FiTrendingUp className={`text-base ${positive ? "" : "rotate-180"}`} />
      {positive ? "+" : ""}
      {trend}%
    </span>
  );
};

const CertificateStat = ({ value, label, icon }) => (
  <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 backdrop-blur-sm">
    <div className="flex items-center gap-3 text-[var(--brand-text)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-hover)] text-[var(--brand-text)]">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--brand-text-secondary)]">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const AdminPage = () => {
  const { language } = useLanguage();
  const tDash = useMemo(() => i18nContent[language]?.assetDashboard || {}, [language]);
  const locale = language === 'pt' ? 'pt-PT' : 'en-US';
  const isPt = language === 'pt';
  const isFr = language === 'fr';

  const [realData, setRealData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatNumber = useCallback((value) => new Intl.NumberFormat(locale).format(value), [locale]);
  const formatCurrency = useCallback((value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value), [locale]);

  const uiText = useMemo(() => ({
    projectTableTitle: tDash.projects?.title || (isPt ? 'Portfólio de Projetos' : isFr ? 'Portefeuille de projets' : 'Project Portfolio'),
    projectTableSubtitle: tDash.projects?.subtitle || (isPt ? 'Visão dos ativos tokenizados ativos' : isFr ? 'Vue des actifs tokenisés actifs' : 'Overview of active tokenized assets'),
    columns: {
      project: tDash.projects?.columns?.project || (isPt ? 'Projeto' : isFr ? 'Projet' : 'Project'),
      issuer: tDash.projects?.columns?.issuer || (isPt ? 'Emissor' : isFr ? 'Émetteur' : 'Issuer'),
      type: tDash.projects?.columns?.type || (isPt ? 'Tipo' : isFr ? 'Type' : 'Type'),
      supply: tDash.projects?.columns?.supply || (isPt ? 'Oferta' : isFr ? 'Offre' : 'Supply'),
      price: tDash.projects?.columns?.price || (isPt ? 'Preço do Token' : isFr ? 'Prix du token' : 'Token Price'),
      media: tDash.projects?.columns?.media || (isPt ? 'Mídia' : isFr ? 'Médias' : 'Media'),
      visibility: tDash.projects?.columns?.visibility || (isPt ? 'Visibilidade' : isFr ? 'Visibilité' : 'Visibility'),
      status: tDash.projects?.columns?.status || (isPt ? 'Status' : isFr ? 'Statut' : 'Status'),
    },
    labels: {
      id: isPt ? 'ID' : isFr ? 'ID' : 'ID',
      country: isPt ? 'País' : isFr ? 'Pays' : 'Country',
      sold: isPt ? 'vendidos' : isFr ? 'vendus' : 'sold',
      imgs: isPt ? 'imgs' : isFr ? 'imgs' : 'imgs',
      resources: isPt ? 'docs' : isFr ? 'docs' : 'docs',
      value: isPt ? 'Valor' : isFr ? 'Valeur' : 'Value',
    },
    status: {
      live: isPt ? 'Ao vivo' : isFr ? 'Actif' : 'Live',
      upcoming: isPt ? 'Em breve' : isFr ? 'À venir' : 'Upcoming',
      closed: isPt ? 'Encerrado' : isFr ? 'Clôturé' : 'Closed',
      paid: isPt ? 'Pago' : isFr ? 'Payé' : 'Paid',
    },
    visibility: {
      deleted: isPt ? 'Excluído' : isFr ? 'Supprimé' : 'Deleted',
      public: isPt ? 'Público' : isFr ? 'Public' : 'Public',
      private: isPt ? 'Privado' : isFr ? 'Privé' : 'Private',
      unlisted: isPt ? 'Não listado' : isFr ? 'Non listé' : 'Unlisted',
    },
    schedule: isPt ? 'Período' : isFr ? 'Période' : 'Schedule',
    monthlyValue: isPt ? 'Valor' : isFr ? 'Valeur' : 'Value',
    noRecentTransactions: isPt ? 'Nenhuma transação recente.' : isFr ? 'Aucune transaction récente.' : 'No recent transactions.',
    noProjects: isPt ? 'Nenhum projeto encontrado.' : isFr ? 'Aucun projet trouvé.' : 'No projects found.',
    breakdownByCategory: tDash.certificates?.breakdownTitle || (isPt ? 'Distribuição por categoria' : isFr ? 'Répartition par catégorie' : 'Breakdown by Category'),
    anonymous: isPt ? 'Anônimo' : isFr ? 'Anonyme' : 'Anonymous',
    fallbackAsset: isPt ? 'Token de Ativo' : isFr ? 'Token d’actif' : 'Asset Token',
    unclassified: isPt ? 'Sem categoria' : isFr ? 'Sans catégorie' : 'Unclassified',
    notAvailable: isPt ? 'N/D' : isFr ? 'N/D' : 'N/A',
  }), [tDash, isPt, isFr]);

  const toProjectDate = useCallback((value) => {
    if (value === null || value === undefined || value === '') return null;

    if (typeof value === 'number' || /^\d+$/.test(String(value))) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric) || numeric <= 0) return null;
      const millis = numeric < 1e12 ? numeric * 1000 : numeric;
      const date = new Date(millis);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, []);

  const formatProjectDate = useCallback((value) => {
    const date = toProjectDate(value);
    if (!date) return uiText.notAvailable;
    return date.toLocaleString(locale);
  }, [locale, toProjectDate, uiText.notAvailable]);

  const getProjectStatus = useCallback((project) => {
    const now = new Date();
    const startDate = toProjectDate(project?.start_date);
    const endDate = toProjectDate(project?.end_date);

    if (startDate && startDate > now) return 'upcoming';
    if (endDate && endDate < now) return 'closed';
    return 'live';
  }, [toProjectDate]);

  // -- 1. Fetch Real Data --
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tokensRes, projectsRes] = await Promise.all([
          fetch('/api/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ maxCount: 100, offset: 0 })
          }),
          fetch('/api/projects?localization=en-US', {
            method: 'GET',
            headers: { Accept: 'application/json' },
            credentials: 'include',
            cache: 'no-store',
          }),
        ]);

        const [tokensJson, projectsJson] = await Promise.all([
          tokensRes.json(),
          projectsRes.json(),
        ]);

        if (tokensJson?.success && Array.isArray(tokensJson?.data)) {
          setRealData(tokensJson.data);
        }

        const projectsList = projectsJson?.data?.data;
        if (projectsJson?.success && Array.isArray(projectsList)) {
          setProjectsData(projectsList);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // -- 2. Process Monthly Summary (Ensure 3 months displayed) --
  const monthlySummary = useMemo(() => {
    // Group real data
    const grouped = {};
    realData.forEach(item => {
      const date = parseDate(item.createdDate, item.createdTime);
      const key = date.toLocaleString(locale, { month: 'short', year: 'numeric' });

      if (!grouped[key]) {
        grouped[key] = { tokens: 0, orders: 0 };
      }
      grouped[key].tokens += (item.value || 0);
      grouped[key].orders += 1;
    });

    // Generate last 3 months structure (filling 0 if no data)
    const last3Months = getLast3Months(locale);

    return last3Months.map((m, index) => {
      const data = grouped[m.key] || { tokens: 0, orders: 0 };

      // Calculate Trend vs previous month (which is index + 1 in this descending list)
      // Since we generated the list, we can peek at the "next" month in the loop or mock it for the last item
      let trend = 0;
      // Simple mock logic: if it's the current month (index 0) and has data, show +100% vs 0
      if (data.tokens > 0 && index === 0) trend = 100;

      return {
        month: m.key,
        tokens: data.tokens,
        orders: data.orders,
        trend: trend
      };
    });

  }, [realData, locale]);

  const maxTokens = monthlySummary.reduce((acc, item) => Math.max(acc, item.tokens), 0) || 1;

  // -- 3. Process Recent Transactions (Status forced to "Paid") --
  const transactionsList = useMemo(() => {
    // Sort by date descending first
    const sorted = [...realData].sort((a, b) => {
      return parseDate(b.createdDate, b.createdTime) - parseDate(a.createdDate, a.createdTime);
    });

    return sorted.slice(0, 5).map(item => ({
      id: item.tokenId,
      shortId: `TX-${item.tokenId.substring(0, 6)}...`,
      client: uiText.anonymous,
      asset: item.friendlyName || uiText.fallbackAsset,
      category: item.category || uiText.unclassified,
      tokens: item.value,
      status: uiText.status.paid,
      time: getRelativeTime(parseDate(item.createdDate, item.createdTime))
    }));
  }, [realData, uiText]);

  // -- 4. Certificate Stats --
  const certStats = useMemo(() => {
    const total = realData.length || 0;
    return {
      totalCertificates: total,
      breakdown: [
        { label: "Coffee CPR", value: total, color: "bg-emerald-500" },
      ]
    };
  }, [realData]);
  const userCardStats = useMemo(() => {
    if (!realData.length) return { volume: 0, transactions: 0 };

    // 1. Sum of all token values (Real BRL value from API)
    const totalValue = realData.reduce((acc, item) => acc + (item.value || 0), 0);

    // 2. Total count of transactions/events
    const totalCount = realData.length;

    return {
      // Format as currency (e.g., R$ 250.000)
      formattedValue: formatCurrency(totalValue),
      // Format as number (e.g., 1,234)
      formattedCount: formatNumber(totalCount)
    };
  }, [realData, formatCurrency, formatNumber ]);// Add dependencies
  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 bg-[var(--brand-background)] text-[var(--brand-text)] min-h-screen">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <UserCard
            typeKey="tokenizedValue"
            value={loading ? "..." : userCardStats.formattedValue}
          />

          {/* Card 2: Transaction Count */}
          <UserCard
            typeKey="totalTransactions"
            value={loading ? "..." : userCardStats.formattedCount}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">{tDash.heading || "Assets Dashboard"}</h1>
          <Link
            href="/neuro-assets/issuer"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-4 py-2 text-sm font-semibold text-[var(--brand-text)] shadow-sm transition hover:bg-[var(--brand-hover)]"
          >
            Go to Issuer Admin
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* SECTION 1: Projects Portfolio */}
        <SectionCard
          title={uiText.projectTableTitle}
          subtitle={uiText.projectTableSubtitle}
          // action={
          //   <button className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 py-2 text-sm font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-hover)]">
          //     {tDash.projects?.cta || "Manage Projects"}
          //     <FiArrowUpRight />
          //   </button>
          // }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[var(--brand-text-secondary)] uppercase text-xs tracking-wide border-b border-[var(--brand-border)]">
                <tr>
                  <th className="py-3 pl-2">{uiText.columns.project}</th>
                  <th className="py-3">{uiText.columns.issuer}</th>
                  <th className="py-3">{uiText.columns.type}</th>
                  <th className="py-3">{uiText.columns.supply}</th>
                  <th className="py-3">{uiText.columns.price}</th>
                  <th className="py-3">{uiText.columns.media}</th>
                  <th className="py-3">{uiText.columns.visibility}</th>
                  <th className="py-3">{uiText.columns.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--brand-border)]/60">
                {projectsData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-sm text-[var(--brand-text-secondary)]">{uiText.noProjects}</td>
                  </tr>
                )}
                {projectsData.map((project) => {
                  const projectId = project?.project_id || "-";
                  const token = project?.token || {};
                  const localization = project?.localization || {};
                  const title = localization?.title || token?.project_label || token?.friendly_name || "Untitled Project";
                  const location = token?.project_country_code || token?.project_country || uiText.notAvailable;
                  const issuerName = token?.issuer_name || project?.issuer?.localization?.name || uiText.notAvailable;
                  const category = localization?.asset_type || token?.project_type || "-";
                  const totalQuantity = Number(token?.token_quantity || 0);
                  const tokensLeft = Number(token?.tokens_left || 0);
                  const soldQuantity = Math.max(0, totalQuantity - tokensLeft);
                  const soldPercentage = totalQuantity > 0 ? Math.round((soldQuantity / totalQuantity) * 100) : 0;
                  const value = Number(project?.token_price || 0);
                  const imagesCount = Array.isArray(localization?.images) ? localization.images.length : 0;
                  const resourcesCount = Array.isArray(localization?.resources) ? localization.resources.length : 0;
                  const statusKey = getProjectStatus(project);
                  const visibilityRaw = String(project?.visibility || '').toLowerCase();
                  const visibilityKey = ['deleted', 'private', 'unlisted', 'public'].includes(visibilityRaw)
                    ? visibilityRaw
                    : 'private';
                  const visibilityLabel = uiText.visibility[visibilityKey] || uiText.visibility.private;
                  const visibilityClass = visibilityKey === 'public'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : visibilityKey === 'private'
                      ? 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                      : visibilityKey === 'unlisted'
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
                  const startDateLabel = formatProjectDate(project?.start_date);
                  const endDateLabel = formatProjectDate(project?.end_date);

                  return (
                    <tr key={projectId} className="hover:bg-[var(--brand-hover)]/60 transition-colors">
                      <td className="py-4 pl-2">
                        <p className="font-semibold text-[var(--brand-text)]">{title}</p>
                        <p className="text-xs text-[var(--brand-text-secondary)]">
                          {uiText.labels.id}: {projectId} · {uiText.labels.country}: {String(location).toUpperCase()}
                        </p>
                      </td>
                      <td className="py-4 text-sm text-[var(--brand-text)]">{issuerName}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center rounded-md bg-[var(--brand-background)] px-2 py-1 text-xs font-medium text-[var(--brand-text-secondary)] ring-1 ring-inset ring-[var(--brand-border)]">
                          {category}
                        </span>
                      </td>
                      <td className="py-4 font-semibold font-mono">
                        <p>{formatNumber(soldQuantity)} / {formatNumber(totalQuantity)}</p>
                        <p className="text-[10px] text-[var(--brand-text-secondary)]">{soldPercentage}% {uiText.labels.sold}</p>
                      </td>
                      <td className="py-4 text-[var(--brand-text-secondary)] font-mono text-xs">
                        {formatCurrency(value)}
                      </td>
                      <td className="py-4 text-xs text-[var(--brand-text-secondary)]">
                        {imagesCount} {uiText.labels.imgs} · {resourcesCount} {uiText.labels.resources}
                      </td>
                      <td className="py-4 text-xs text-[var(--brand-text-secondary)] font-semibold">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${visibilityClass}`}>
                          {visibilityLabel}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[statusKey]}`}>
                          <span className="relative flex h-2 w-2">
                            {statusKey === 'live' ? <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span> : null}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${statusKey === 'live' ? 'bg-emerald-500' : statusKey === 'upcoming' ? 'bg-amber-500' : 'bg-slate-500'}`}></span>
                          </span>
                          {uiText.status[statusKey]}
                        </span>
                        <p className="mt-1 text-[10px] text-[var(--brand-text-secondary)]">
                          {uiText.schedule}: {startDateLabel} → {endDateLabel}
                        </p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* SECTION 2: Monthly Summary */}
        <SectionCard
          title={tDash.monthlySummary?.title || "Monthly Activity"}
          subtitle={tDash.monthlySummary?.subtitle || "Real-time token creation volume"}
        >
          {loading ? (
            <div className="flex justify-center p-10"><FiLoader className="animate-spin text-2xl" /></div>
          ) : (
            <ul className="flex flex-col gap-5">
              {monthlySummary.map((entry) => (
                <li key={entry.month} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--brand-text)]">{entry.month}</p>
                      <p className="text-xs text-[var(--brand-text-secondary)]">
                        {tDash.monthlySummary?.orders || "Events"}: {entry.orders}
                      </p>
                    </div>
                    <TrendChip trend={entry.trend} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 flex-1 rounded-full bg-[var(--brand-border)]/40">
                      <div
                        className="h-full rounded-full bg-[var(--brand-primary)]"
                        style={{ width: `${Math.max((entry.tokens / maxTokens) * 100, 8)}%` }}
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--brand-text)]">
                        {formatCurrency(entry.tokens)}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-[var(--brand-text-secondary)]">
                        {uiText.labels.value}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 3: Recent Transactions (Forced "Paid") */}
        <SectionCard
          title={tDash.transactions?.title || "Live Feed"}
          subtitle={tDash.transactions?.subtitle || "Latest token events from blockchain"}
        >
          {loading ? (
            <div className="flex justify-center p-10"><FiLoader className="animate-spin text-2xl" /></div>
          ) : transactionsList.length === 0 ? (
            <p className="text-sm text-[var(--brand-text-secondary)]">{uiText.noRecentTransactions}</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {transactionsList.map((tx) => (
                <li
                  key={tx.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--brand-text)]">{tx.asset}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--brand-border)] text-[var(--brand-text-secondary)]">
                        {tx.shortId}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                      {tx.category} · {tx.time}
                    </p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <div className="flex items-center gap-2 text-[var(--brand-text)] font-semibold">
                      <FiActivity className="text-[var(--brand-text-secondary)]" />
                      {formatCurrency(tx.tokens)}{" "}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${transactionStatusClasses.Paid}`}
                    >
                      {uiText.status.paid}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* SECTION 4: Certificates (Reduced) */}
        <SectionCard
          title={tDash.certificates?.title || "Asset Certificates"}
          subtitle={tDash.certificates?.subtitle || "Digital CPR backing status"}
        >
          <div className="grid grid-cols-1 gap-4">
            <CertificateStat
              value={formatNumber(certStats.totalCertificates)}
              label={tDash.certificates?.total || "Total Validated Events"}
              icon={<FiCheckCircle />}
            />
          </div>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-[var(--brand-text-secondary)] mb-3">
              {uiText.breakdownByCategory}
            </p>
            <ul className="flex flex-col gap-3">
              {certStats.breakdown.map((item) => (
                <li key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${item.color}`} />
                    <p className="text-sm font-medium text-[var(--brand-text)]">{item.label}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatNumber(item.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default AdminPage;