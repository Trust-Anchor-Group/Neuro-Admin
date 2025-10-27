'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLanguage, content } from "../../../../../context/LanguageContext";
import KYCSettings from "@/components/settings/kyc/KYCSettings";
import APIKeys from "@/components/settings/apiKey/APIKeys";

export default function SettingsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState("kyc");
  const [hideKyc, setHideKyc] = useState('')
  const { language } = useLanguage();
  const t = content?.[language]?.SettingsPageClient || {};

  useEffect(() => {
      const storedUser = sessionStorage.getItem("AgentAPI.Host");
      if (storedUser) {   
        setHideKyc(storedUser)
      }
  }, [])
  

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    setTab(urlTab === "api" ? "api" : "kyc");
  }, [searchParams]);

  return (
    <div className="p-6 min-h-screen bg-[var(--brand-background)]">
      <h1 className="text-3xl font-bold text-[var(--brand-text)] mb-4">{t.title || 'Settings'}</h1>

      <div className="flex border-b border-[var(--brand-border)]">
        {
          hideKyc !== 'kikkin.tagroot.io' &&
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

      <div className="mt-6 bg-[var(--brand-navbar)] shadow-md rounded-lg p-6">
        {tab === "kyc" && hideKyc !== 'kikkin.tagroot.io' ? <KYCSettings /> : <APIKeys />}
      </div>
    </div>
  );
}
