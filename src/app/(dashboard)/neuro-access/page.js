"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage, content } from "../../../../context/LanguageContext";
import { useState } from "react";
import PendingApplications from "../../../components/access/dashboard/PendingApplications";

function AccessDashboard() {
  const { language } = useLanguage();
  const t = content[language];
  // Mock statistics
  const [stats] = useState({
    totalIdentities: 3200,
    activeSessions: 245,
    digitalSignatures: 890,
    identityWallets: 1270,
    PendingApplications: 3,
  });

  return (
    <div className="p-8 min-h-screen bg-[var(--brand-background)]">
  <h1 className="text-4xl font-bold text-[var(--brand-text)] mb-2">{t?.accessDashboard?.title || 'Neuro-Access Dashboard'}</h1>
  <p className="text-[var(--brand-text-secondary)] text-md mb-8">{t?.accessDashboard?.subtitle || 'Real-time identity management insights'}</p>

      {/* Stats Overview */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <StatCard title="Total Digital Identities" value={stats.totalIdentities} icon={<FaIdCard className="text-blue-500" />} />
        <StatCard title="Active Sessions" value={stats.activeSessions} icon={<FaUserShield className="text-green-500" />} />
        <StatCard title="Digital Signatures Processed" value={stats.digitalSignatures} icon={<FaFileSignature className="text-yellow-500" />} />
        <StatCard title="Identity Wallets Utilized" value={stats.identityWallets} icon={<FaWallet className="text-purple-500" />} />
        <StatCard title="Pending Applications" value={stats.PendingApplications} icon={<FaSignInAlt className="text-gray-500" />} />
      </div> */}

      {/* Pending Applications & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Suspense fallback={<div>Loading pending applications...</div>}>
          <PendingApplications />
        </Suspense>
        {/* <RecentActivity /> */}
      </div>
    </div>
  );
}

