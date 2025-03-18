"use client";

import { useState, useEffect, useCallback } from "react";
import AgentAPI from "agent-api";
import { FaCheckCircle, FaExclamationCircle, FaSave, FaSpinner } from "react-icons/fa";

export default function KYCSettings() {
  const [settings, setSettings] = useState(null);
  const [originalSettings, setOriginalSettings] = useState(null); // 🔄 Track original values
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function fetchSettings() {
      try {
        console.log("🚀 Fetching KYC settings...");
        const data = await AgentAPI.Legal.GetApplicationAttributes();
        console.log("✅ KYC Settings Data:", data);

        const formattedSettings = {
          peerReview: data.peerReview ?? false,
          nrReviewers: data.nrReviewers ?? 1,
          nrPhotos: data.nrPhotos ?? 1,
          iso3166: data.iso3166 ?? false,
          requiredFields: [
            { id: "FIRST", label: "First Name", required: data.Required?.includes("FIRST") ?? false },
            { id: "LAST", label: "Last Name", required: data.Required?.includes("LAST") ?? false },
            { id: "PNR", label: "Personal Number", required: data.Required?.includes("PNR") ?? false },
            { id: "ADDR", label: "Address", required: data.Required?.includes("ADDR") ?? false },
            { id: "ZIP", label: "Postal Code", required: data.Required?.includes("ZIP") ?? false },
            { id: "CITY", label: "City", required: data.Required?.includes("CITY") ?? false },
            { id: "COUNTRY", label: "Country", required: data.Required?.includes("COUNTRY") ?? false },
          ],
        };

        setSettings(formattedSettings);
        setOriginalSettings(JSON.stringify(formattedSettings)); // Store for comparison
      } catch (error) {
        console.error("❌ Error fetching KYC settings:", error);
        setMessage({ type: "error", text: "Failed to load settings." });
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  //  Toggle settings
  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  //  Toggle required fields
  const toggleRequiredField = (id) => {
    setSettings((prev) => ({
      ...prev,
      requiredFields: prev.requiredFields.map((field) =>
        field.id === id ? { ...field, required: !field.required } : field
      ),
    }));
  };

  //  Save settings to API
  const saveSettings = useCallback(async () => {
    if (!settings || JSON.stringify(settings) === originalSettings) return;

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        allowPeerReview: settings.peerReview,
        nrReviewersToApprove: settings.nrReviewers.toString(),
        nrPhotosRequired: settings.nrPhotos.toString(),
        requireFirstName: settings.requiredFields.some((field) => field.id === "FIRST" && field.required),
        requireLastName: settings.requiredFields.some((field) => field.id === "LAST" && field.required),
        requirePersonalNumber: settings.requiredFields.some((field) => field.id === "PNR" && field.required),
        requireCountry: settings.requiredFields.some((field) => field.id === "COUNTRY" && field.required),
        requireCity: settings.requiredFields.some((field) => field.id === "CITY" && field.required),
        requirePostalCode: settings.requiredFields.some((field) => field.id === "ZIP" && field.required),
        requireAddress: settings.requiredFields.some((field) => field.id === "ADDR" && field.required),
        requireIso3166Compliance: settings.iso3166,
      };

      console.log("📤 Sending Optimized Payload:", JSON.stringify(payload, null, 2));

      const response = await fetch("/api/settings/peerReview", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings.");
      }

      setMessage({ type: "success", text: "✅ Settings updated successfully!" });
      setOriginalSettings(JSON.stringify(settings)); 
    } catch (error) {
      console.error("❌ Error saving KYC settings:", error);
      setMessage({ type: "error", text: "Failed to update settings." });
    } finally {
      setSaving(false);
    }
  }, [settings, originalSettings]);

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white/90 shadow-2xl rounded-2xl border border-gray-200 backdrop-blur-lg">
      <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">KYC Settings</h2>
      <p className="text-gray-500 text-lg mb-8">Manage identity verification settings with precision.</p>

      {message.text && (
        <div className={`p-4 mb-4 rounded-lg text-center ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.type === "success" ? <FaCheckCircle className="inline mr-2" /> : <FaExclamationCircle className="inline mr-2" />}
          {message.text}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-center">Loading settings...</p>
      ) : (
        <>
          {/*  Peer Review Settings */}
          <div className="bg-gray-50/80 p-6 rounded-lg shadow-lg border border-gray-300 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Peer Review Settings</h3>

            <ToggleRow label="Enable Peer Review" checked={settings.peerReview} onChange={() => toggleSetting("peerReview")} />
            <InputRow label="Number of Reviewers" value={settings.nrReviewers} onChange={(val) => setSettings((prev) => ({ ...prev, nrReviewers: val }))} />
            <InputRow label="Number of Photos" value={settings.nrPhotos} onChange={(val) => setSettings((prev) => ({ ...prev, nrPhotos: val }))} />
          </div>

          {/*  Required Fields */}
          <div className="bg-gray-50/80 p-6 rounded-lg shadow-lg border border-gray-300">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Required Fields</h3>

            {settings.requiredFields.map((field) => (
              <ToggleRow key={field.id} label={field.label} checked={field.required} onChange={() => toggleRequiredField(field.id)} />
            ))}
          </div>

          {/*  Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={JSON.stringify(settings) === originalSettings || saving}
              className={`px-6 py-3 flex items-center gap-3 text-lg rounded-xl font-semibold shadow-md transition-all ${JSON.stringify(settings) === originalSettings || saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

//  COMPONENTS: ToggleRow & InputRow
function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 border-b last:border-none">
      <span className="text-gray-700">{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} className="toggle-input" />
    </div>
  );
}

function InputRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <span className="text-gray-700">{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="input-field" />
    </div>
  );
}
