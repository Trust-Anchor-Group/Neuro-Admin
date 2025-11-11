"use client";
import { Suspense } from "react";
import { useLanguage, content } from "../../../../context/LanguageContext";
import { useState } from "react";
import PendingApplications from "../../../components/access/dashboard/PendingApplications";

export default function DashboardPage() {
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

