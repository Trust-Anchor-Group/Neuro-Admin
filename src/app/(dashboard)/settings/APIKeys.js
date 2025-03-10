"use client";

import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaCopy, FaEllipsisV, FaKey } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [visibleKeys, setVisibleKeys] = useState({});
  const router = useRouter();
  useEffect(() => {
    async function fetchAPIKeys() {
      try {
        const response = await fetch("/api/settings/api-keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offset: 0, maxCount: 10 }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch API keys");
        }

        const data = await response.json();
        const formattedKeys = data.data.map((key, index) => ({
          id: index + 1,
          name: `API Key ${index + 1}`,
          key: key.key,
          owner: key.owner,
          email: key.eMail,
          created: new Date(key.created * 1000).toLocaleDateString("en-US"),
          maxAccounts: key.maxAccounts,
          used: key.nrCreated,
          role: "admin",
        }));

        setApiKeys(formattedKeys);
      } catch (error) {
        console.error("Error fetching API keys:", error);
      }
    }

    fetchAPIKeys();
  }, []);

  const toggleVisibility = (id) => {
    setVisibleKeys({ ...visibleKeys, [id]: !visibleKeys[id] });
  };

  const copyToClipboard = (key) => {
    navigator.clipboard.writeText(key);
    alert("API Key copied to clipboard!");
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
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key) => (
              <tr key={key.id} className="border-b border-gray-300 hover:bg-gray-50 transition">
                <td className="py-4 px-4 font-medium text-gray-700">{key.name}</td>
               <td
                    className="py-4 px-4 flex items-center gap-2 cursor-pointer hover:text-blue-600"
                    onClick={() => router.push(`/settings/api-key/${key.key}`)}
                  >
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
                <td className="py-4 px-4 text-gray-600">{key.owner}</td>
                <td className="py-4 px-4 text-gray-600">{key.email}</td>
                <td className="py-4 px-4 text-gray-600">{key.created}</td>
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
    </div>
  );
}
