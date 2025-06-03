"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaCopy, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import APIKeyQR from "@/components/settings/apiKey/APIKeyQR";
import Header from "@/components/shared/Header";

export default function APIKeyDetails() {
  const { key } = useParams();
  const router = useRouter();
  const [apiKeyDetails, setApiKeyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleKeys, setVisibleKeys] = useState({ apiKey: false, secretKey: false });

  useEffect(() => {
    async function fetchAPIKeyDetails() {
      if (!key) return;
      try {
        const response = await fetch("/api/settings/api-keys/api-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: key }),
        });

        if (!response.ok) throw new Error("Failed to fetch API key details");

        const data = await response.json();
        setApiKeyDetails(data.data);
      } catch (error) {
        console.error("Error fetching API key details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAPIKeyDetails();
  }, [key]);

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>;
  if (!apiKeyDetails) return <p className="text-center text-red-500 mt-10">API Key not found</p>;

  return (
    <div className="min-h-screen bg-gray-100">
       <Header title="API key" />
    <div className="min-h-screen px-6 py-12 bg-[#FAFAFA] font-grotesk">
       
      <div className="max-w-6xl mx-auto">
          <button onClick={() => router.push("/neuro-access/settings?tab=api")}
           className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6">
          <FaArrowLeft /> Back to API Keys
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
            <KeyInfo label="Owner:" value={apiKeyDetails.owner} isLink />
            <KeyInfo label="Email:" value={apiKeyDetails.eMail} />
            <KeyInfo label="API key:" value={apiKeyDetails.key} secret visible={visibleKeys.apiKey} onToggle={() => setVisibleKeys(p => ({ ...p, apiKey: !p.apiKey }))} />
            <KeyInfo label="Secret key:" value={apiKeyDetails.secret} secret visible={visibleKeys.secretKey} onToggle={() => setVisibleKeys(p => ({ ...p, secretKey: !p.secretKey }))} />
            <KeyInfo label="Created:" value={new Date(apiKeyDetails.created * 1000).toISOString().split("T")[0]} />
            <KeyInfo label="Max no. accounts:" value={apiKeyDetails.maxAccounts} />
            <KeyInfo label="Accounts created:" value={apiKeyDetails.nrCreated} />
            <KeyInfo label="Accounts deleted:" value={apiKeyDetails.nrDeleted} />
          </div>

          {/* Right column - QR */}
          <APIKeyQR apiKey={apiKeyDetails.key} />
        </div>
      </div>
    </div>
      </div>

  );
}

function KeyInfo({ label, value, isLink = false, secret = false, visible, onToggle }) {
  return (
    <div className="border-b border-gray-200 pb-3">
      <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
      <div className="flex items-center justify-between">
        {secret ? (
          <div className="flex items-center gap-2 text-sm text-gray-900 font-mono overflow-hidden">
            <span className="max-w-[400px] overflow-x-auto whitespace-nowrap font-mono text-sm text-gray-800 pr-1">{visible ? value : "**********************"}</span>
            <button onClick={onToggle} className="text-gray-500 hover:text-gray-700">
              {visible ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            </button>
            <button onClick={() => navigator.clipboard.writeText(value)} className="text-gray-500 hover:text-gray-700">
              <FaCopy size={14} />
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-900">
            {isLink ? <a href="#" className="text-neuroPurple hover:underline">{value}</a> : value}
          </div>
        )}
      </div>
    </div>
  );
}