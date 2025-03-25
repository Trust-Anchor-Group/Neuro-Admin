"use client";
export const dynamic = "force-dynamic"; 

import { useState } from "react";
import KYCSettings from "@/components/settings/kyc/KYCSettings";
import APIKeys from "@/components/settings/apiKey/APIKeys";
export default function SettingsPage() {
  const [tab, setTab] = useState("kyc");

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Settings</h1>

      <div className="flex border-b">
        <button
          className={`px-4 py-2 text-lg font-medium ${tab === "kyc" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
          onClick={() => setTab("kyc")}
        >
          KYC Settings
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${tab === "api" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
          onClick={() => setTab("api")}
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
