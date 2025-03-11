"use client";

import { useEffect, useState } from "react";
import { FaDownload, FaCalendarAlt, FaSyncAlt } from "react-icons/fa";

export default function APIKeyQR({ apiKey }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expires, setExpires] = useState(Math.floor(Date.now() / 1000) + 86400); // Default: 24 hours from now

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
        body: JSON.stringify({
          apiKey: apiKey,
          expires: expires,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }

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

  return (
    <div className="flex flex-col bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300 mt-6">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">QR Code for API Key</h3>

      {/* Expiry Date Input */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-gray-700 font-medium flex items-center gap-2">
          <FaCalendarAlt className="text-gray-500" />
          Expiry Date:
        </label>
        <input
          type="datetime-local"
          value={new Date(expires * 1000).toISOString().slice(0, 16)}
          onChange={(e) => setExpires(Math.floor(new Date(e.target.value).getTime() / 1000))}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />
        <button
          onClick={generateQR}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaSyncAlt /> Generate
        </button>
      </div>

      {/* QR Code Display */}
      {loading ? (
        <p className="text-gray-500 text-center">Generating QR Code...</p>
      ) : qrData ? (
        <div className="flex flex-col items-center">
          <img
            src={qrData.url}
            alt="API Key QR Code"
            width={qrData.width}
            height={qrData.height}
            className="rounded-lg shadow-md"
          />
          <button
            onClick={downloadQR}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <FaDownload /> Download QR Code
          </button>
        </div>
      ) : (
        <p className="text-red-500 text-center">Failed to load QR Code</p>
      )}
    </div>
  );
}
