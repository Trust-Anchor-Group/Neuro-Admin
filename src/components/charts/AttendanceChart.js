"use client";

import { FaEllipsisV } from "react-icons/fa"; 
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Jan",
    Accepted: 100,
    Rejected: 50,
  },
  {
    name: "Feb",
    Accepted: 90,
    Rejected: 50,
  },
  {
    name: "Mar",
    Accepted: 90,
    Rejected: 50,
  },
  {
    name: "Apr",
    Accepted: 90,
    Rejected: 50,
  },
  {
    name: "May",
    Accepted: 90,
    Rejected: 50,
  },
  {
    name: "Jun",
    Accepted: 90,
    Rejected: 50,
  },
  {
    name: "Jul",
    Accepted: 90,
    Rejected: 50,
  },
];

const AttendanceChart = () => {
  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-blue-500">Neuro Access ID</h1>
        <FaEllipsisV className="text-gray-500 text-lg cursor-pointer" /> {/* Replaced Image with Icon */}
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart width={500} height={300} data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
          />
          <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }}
          />
          <Legend
            align="left"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "20px", paddingBottom: "40px" }}
          />
          <Bar
            dataKey="Accepted"
            fill="#FAE27C"
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
          <Bar
            dataKey="Rejected"
            fill="#C3EBFA"
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;