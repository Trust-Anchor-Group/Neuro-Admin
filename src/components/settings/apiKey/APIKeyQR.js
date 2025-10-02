"use client";

import { useEffect, useState } from "react";
import { FaDownload, FaSyncAlt } from "react-icons/fa";
import { useLanguage, content as i18nContent } from "../../../../context/LanguageContext";

export default function APIKeyQR({ apiKey }) {
  const { language } = useLanguage();
  const t = i18nContent?.[language]?.apiKeyQR || {};
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expires, setExpires] = useState(Math.floor(Date.now() / 1000) + 86400);

  useEffect(() => {
    generateQR();
  }, [apiKey]);

  async function generateQR() {
    if (!apiKey) return;

    setLoading(true);
    try {
      const response = await fetch("/api/settings/api-keys/qrcode-generated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, expires }),
      });

  if (!response.ok) throw new Error(t.error || "Failed to load QR code");

      const data = await response.json();
      setQrData(data.data);
    } catch (error) {
      console.error("Error fetching QR code:", error);
    } finally {
      setLoading(false);
    }
  }

  function downloadQR() {
    if (!qrData) return;
    const link = document.createElement("a");
    link.href = qrData.url;
    link.download = "APIKey_QR.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function shareQR() {
    if (navigator.share && qrData?.url) {
      fetch(qrData.url)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "APIKey_QR.png", { type: blob.type });
          navigator.share({
            title: t.title || "API key QR-code",
            files: [file],
          });
        })
        .catch((err) => console.error("Share failed", err));
    } else {
      alert(t.shareNotSupported || "Sharing is not supported on this device.");
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-3">{t.title || 'API key QR-code'}</h3>

      <label className="block text-sm text-gray-500 mb-2">
        {t.expirationLabel || 'QR-code expiration date & time (YYYY-MM-DD, Time)'}
      </label>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <input
          className="bg-gray-100 text-center rounded-lg py-2 px-3 text-sm border"
          placeholder={t.placeholders?.year || 'YYYY'}
          maxLength={4}
          value={new Date(expires * 1000).getFullYear()}
          onChange={(e) => {
            const newDate = new Date(expires * 1000);
            newDate.setFullYear(+e.target.value);
            setExpires(Math.floor(newDate.getTime() / 1000));
          }}
        />
        <input
          className="bg-gray-100 text-center rounded-lg py-2 px-3 text-sm border"
          placeholder={t.placeholders?.month || 'MM'}
          maxLength={2}
          value={(new Date(expires * 1000).getMonth() + 1).toString().padStart(2, "0")}
          onChange={(e) => {
            const newDate = new Date(expires * 1000);
            newDate.setMonth(+e.target.value - 1);
            setExpires(Math.floor(newDate.getTime() / 1000));
          }}
        />
        <input
          className="bg-gray-100 text-center rounded-lg py-2 px-3 text-sm border"
          placeholder={t.placeholders?.day || 'DD'}
          maxLength={2}
          value={new Date(expires * 1000).getDate().toString().padStart(2, "0")}
          onChange={(e) => {
            const newDate = new Date(expires * 1000);
            newDate.setDate(+e.target.value);
            setExpires(Math.floor(newDate.getTime() / 1000));
          }}
        />
        <input
          className="bg-gray-100 text-center rounded-lg py-2 px-3 text-sm border"
          placeholder={t.placeholders?.time || 'Time'}
          value={new Date(expires * 1000).toTimeString().slice(0, 5)}
          onChange={(e) => {
            const [hStr, mStr] = e.target.value.split(':');
            const h = parseInt(hStr, 10);
            const m = parseInt(mStr, 10);
            if (!isNaN(h) && !isNaN(m)) {
              const newDate = new Date(expires * 1000);
              newDate.setHours(h);
              newDate.setMinutes(m);
              setExpires(Math.floor(newDate.getTime() / 1000));
            }
          }}
        />
      </div>

      <button
        onClick={generateQR}
        className="w-full bg-[#722FAD] hover:bg-[#5e2491] text-white font-semibold py-2 rounded-lg text-sm flex justify-center items-center gap-2 mb-6"
      >
        <FaSyncAlt /> {t.generateButton || 'Generate QR-code'}
      </button>

      {loading ? (
        <div className="text-center text-gray-500">{t.loading || 'Loading QR code...'}</div>
      ) : qrData ? (
        <div className="bg-[#F9F9F9] p-6 rounded-xl flex flex-col items-center">
          <img
            src={qrData.url}
            alt="QR Code"
            width={qrData.width}
            height={qrData.height}
            className="mb-4"
          />
          <p className="text-gray-500 text-sm mb-4">{t.scanHelp || 'Scan the QR code to access the Neuron'}</p>
          <div className="flex gap-4 w-full">
            <button
              onClick={downloadQR}
              className="flex-1 flex items-center justify-center gap-2 text-[#722FAD] bg-[#E9DDF8] hover:bg-[#dbc9f1] text-sm font-medium px-4 py-2 rounded-lg"
            >
              <FaDownload /> {t.downloadButton || 'Download QR-code'}
            </button>
            <button
              onClick={shareQR}
              className="flex-1 flex items-center justify-center gap-2 text-[#722FAD] bg-[#E9DDF8] hover:bg-[#dbc9f1] text-sm font-medium px-4 py-2 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 2.25l-7.5 4.5m0 0l7.5 4.5m-7.5-4.5v13.5"
                />
              </svg>
      {t.shareButton || 'Share QR-code'}
            </button>
          </div>
        </div>
      ) : (
    <p className="text-center text-red-500">{t.error || 'Failed to load QR code'}</p>
      )}
    </div>
  );
}
