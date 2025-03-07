"use client";

import { useState } from "react";

const mockApplications = [
  { id: 1, name: "John Doe", submittedAt: "2 hours ago", status: "Pending" },
  { id: 2, name: "Jane Smith", submittedAt: "4 hours ago", status: "Pending" },
  { id: 3, name: "Mike Johnson", submittedAt: "6 hours ago", status: "Pending" },
];

export default function PendingApplications() {
  const [applications] = useState(mockApplications);

  return (
    <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-xl p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Pending Applications</h2>
      <ul className="divide-y divide-gray-300">
        {applications.map((app) => (
          <li key={app.id} className="py-4 flex justify-between items-center hover:bg-gray-100 p-3 rounded-lg transition-all">
            <div>
              <p className="text-gray-800 font-semibold">{app.name}</p>
              <p className="text-gray-500 text-sm">{app.submittedAt}</p>
            </div>
            <span className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm shadow-md">Pending</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
