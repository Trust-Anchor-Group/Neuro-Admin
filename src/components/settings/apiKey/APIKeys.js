"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {MaterialReactTable} from "material-react-table";
import { FaEye, FaEyeSlash, FaCopy, FaKey } from "react-icons/fa";

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchAPIKeys() {
      try {
        const response = await fetch("/api/settings/api-keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offset: 0, maxCount: 10 }),
        });

        if (!response.ok) throw new Error("Failed to fetch API keys");

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
        console.error("❌ Error fetching API keys:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAPIKeys();
  }, []);

  const toggleVisibility = (id, event) => {
    event.stopPropagation(); 
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (key, event) => {
    event.stopPropagation(); 
    navigator.clipboard.writeText(key);
  };

  const handleRowClick = (key) => {
    router.push(`/settings/api-key/${key}`);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Key Name",
        size: 200,
        Cell: ({ row }) => (
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition"
            onClick={() => handleRowClick(row.original.key)}
          >
            <FaKey className="text-blue-600" />
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "key",
        header: "API Key",
        size: 300,
        Cell: ({ row }) => (
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg font-mono text-sm w-full overflow-hidden">
            <span className="truncate w-40 sm:w-60 md:w-80">
              {visibleKeys[row.original.id]
                ? row.original.key
                : `${row.original.key.substring(0, 6)}...${row.original.key.slice(-4)}`}
            </span>
            <button
              onClick={(event) => toggleVisibility(row.original.id, event)}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              {visibleKeys[row.original.id] ? <FaEyeSlash /> : <FaEye />}
            </button>
            <button
              onClick={(event) => copyToClipboard(row.original.key, event)}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <FaCopy />
            </button>
          </div>
        ),
      },
      { accessorKey: "owner", header: "Owner", size: 150 },
      { accessorKey: "email", header: "Email", size: 250 },
      { accessorKey: "created", header: "Created", size: 150 },
    ],
    [visibleKeys]
  );

  return (
    <div className="max-w-6xl mx-auto mt-10 px-6">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-4xl font-bold text-gray-800">API Keys</h2>
        <p className="text-gray-500">Manage API keys for accessing the identity verification system.</p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-5">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <MaterialReactTable
            columns={columns}
            data={apiKeys}
            enableSorting
            enablePagination
            enableGlobalFilter
            enableColumnResizing
            muiTablePaperProps={{ elevation: 0 }}
            muiTableHeadCellProps={{
              sx: { fontWeight: "bold", bgcolor: "#1E40AF", color: "white" },
            }}
            muiTableBodyCellProps={{ sx: { borderBottom: "1px solid #ddd" } }}
            muiTableContainerProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
            muiTableBodyRowProps={({ row }) => ({
              onClick: () => handleRowClick(row.original.key),
              sx: { cursor: "pointer", "&:hover": { backgroundColor: "#f0f9ff" } },
            })}
          />
        </div>
      )}
    </div>
  );
}
