"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import KYCSettings from "@/components/settings/kyc/KYCSettings";
import APIKeys from "@/components/settings/apiKey/APIKeys";

export default function SettingsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState("kyc");

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    setTab(urlTab === "api" ? "api" : "kyc");
  }, [searchParams]);

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Settings</h1>

      <div className="flex border-b">
        <button
          className={`px-4 py-2 text-lg font-medium ${tab === "kyc" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
          onClick={() => router.push("/neuro-access/settings?tab=kyc")}
        >
          KYC Settings
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${tab === "api" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
          onClick={() => router.push("/neuro-access/settings?tab=api")}
        >
          API Keys
        </button>
      </div>

      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        {tab === "kyc" ? <KYCSettings /> : <APIKeys />}
      </div>
    </div>
  );
}
