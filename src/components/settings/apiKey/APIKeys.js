"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MaterialReactTable } from "material-react-table";
import { FaEye, FaEyeSlash, FaCopy } from "react-icons/fa";

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [rowCount, setRowCount] = useState(100);
  const router = useRouter();

  useEffect(() => {
    async function fetchAPIKeys() {
      setLoading(true);
      try {
        const offset = pagination.pageIndex * pagination.pageSize;
        const res = await fetch("/api/settings/api-keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offset, maxCount: pagination.pageSize }),
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setRowCount(data.total || offset + data.data.length);

        const formatted = data.data.map((key, i) => ({
          id: offset + i + 1,
          name: `API key ${offset + i + 1}`,
          key: key.key,
          owner: key.owner,
          email: key.eMail,
          created: new Date(key.created * 1000).toISOString().slice(0, 10),
        }));

        setApiKeys(formatted);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAPIKeys();
  }, [pagination]);

  const toggleVisibility = (id, e) => {
    e.stopPropagation();
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (key, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(key);
  };

  const handleRowClick = (key) => {
    router.push(`/settings/api-key/${key}`);
  };

  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Key name",
      Cell: ({ row }) => (
        <span className="text-sm text-gray-900 font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "key",
      header: "API key",
      Cell: ({ row }) => (
        <div className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-xl font-mono text-sm text-gray-800 w-full max-w-[300px] overflow-hidden">
          <span className="truncate">
            {visibleKeys[row.original.id]
              ? row.original.key
              : "******************************"}
          </span>
          <button
            onClick={(e) => toggleVisibility(row.original.id, e)}
            className="text-gray-500 hover:text-gray-700"
          >
            {visibleKeys[row.original.id] ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
          </button>
          <button
            onClick={(e) => copyToClipboard(row.original.key, e)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaCopy size={14} />
          </button>
        </div>
      ),
    },
    {
      accessorKey: "owner",
      header: "Owner",
      Cell: ({ row }) => (
        <span className="text-sm text-gray-800">{row.original.owner}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Owner email",
      Cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "created",
      header: "Created",
      Cell: ({ row }) => (
        <span className="text-sm text-gray-500">{row.original.created}</span>
      ),
    },
  ], [visibleKeys]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">API keys</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <MaterialReactTable
          columns={columns}
          data={apiKeys}
          state={{ isLoading: loading, pagination }}
          manualPagination
          rowCount={rowCount}
          onPaginationChange={setPagination}
          enableColumnResizing={false}
          muiTablePaperProps={{ elevation: 0 }}
          muiTableContainerProps={{
            sx: {
              borderRadius: "0",
              padding: "0 24px",
              paddingTop: "12px",
              paddingBottom: "16px",
            },
          }}
          muiTableHeadCellProps={{
            sx: {
              backgroundColor: "white",
              color: "#374151",
              fontWeight: 600,
              fontSize: "14px",
              paddingY: "16px",
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              fontSize: "14px",
              borderBottom: "none",
              color: "#374151",
              paddingY: "18px",
            },
          }}
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => handleRowClick(row.original.key),
            sx: {
              cursor: "pointer",
              backgroundColor: "#fff",
              borderRadius: "12px",
              marginBottom: "6px",
              "&:hover": {
                backgroundColor: "#f9fafb",
              },
            },
          })}
          muiPaginationProps={{
            shape: "rounded",
            showRowsPerPage: false,
            position: "top",
            sx: {
              padding: "16px 24px 0",
              justifyContent: "flex-end",
              ".MuiPaginationItem-root": {
                fontSize: "14px",
                borderRadius: "8px",
              },
              ".Mui-selected": {
                backgroundColor: "#e9ddf8 !important",
                color: "#722fad !important",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
