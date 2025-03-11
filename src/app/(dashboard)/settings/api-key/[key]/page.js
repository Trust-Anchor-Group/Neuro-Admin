"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaCopy, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import APIKeyQR from "@/components/settings/apiKey/APIKeyQR";

export default function APIKeyDetails() {
  const { key } = useParams(); // Get API key from URL params
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

        if (!response.ok) {
          throw new Error("Failed to fetch API key details");
        }

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
    <div className="min-h-screen flex flex-col pt-20 bg-gray-100">
      <div className="w-full max-w-5xl mx-auto bg-white shadow-lg rounded-2xl border border-gray-300 p-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
          <FaArrowLeft /> Back to API Keys
        </button>

        <h2 className="text-4xl font-bold text-gray-800 mb-4">API Key Details</h2>
        <p className="text-gray-500 mb-8 text-lg">Manage and secure your API credentials.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailRow label="Owner" value={apiKeyDetails.owner} />
          <DetailRow label="Email" value={apiKeyDetails.eMail} />
          <DetailRow
            label="API Key"
            value={apiKeyDetails.key}
            hidden={!visibleKeys.apiKey}
            onToggle={() => setVisibleKeys({ ...visibleKeys, apiKey: !visibleKeys.apiKey })}
            isSecret
          />
          <DetailRow
            label="Secret Key"
            value={apiKeyDetails.secret}
            hidden={!visibleKeys.secretKey}
            onToggle={() => setVisibleKeys({ ...visibleKeys, secretKey: !visibleKeys.secretKey })}
            isSecret
          />
          <DetailRow label="Created" value={new Date(apiKeyDetails.created * 1000).toLocaleDateString()} />
          <DetailRow label="Max Accounts" value={apiKeyDetails.maxAccounts} />
          <DetailRow label="Used Accounts" value={apiKeyDetails.nrCreated} />
          <DetailRow label="Deleted Accounts" value={apiKeyDetails.nrDeleted} />
        </div>

        <div className="mt-10 p-6 bg-gray-50 rounded-lg border border-gray-300 shadow-md text-center min-h-[400px] flex flex-col items-center">
          <h3 className="text-2xl font-bold text-gray-700 mb-4">API Key QR Code</h3>
          <APIKeyQR apiKey={apiKeyDetails.key} />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, hidden, onToggle, isSecret }) {
  return (
    <div className="flex flex-col bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-300">
      <p className="text-gray-700 font-semibold mb-1">{label}</p>
      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm">
        <div className={`text-gray-900 font-mono text-sm flex-grow overflow-hidden`}>
          {isSecret ? (
            <div className="flex items-center gap-2">
              <div className="max-w-[250px] md:max-w-[300px] lg:max-w-[400px] overflow-x-auto whitespace-nowrap scrollbar-hide">
                {hidden ? "••••••••••••••••••" : value}
              </div>
              {onToggle && (
                <button onClick={onToggle} className="text-gray-500 hover:text-gray-700 transition">
                  {hidden ? <FaEye /> : <FaEyeSlash />}
                </button>
              )}
            </div>
          ) : (
            value
          )}
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(value)}
          className="text-gray-500 hover:text-gray-700 transition ml-3"
        >
          <FaCopy />
        </button>
      </div>
    </div>
  );
}
