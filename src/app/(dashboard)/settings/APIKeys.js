"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash, FaCopy, FaEllipsisV, FaKey } from "react-icons/fa";

const initialKeys = [
  { id: 1, name: "Production API Key", key: "sk_live_1234567890", role: "admin", created: "Dec 5, 2024", lastUsed: "Mar 5, 2025" },
  { id: 2, name: "Development API Key", key: "sk_test_1234567890", role: "reader", created: "Feb 3, 2025", lastUsed: "Mar 4, 2025" },
  { id: 3, name: "Integration Testing", key: "sk_test_9876543210", role: "manager", created: "Feb 18, 2025", lastUsed: "Never" },
];

const roleColors = {
  admin: "bg-blue-600 text-white",
  reader: "bg-gray-500 text-white",
  manager: "bg-green-500 text-white",
};

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState(initialKeys);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [newKey, setNewKey] = useState({ name: "", role: "admin" });

  const toggleVisibility = (id) => {
    setVisibleKeys({ ...visibleKeys, [id]: !visibleKeys[id] });
  };

  const copyToClipboard = (key) => {
    navigator.clipboard.writeText(key);
    alert("API Key copied to clipboard!");
  };

  const handleCreateKey = () => {
    if (!newKey.name.trim()) return alert("Please enter a key name");

    const newAPIKey = {
      id: apiKeys.length + 1,
      name: newKey.name,
      key: `sk_${Math.random().toString(36).substr(2, 12)}`,
      role: newKey.role,
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      lastUsed: "Never",
    };

    setApiKeys([...apiKeys, newAPIKey]);
    setNewKey({ name: "", role: "admin" });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800">API Keys</h2>
      <p className="text-gray-500 text-sm mb-6">Manage API keys for accessing the identity verification system</p>

      {/* API Keys Table */}
      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-6 border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="text-gray-600 border-b border-gray-300">
            <tr>
              <th className="py-3 px-4">Key Name</th>
              <th className="py-3 px-4">API Key</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4">Last Used</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key) => (
              <tr key={key.id} className="border-b border-gray-300 hover:bg-gray-50 transition">
                <td className="py-4 px-4 font-medium text-gray-700">{key.name}</td>
                <td className="py-4 px-4 flex items-center gap-2">
                  <span className="bg-gray-100 px-3 py-1 rounded-lg text-gray-700 font-mono text-sm">
                    {visibleKeys[key.id] ? key.key : `${key.key.substring(0, 6)}...${key.key.slice(-4)}`}
                  </span>
                  <button onClick={() => toggleVisibility(key.id)} className="text-gray-500 hover:text-gray-700 transition">
                    {visibleKeys[key.id] ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <button onClick={() => copyToClipboard(key.key)} className="text-gray-500 hover:text-gray-700 transition">
                    <FaCopy />
                  </button>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold shadow-sm ${roleColors[key.role]}`}>
                    {key.role}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-600">{key.created}</td>
                <td className="py-4 px-4 text-gray-600">{key.lastUsed}</td>
                <td className="py-4 px-4 text-right">
                  <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full transition">
                    <FaEllipsisV />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create API Key Section */}
      <div className="mt-8 bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Create New API Key</h3>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <label className="block text-gray-600 text-sm mb-1">Key Name</label>
            <input
              type="text"
              placeholder="e.g. Production API Key"
              value={newKey.name}
              onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-gray-600 text-sm mb-1">Role</label>
            <select
              value={newKey.role}
              onChange={(e) => setNewKey({ ...newKey, role: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-300"
            >
              <option value="admin">Admin</option>
              <option value="reader">Reader</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <button
            onClick={handleCreateKey}
            className="mt-4 md:mt-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-md transition-all"
          >
            <FaKey /> Generate Key
          </button>
        </div>
      </div>
    </div>
  );
}
