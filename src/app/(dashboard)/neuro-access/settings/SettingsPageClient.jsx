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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--brand-background)]">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--brand-border)] bg-[var(--brand-navbar)] px-6">
        <h1 className="text-[21px] font-bold leading-none text-[var(--brand-text)]">{t.title || 'Settings'}</h1>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-base leading-none text-gray-500">
          <button
            type="button"
            onClick={() => router.push("/neuro-access")}
            className="transition-colors hover:text-[var(--brand-primary)]"
          >
            Home
          </button>
          <span aria-hidden="true">&gt;</span>
          <span className="font-medium text-gray-500">{t.title || 'Settings'}</span>
        </nav>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4">
      <div className="flex border-b border-[var(--brand-border)] lg:border-b-0 lg:items-stretch">
        {
          hideKyc !== 'kikkin.tagroot.io' &&
          <button
          className={`border-b-2 px-4 py-2 text-center text-lg font-medium transition-colors lg:w-[50%] lg:rounded-xl lg:rounded-r-none lg:border lg:px-4 lg:py-3 lg:shadow-sm ${
            tab === "kyc"
              ? "border-[var(--brand-primary)] text-[var(--brand-primary)] lg:bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] lg:text-[var(--brand-text-color)]"
              : "border-transparent text-gray-500 hover:text-[var(--brand-primary)] lg:border-[var(--brand-border)] lg:bg-[var(--brand-navbar)] lg:hover:bg-[var(--brand-hover)] lg:hover:text-gray-500"
          }`}
          onClick={() => router.push("/neuro-access/settings?tab=kyc")}
          >
          <span className="flex items-center justify-center gap-2 lg:text-lg lg:font-semibold">
            <img src="/format_list_bulleted.svg" alt="" aria-hidden="true" className="h-4 w-4 lg:h-5 lg:w-5" />
            {t.kycTab || 'KYC Settings'}
          </span>
        </button>
        }
        <button
          className={`border-b-2 px-4 py-2 text-center text-lg font-medium transition-colors lg:rounded-xl lg:border lg:px-4 lg:py-3 lg:shadow-sm ${
            hideKyc !== 'kikkin.tagroot.io' ? "lg:w-[50%] lg:-ml-px lg:rounded-l-none" : ""
          } ${
            tab === "api"
              ? "border-[var(--brand-primary)] text-[var(--brand-primary)] lg:bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] lg:text-[var(--brand-text-color)]"
              : "border-transparent text-gray-500 hover:text-[var(--brand-primary)] lg:border-[var(--brand-border)] lg:bg-[var(--brand-navbar)] lg:hover:bg-[var(--brand-hover)] lg:hover:text-gray-500"
          }`}
          onClick={() => router.push("/neuro-access/settings?tab=api")}
        >
          <span className="flex items-center justify-center gap-2 lg:text-lg lg:font-semibold">
            <img src="/api.svg" alt="" aria-hidden="true" className="h-4 w-4 lg:h-5 lg:w-5" />
            {t.apiTab || 'API Keys'}
          </span>
        </button>
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-visible bg-[var(--brand-background)] shadow-md rounded-lg">
        {tab === "kyc" && hideKyc !== 'kikkin.tagroot.io' ? <KYCSettings /> : <APIKeys />}
      </div>
      </div>
    </div>
  );
}
