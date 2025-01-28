"use client";

import { FaEllipsisV, FaUser } from "react-icons/fa"; 
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Total",
    count: 106,
    fill: "white",
  },
  {
    name: "Published",
    count: 56,
    fill: "#1E88E5",
  },
  {
    name: "Unpublished",
    count: 50,
    fill: "#E91E63",
  },
];

const CountChart = () => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-blue-500">Assets Count</h1>
        <FaEllipsisV className="text-gray-500 text-lg cursor-pointer" /> {/* Replaced Image with Icon */}
      </div>
      {/* CHART */}
      <div className="relative w-full h-[75%]">
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={32}
            data={data}
          >
            <RadialBar background dataKey="count" />
          </RadialBarChart>
        </ResponsiveContainer>
        <FaUser
          className="absolute text-gray-400 text-4xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        /> {/* Replaced Image with Icon */}
      </div>
      {/* BOTTOM */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-neuroBlue rounded-full" />
          <h1 className="font-bold">1,234</h1>
          <h2 className="text-xs text-gray-300">published (55%)</h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-neuroPink rounded-full" />
          <h1 className="font-bold">1,234</h1>
          <h2 className="text-xs text-gray-300">unpublished (45%)</h2>
        </div>
      </div>
    </div>
  );
};

export default CountChart;
