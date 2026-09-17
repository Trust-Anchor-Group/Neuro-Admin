'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage, content } from "../../../../../context/LanguageContext";
import KYCSettings from "@/components/settings/kyc/KYCSettings";
import APIKeys from "@/components/settings/apiKey/APIKeys";
import { useActiveAdminHost } from '@/lib/activeAdminHost';

export default function SettingsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState("kyc");
  const activeAdminHost = useActiveAdminHost();
  const debugEnabled = process.env.NEXT_PUBLIC_NEURON_SWITCH_DEBUG === 'true';
  const { language } = useLanguage();
  const t = content?.[language]?.SettingsPageClient || {};

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    setTab(urlTab === "api" ? "api" : "kyc");
  }, [searchParams]);

  return (
    <div className="p-6 min-h-screen bg-[var(--brand-background)]">
      <h1 className="text-3xl font-bold text-[var(--brand-text)] mb-4">{t.title || 'Settings'}</h1>

      <div className="flex border-b border-[var(--brand-border)]">
        {
          activeAdminHost !== 'kikkin.tagroot.io' &&
          <button
          className={`px-4 py-2 text-lg font-medium ${tab === "kyc" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
          onClick={() => router.push("/neuro-access/settings?tab=kyc")}
          >
          {t.kycTab || 'KYC Settings'}
        </button>
        }
        <button
          className={`px-4 py-2 text-lg font-medium ${tab === "api" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
          onClick={() => router.push("/neuro-access/settings?tab=api")}
        >
          {t.apiTab || 'API Keys'}
        </button>
      </div>

      <div className="mt-6 bg-[var(--brand-background)] shadow-md rounded-lg">
        {tab === "kyc" && activeAdminHost !== 'kikkin.tagroot.io' ? <KYCSettings /> : <APIKeys />}
      </div>

      {debugEnabled ? (
        <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-medium">Neuron switch debug mode is enabled.</p>
          <p className="mt-1">
            Use the temporary debug flow to validate source session, target session cookie continuity, and target JWT conversion before making production auth changes.
          </p>
          <Link
            href="/neuro-access/settings/neuron-switch-debug"
            className="mt-3 inline-flex rounded-md bg-amber-900 px-3 py-2 font-medium text-white hover:bg-amber-800"
          >
            Open Neuron switch debug page
          </Link>
        </div>
      ) : null}
    </div>
  );
}
