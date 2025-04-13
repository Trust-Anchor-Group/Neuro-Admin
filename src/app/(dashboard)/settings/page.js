"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import KYCSettings from "@/components/settings/kyc/KYCSettings";
import APIKeys from "@/components/settings/apiKey/APIKeys";

export default function SettingsPage() {
  const [tab, setTab] = useState("kyc");

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h1>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-md flex gap-2">
        <button
          onClick={() => setTab("kyc")}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
            tab === "kyc"
              ? "bg-purple-100 text-purple-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center justify-center gap-2">📄 KYC settings</span>
        </button>
        <button
          onClick={() => setTab("api")}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
            tab === "api"
              ? "bg-purple-100 text-purple-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center justify-center gap-2">🔑 API keys</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="mt-8 bg-white shadow-md rounded-xl p-6">
        {tab === "kyc" ? <KYCSettings /> : <APIKeys />}
      </div>
    </div>
  );
}
