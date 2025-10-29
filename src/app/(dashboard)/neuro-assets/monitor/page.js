"use client";

import DigitalAssetsTable from "@/components/assets/DigitalAssetsTable";
import Header from "@/components/ui/Header";
import OverviewCards from "@/components/ui/OverviewCards";
import MapView from "@/components/assets/MapView";
import React, { useState } from "react";
import { FiMap } from "react-icons/fi";

const MonitorPage = () => {
  const [showMap, setShowMap] = useState(false); 

  const digitalAssets = [
    {
      id: 1,
      name: "Creturner Factory 1",
      type: "Carbon Offset",
      address: "Vasagatan 1, 111 20 Stockholm",
      location: { lat: 59.3308, lng: 18.0567 },
      carbonProcessed: "330,0000 kg",
      status: "Active",
    },
    {
      id: 2,
      name: "Creturner Factory 2",
      type: "Carbon Offset",
      address: "Vasagatan 2, 111 20 Stockholm",
      location: { lat: 59.3309, lng: 18.0568 },
      carbonProcessed: "20,0000 kg",
      status: "Active",
    },
 
  ];

  return (
    <div className="p-6 bg-[var(--brand-background)] min-h-screen">
      {/* Header */}
      <Header title="Digital Assets Monitor" />

      {/* Overview Cards */}
      <OverviewCards />

      {/* Toggle Button */}
      <div className="flex justify-end mt-6 mb-1">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-600 transition"
        >
          <FiMap className="text-xl" />
          {showMap ? "Hide Map" : "View Map"}
        </button>
      </div>
      {/* Map Section */}
      {showMap && (
        <div className="my-8">
          <MapView assets={digitalAssets} />
        </div>
      )}

      {/* Digital Assets Table */}
      <DigitalAssetsTable assets={digitalAssets} />
    </div>
  );
};

export default MonitorPage;
