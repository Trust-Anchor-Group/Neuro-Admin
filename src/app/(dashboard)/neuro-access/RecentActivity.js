"use client";

import { useState } from "react";

const mockActivity = [
  { id: 1, user: "John Doe", action: "Updated Profile", time: "3 hours ago" },
  { id: 2, user: "Jane Smith", action: "Completed KYC Verification", time: "5 hours ago" },
  { id: 3, user: "Mike Johnson", action: "Logged in", time: "7 hours ago" },
];

export default function RecentActivity() {
  const [activities] = useState(mockActivity);

  return (
    <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-xl p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Recent Activity</h2>
      <ul className="divide-y divide-gray-300">
        {activities.map((activity) => (
          <li key={activity.id} className="py-4 flex justify-between items-center hover:bg-gray-100 p-3 rounded-lg transition-all">
            <div>
              <p className="text-gray-800 font-semibold">{activity.user}</p>
              <p className="text-gray-500 text-sm">{activity.action}</p>
            </div>
            <span className="text-gray-500 text-sm">{activity.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
