"use client";

import { useParams } from "next/navigation";
import MetricsGrid from "@/components/assets/MetricsGrid";
import PieChartComponent from "@/components/charts/PieChartComponent";
import KPIsList from "@/components/assets/KPIsList";
import LineChartComponent from "@/components/charts/LineChartComponent";
import AssetHeader from "@/components/assets/AssetHeader";
import AttendanceChart from "@/components/charts/AttendanceChart";

const DigitalAssetDetailsPage = () => {
  const { id } = useParams();

  const digitalAssetDetails = {
    id,
    name: "Creturner Factory 1",
    metrics: [
      { label: "Carbon Processed (This Month)", value: "5,000 kg", color: "green" },
      { label: "Carbon Processed (Total)", value: "50,000 kg", color: "blue" },
      { label: "Factory Utilization", value: "85%", color: "orange" },
      { label: "Uptime", value: "98.5%", color: "green" },
    ],
    distribution: [
      { name: "Offseted Carbon", value: 70 },
      { name: "Proccessing Carbon", value: 30 },
    ],
    performanceIndicators: {
      "Current Balance": "12,450 Units",
      "Total Payments": "$25,000",
      "Current Capacity": "10,000 kg / month",
      "Downtime This Month": "2 hours",
      "Incident Reports": "0",
    },
    yieldPerformance: [
      { year: "2020", yield: 1500 },
      { year: "2021", yield: 1700 },
      { year: "2022", yield: 2000 },
      { year: "2023", yield: 3000 },
      { year: "2024", yield: 4000 },
      { year: "2025", yield: 2000 },
    ],
  };

  const COLORS = ["#6366F1", "#10B981"]; 

  return (
    <div className="p-6 bg-gradient-to-b from-gray-100 via-gray-50 to-white min-h-screen">
      {/* Header */}
      <AssetHeader name={digitalAssetDetails.name} logoSrc="/Creturner-logotyp-bla.png" />

      {/* Content Container */}
      <div className="mx-auto grid grid-cols-1 gap-8">
        {/* Metrics Grid */}
        <MetricsGrid metrics={digitalAssetDetails.metrics} />

        {/* Asset Distribution and KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <div className="col-span-1 lg:col-span-2">
            <PieChartComponent
              data={digitalAssetDetails.distribution}
              colors={COLORS}
              title="Asset Distribution"
            />
          </div>

          {/* KPIs */}
          <KPIsList indicators={digitalAssetDetails.performanceIndicators} />
        </div>

        {/* Yield Performance Line Chart */}
        <LineChartComponent
          data={digitalAssetDetails.yieldPerformance}
          title="Yield Performance Over Time"
        />
      
      </div>
    </div>
  );
};

export default DigitalAssetDetailsPage;