function StatusBadge({ children, tone = 'active' }) {
  const colors = tone === 'pending'
    ? 'bg-[#fde9dc] text-[#b96b31]'
    : tone === 'obsolete'
      ? 'bg-[#f9dce1] text-[#c64d63]'
      : 'bg-[#d8ebe8] text-[#17635e]';

  return <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${colors}`}>{children}</span>;
}

function ManageButton({ children }) {
  return (
    <button className="mt-3 flex h-8 w-full items-center justify-center gap-1 rounded-md bg-[#efe0f8] text-[10px] font-semibold text-[#803bb1] hover:bg-[#e8d2f4]">
      <span className="text-xs">♧</span>{children}
    </button>
  );
}

function AccessTokenCard() {
  return (
    <article className="rounded-md border border-[#e4e6e8] bg-white p-3">
      <div className="flex gap-3">
        <span className="mt-1 h-7 w-7 shrink-0 rounded-full bg-[#e1e4e6]" />
        <div className="min-w-0 flex-1">
          <p className="text-[8px] text-[#7a8085]">Access Token</p>
          <h3 className="truncate text-xs font-semibold">TAG SE ID Neuron admin access</h3>
          <p className="text-[8px] text-[#7a8085]">Trust Anchor Group</p>
          <div className="my-2 border-t border-[#e8eaec]" />
          <p className="text-[8px] text-[#7a8085]">Created: 2025-02-23</p>
          <p className="text-[8px] text-[#7a8085]">Expires: 2029-02-23</p>
          <p className="mt-1 text-[8px] text-[#7a8085]">Status: <StatusBadge>Active</StatusBadge></p>
        </div>
      </div>
      <ManageButton>Manage</ManageButton>
    </article>
  );
}

function DigitalIdentityPage() {
  return (
    <main className="min-h-screen bg-[#e4e7e9] p-3 text-[#182127] sm:p-5 lg:h-[calc(100vh-63px)] lg:min-h-0 lg:overflow-hidden lg:p-8 xl:p-10">
      <div className="grid h-full w-full grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-5 xl:gap-6 2xl:gap-8">
        <div className="flex min-h-0 flex-col gap-3 lg:gap-5 xl:gap-6">
          <section className="rounded-lg bg-white p-4 shadow-[0_1px_2px_rgba(24,33,39,0.05)] lg:min-h-60 lg:p-6">
            <h1 className="text-xs font-bold">My Account</h1>
            <p className="mt-4 text-[9px] text-[#7a8085]">Account name</p>
            <p className="truncate text-sm font-semibold">salfrskf alwrekf34j+9j4+igfgwerkyko6kw0+...</p>
            <div className="my-2 border-t border-[#e8eaec]" />
            <p className="text-[9px] text-[#7a8085]">Registered at: se.id.tagroot.io</p>
            <p className="mt-2 text-[9px] text-[#7a8085]">Status: <StatusBadge>Active</StatusBadge></p>
            <ManageButton>Manage Account</ManageButton>
          </section>

          <section className="min-h-0 flex-1 rounded-lg bg-white p-4 shadow-[0_1px_2px_rgba(24,33,39,0.05)] lg:p-6">
            <h2 className="text-xs font-bold">My access tokens</h2>
            <p className="mt-2 text-[9px] text-[#7a8085]">5 Active access tokens detected</p>
            <label className="mt-3 flex h-8 items-center gap-2 rounded-md border border-[#dfe2e5] px-3 text-xs text-[#7a8085]">
              <span>⌕</span><span>Search</span>
            </label>
            <div className="mt-5 space-y-3">
              <AccessTokenCard />
              <AccessTokenCard />
              <AccessTokenCard />
            </div>
          </section>
        </div>

        <div className="flex min-h-0 flex-col gap-3 lg:gap-5 xl:gap-6">
          <section className="rounded-lg bg-white p-4 shadow-[0_1px_2px_rgba(24,33,39,0.05)] lg:min-h-60 lg:p-6">
            <h2 className="text-xs font-bold">My Digital ID</h2>
            <div className="mt-4 flex gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#dfe2e5] to-[#9da4a9] text-sm font-semibold text-white">ID</div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] text-[#7a8085]">Digital ID</p>
                <h3 className="text-sm font-semibold">Adam Ingot</h3>
                <div className="my-2 border-t border-[#e8eaec]" />
                <p className="text-[9px] text-[#7a8085]">ID created: 2025-02-23</p>
                <p className="mt-1 text-[9px] text-[#7a8085]">Status: <StatusBadge>Active</StatusBadge></p>
              </div>
            </div>
            <ManageButton>Manage ID</ManageButton>
          </section>

          <section className="rounded-lg bg-white p-4 shadow-[0_1px_2px_rgba(24,33,39,0.05)] lg:min-h-60 lg:p-6">
            <p className="text-[9px] text-[#7a8085]">ID application detected:</p>
            <div className="mt-2 rounded-md border border-[#e4e6e8] p-3">
              <p className="text-[8px] text-[#7a8085]">Digital ID</p><h3 className="text-sm font-semibold">Adam Ingot</h3>
              <div className="my-2 border-t border-[#e8eaec]" />
              <p className="text-[8px] text-[#7a8085]">Application made: 2025-02-23</p>
              <p className="mt-1 text-[8px] text-[#7a8085]">Status: <StatusBadge tone="pending">Pending</StatusBadge></p>
              <ManageButton>Manage application</ManageButton>
            </div>
          </section>

          <section className="min-h-0 flex-1 rounded-lg bg-white p-4 shadow-[0_1px_2px_rgba(24,33,39,0.05)] lg:p-6">
            <p className="text-[9px] text-[#7a8085]">2 previous IDs detected:</p>
            {[1, 2].map((id) => <article key={id} className="mt-3 rounded-md border border-[#e4e6e8] p-3"><p className="text-[8px] text-[#7a8085]">Digital ID</p><h3 className="text-sm font-semibold">Adam Ingot</h3><div className="my-2 border-t border-[#e8eaec]" /><p className="text-[8px] text-[#7a8085]">ID created: 2025-02-23</p><p className="mt-1 text-[8px] text-[#7a8085]">Status: <StatusBadge tone="obsolete">Obsoleted</StatusBadge></p><button className="mt-3 h-7 w-full rounded-md bg-[#f5f6f7] text-[9px] font-semibold">ⓘ Info</button></article>)}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  const searchParams = useSearchParams();

  return searchParams.get('section') === 'my-neuro'
    ? <DigitalIdentityPage />
    : <AccessDashboard />;
}

function StatCard({ title, value, icon }) {
  return (
    <div className="p-5 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg flex items-center gap-4 
    transform transition-all hover:scale-105 hover:shadow-xl hover:bg-white/90">
      <div className="p-2 bg-white rounded-full shadow-lg">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
