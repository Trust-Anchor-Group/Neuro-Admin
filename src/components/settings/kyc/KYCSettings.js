"use client";
import { useState, useEffect, useCallback } from "react";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function KYCSettings() {
  const [settings, setSettings] = useState(null);
  const [AgentAPI, setAgentAPI] = useState(null);
  const [originalSettings, setOriginalSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function loadAgentAPI() {
      if (typeof window !== "undefined") {
        try {
          const agentModule = await import("agent-api");
          setAgentAPI(agentModule.default || agentModule);
        } catch (error) {
          console.log("❌ Failed to load AgentAPI:", error);
        }
      }
    }
    loadAgentAPI();
  }, []);

  useEffect(() => {
    async function fetchSettings() {
      if (!AgentAPI || !AgentAPI.Legal?.GetApplicationAttributes) return;
      try {
        const data = await AgentAPI.Legal.GetApplicationAttributes();
        console.log("📄 Fetched KYC settings:", data);
        const formattedSettings = {
          peerReview: data.peerReview ?? false,
          nrReviewers: data.nrReviewers ?? 2,
          nrPhotos: data.nrPhotos ?? 1,
          requirePhotos: data.nrPhotos > 0, 
          requiredFields: [
            { id: "FIRST", label: "First name", required: data.Required?.includes("FIRST") },
            { id: "MID", label: "Middle name", required: data.Required?.includes("MID") },
            { id: "LAST", label: "Last name", required: data.Required?.includes("LAST") },
            { id: "PNR", label: "Personal number", required: data.Required?.includes("PNR") },
            { id: "DOB", label: "Date of birth", required: data.Required?.includes("DOB") },
            { id: "GENDER", label: "Gender", required: data.Required?.includes("GENDER") },
            { id: "NATIONALITY", label: "Nationality", required: data.Required?.includes("NATIONALITY") },
            { id: "ADDR", label: "Address", required: data.Required?.includes("ADDR") },
            { id: "ZIP", label: "Postal code", required: data.Required?.includes("ZIP") },
            { id: "CITY", label: "City", required: data.Required?.includes("CITY") },
            { id: "COUNTRY", label: "Country", required: data.Required?.includes("COUNTRY") },
            { id: "AREA", label: "Area", required: data.Required?.includes("AREA") },
            { id: "REGION", label: "Region", required: data.Required?.includes("REGION") },
          ],
        };
        setSettings(formattedSettings);
        setOriginalSettings(JSON.stringify(formattedSettings));
      } catch (error) {
        setMessage({ type: "error", text: "Failed to load settings." });
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [AgentAPI]);

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRequiredField = (id) => {
    setSettings((prev) => ({
      ...prev,
      requiredFields: prev.requiredFields.map((f) =>
        f.id === id ? { ...f, required: !f.required } : f
      ),
    }));
  };

  const saveSettings = useCallback(async () => {
    if (!settings) return;

    const hasChanges =
      JSON.stringify({
        allowPeerReview: settings.peerReview,
        nrReviewersToApprove: settings.nrReviewers.toString(),
        nrPhotosRequired: settings.nrPhotos.toString(),
        requiredFields: settings.requiredFields
          .filter((f) => f.required)
          .map((f) => f.id),
      }) !==
      JSON.stringify({
        allowPeerReview: JSON.parse(originalSettings).peerReview,
        nrReviewersToApprove: JSON.parse(originalSettings).nrReviewers.toString(),
        nrPhotosRequired: JSON.parse(originalSettings).nrPhotos.toString(),
        requiredFields: JSON.parse(originalSettings).requiredFields
          .filter((f) => f.required)
          .map((f) => f.id),
      });

    if (!hasChanges) return;
    setSaving(true);
    try {
      const payload = {
        allowPeerReview: settings.peerReview,
        nrReviewersToApprove: settings.nrReviewers.toString(),
        nrPhotosRequired: settings.nrPhotos.toString(),
        requiredFields: settings.requiredFields
          .filter((f) => f.required)
          .map((f) => f.id),
      };

      await fetch("/api/settings/peerReview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      setMessage({ type: "success", text: "Settings updated successfully!" });
      setOriginalSettings(JSON.stringify(settings));
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update settings." });
    } finally {
      setSaving(false);
    }
  }, [settings, originalSettings]);

  return (
    <div className="bg-white rounded-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">KYC settings</h2>
      {message.text && (
        <div
          className={`p-3 mb-6 rounded-md text-sm text-center ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.type === "success" ? <FaCheckCircle className="inline mr-2" /> : <FaExclamationCircle className="inline mr-2" />}
          {message.text}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading settings...</p>
      ) : (
        <>
          {/* Peer review settings */}
          <section className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Peer review settings</h3>

            <div className="space-y-4 border-b border-gray-200 pb-4">
              <Checkbox label="Require peer review" checked={settings.peerReview} onChange={() => toggleSetting("peerReview")} />
              {settings.peerReview && (
                <div className="pl-6">
                  <Input
                    label="Min. number of peer reviewers required"
                    value={settings.nrReviewers}
                    onChange={(v) => setSettings({ ...settings, nrReviewers: Number(v) })}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4">
                <Checkbox label="Require photos" checked={settings.requirePhotos} onChange={() => toggleSetting("requirePhotos")} />
              {settings.requirePhotos && (
                <div className="pl-6">
                  <Input
                    label="Min. number of photos required"
                    value={settings.nrPhotos}
                    onChange={(v) => setSettings({ ...settings, nrPhotos: Number(v) })}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Required fields */}
          <section className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Required fields for ID creation</h3>

            <div className="grid grid-cols-2 gap-0 border border-gray-200 rounded-lg divide-y divide-gray-200">
              {settings.requiredFields.map((field, idx) => (
                <div
                  key={field.id}
                  className={`flex items-center px-4 py-3 ${
                    idx % 2 === 0 ? "border-r border-gray-200" : ""
                  }`}
                >
                  <Checkbox label={field.label} checked={field.required} onChange={() => toggleRequiredField(field.id)} />
                </div>
              ))}
            </div>
          </section>

          {/* Buttons */}
          <div className="flex justify-end mt-8 gap-3">
            <button
              onClick={() => setSettings(JSON.parse(originalSettings))}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100"
            >
              Reset changes
            </button>
            <button
              onClick={saveSettings}
              disabled={JSON.stringify(settings) === originalSettings || saving}
              className={`px-5 py-2 text-sm font-semibold rounded-md ${
                JSON.stringify(settings) === originalSettings || saving
                  ? "bg-purple-300 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              Save settings
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-gray-800 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 accent-figmaPurple text-figmaPurple"
      />
      {label}
    </label>
  );
}

function Input({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between text-sm text-gray-800 gap-4">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm"
      />
    </label>
  );
}
