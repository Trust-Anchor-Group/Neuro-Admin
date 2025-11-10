
"use client";
import { FiTrendingUp, FiArrowUpRight, FiCheckCircle, FiClock } from "react-icons/fi";
import UserCard from "@/components/ui/UserCard";
import { useLanguage, content as i18nContent } from "../../../../context/LanguageContext";

const statusClasses = {
  active: "bg-neuroGreen/20 text-neuroGreen",
  Pending: "bg-neuroOrange/20 text-neuroDarkOrange",
  Obsoleted: "bg-obsoletedRed/20 text-obsoletedRed",
};

const transactionStatusClasses = {
  Delivered: "bg-neuroGreen/20 text-neuroGreen",
  Shipped: "bg-neuroOrange/20 text-neuroDarkOrange",
  Cancelled: "bg-obsoletedRed/20 text-obsoletedRed",
};

const clients = [
  {
    id: "CL-902",
    name: "Nordic Carbon AB",
    sector: "Forestry & Land Use",
    country: "SE",
    tokens: 12450,
    lastOrder: "2025-02-10",
    status: "active",
  },
  {
    id: "CL-857",
    name: "Öresund Energy Coop",
    sector: "Renewable Energy",
    country: "DK",
    tokens: 9800,
    lastOrder: "2025-02-09",
    status: "Pending",
  },
  {
    id: "CL-811",
    name: "Aurora Biofuels",
    sector: "Bioenergy",
    country: "FI",
    tokens: 7325,
    lastOrder: "2025-02-07",
    status: "active",
  },
  {
    id: "CL-780",
    name: "Baltic Capture",
    sector: "Direct Air Capture",
    country: "EE",
    tokens: 6150,
    lastOrder: "2025-02-04",
    status: "Pending",
  },
  {
    id: "CL-766",
    name: "Skellefteå Industrials",
    sector: "Manufacturing",
    country: "SE",
    tokens: 4800,
    lastOrder: "2025-01-29",
    status: "Obsoleted",
  },
];

const recentTransactions = [
  {
    id: "TX-4839",
    client: "Nordic Carbon AB",
    asset: "Verra REDD+",
    tokens: 2500,
    status: "Delivered",
    time: "2 hours ago",
  },
  {
    id: "TX-4834",
    client: "Aurora Biofuels",
    asset: "Biochar Series B",
    tokens: 1800,
    status: "Shipped",
    time: "6 hours ago",
  },
  {
    id: "TX-4826",
    client: "Öresund Energy Coop",
    asset: "EU ETS",
    tokens: 950,
    status: "Delivered",
    time: "Yesterday",
  },
  {
    id: "TX-4818",
    client: "Baltic Capture",
    asset: "DAC Pilot",
    tokens: 640,
    status: "Cancelled",
    time: "Yesterday",
  },
  {
    id: "TX-4811",
    client: "Skellefteå Industrials",
    asset: "ISO 14064",
    tokens: 500,
    status: "Delivered",
    time: "2 days ago",
  },
];

const monthlySummary = [
  { month: "Feb 2025", tokens: 4200, orders: 36, trend: 8 },
  { month: "Jan 2025", tokens: 3880, orders: 32, trend: -3 },
  { month: "Dec 2024", tokens: 3550, orders: 28, trend: 5 },
  { month: "Nov 2024", tokens: 3100, orders: 25, trend: 2 },
];

const certificateStats = {
  totalCertificates: 182,
  tokensWithCertificates: 156,
  pendingCertificates: 12,
  expiringSoon: 5,
  breakdown: [
    { label: "EU ETS", value: 68, color: "bg-indigo-500" },
    { label: "Verra VCU", value: 54, color: "bg-emerald-500" },
    { label: "Gold Standard", value: 38, color: "bg-amber-500" },
    { label: "Other", value: 22, color: "bg-slate-400" },
  ],
};

const localeMap = {
  en: "en-US",
  pt: "pt-PT",
  fr: "fr-FR",
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
  const positive = trend >= 0;
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${positive ? "text-emerald-500" : "text-rose-500"}`}>
      <FiTrendingUp className={`text-base ${positive ? "" : "rotate-180"}`} />
      {positive ? "+" : "-"}
      {Math.abs(trend)}%
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
  const tDash = i18nContent[language]?.assetDashboard || {};
  const locale = localeMap[language] || "en-US";
  const formatNumber = (value) => new Intl.NumberFormat(locale).format(value);
  const maxTokens = monthlySummary.reduce((acc, item) => Math.max(acc, item.tokens), 0) || 1;

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 bg-[var(--brand-background)] text-[var(--brand-text)] min-h-screen">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <UserCard typeKey="amountSold" />
          <UserCard typeKey="totalVolumeCompensated" />
        </div>
          <h1 className="text-3xl font-bold">{tDash.heading || "Assets Dashboard"}</h1>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard
          title={tDash.clients?.title || "underlying clients"}
          subtitle={tDash.clients?.subtitle || "Latest status of connected clients"}
          action={
            <button className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 py-2 text-sm font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-hover)]">
              {tDash.clients?.cta || "manage clients"}
              <FiArrowUpRight />
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[var(--brand-text-secondary)] uppercase text-xs tracking-wide">
                <tr>
                  <th className="py-2">{tDash.clients?.columns?.client || "Client"}</th>
                  <th className="py-2">{tDash.clients?.columns?.sector || "Sector"}</th>
                  <th className="py-2">{tDash.clients?.columns?.tokens || "Tokens"}</th>
                  <th className="py-2">{tDash.clients?.columns?.lastOrder || "Last Order"}</th>
                  <th className="py-2">{tDash.clients?.columns?.status || "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--brand-border)]/60">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-[var(--brand-hover)]/60">
                    <td className="py-3">
                      <p className="font-semibold text-[var(--brand-text)]">{client.name}</p>
                      <p className="text-xs text-[var(--brand-text-secondary)]">
                        {client.id} · {client.country}
                      </p>
                    </td>
                    <td className="py-3 text-[var(--brand-text-secondary)]">{client.sector}</td>
                    <td className="py-3 font-semibold">{formatNumber(client.tokens)}</td>
                    <td className="py-3 text-[var(--brand-text-secondary)]">{client.lastOrder}</td>
                    <td className="py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusClasses[client.status] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tDash.clients?.statuses?.[client.status] || client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title={tDash.monthlySummary?.title || "Månatlig summering"}
          subtitle={tDash.monthlySummary?.subtitle || "Skapade tokens och ordrar"}
        >
          <ul className="flex flex-col gap-5">
            {monthlySummary.map((entry) => (
              <li key={entry.month} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--brand-text)]">{entry.month}</p>
                    <p className="text-xs text-[var(--brand-text-secondary)]">
                      {tDash.monthlySummary?.orders || "Ordrar"}: {entry.orders}
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
                      {formatNumber(entry.tokens)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-[var(--brand-text-secondary)]">
                      {tDash.monthlySummary?.tokens || "Tokens"}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title={tDash.transactions?.title || "Senaste transaktionerna"}
          subtitle={tDash.transactions?.subtitle || "Fem senaste mint/burn events"}
        >
          <ul className="flex flex-col gap-4">
            {recentTransactions.map((tx) => (
              <li
                key={tx.id}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--brand-text)]">{tx.client}</p>
                  <p className="text-xs text-[var(--brand-text-secondary)]">
                    {tx.asset} · {tx.time}
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <div className="flex items-center gap-2 text-[var(--brand-text)] font-semibold">
                    <FiArrowUpRight className="text-[var(--brand-text-secondary)]" />
                    {formatNumber(tx.tokens)}{" "}
                    <span className="text-xs text-[var(--brand-text-secondary)]">
                      {tDash.transactions?.tokensLabel || "tokens"}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      transactionStatusClasses[tx.status] || "bg-slate-50 text-slate-600 border border-slate-100"
                    }`}
                  >
                    {tDash.transactions?.statuses?.[tx.status] || tx.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title={tDash.certificates?.title || "Certifikat i tokens"}
          subtitle={tDash.certificates?.subtitle || "Hur många certifikat backar dagens tokens"}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CertificateStat
              value={formatNumber(certificateStats.totalCertificates)}
              label={tDash.certificates?.total || "Utfärdade certifikat"}
              icon={<FiCheckCircle />}
            />
            <CertificateStat
              value={formatNumber(certificateStats.tokensWithCertificates)}
              label={tDash.certificates?.tokenized || "Kopplade till tokens"}
              icon={<FiTrendingUp />}
            />
            <CertificateStat
              value={formatNumber(certificateStats.pendingCertificates)}
              label={tDash.certificates?.pending || "Inväntar verifiering"}
              icon={<FiClock />}
            />
            <CertificateStat
              value={formatNumber(certificateStats.expiringSoon)}
              label={tDash.certificates?.expiring || "Löper ut snart"}
              icon={<FiArrowUpRight />}
            />
          </div>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-[var(--brand-text-secondary)] mb-3">
              {tDash.certificates?.breakdownTitle || "Fördelning per typ"}
            </p>
            <ul className="flex flex-col gap-3">
              {certificateStats.breakdown.map((item) => (
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
