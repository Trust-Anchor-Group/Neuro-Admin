'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { MaterialReactTable } from 'material-react-table'
import { FaEye, FaEyeSlash, FaCopy } from 'react-icons/fa'
import { FiSearch } from 'react-icons/fi'

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState([])
  const [visibleKeys, setVisibleKeys] = useState({})
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [rowCount, setRowCount] = useState(100)
  const [search, setSearch] = useState('')

  const router = useRouter()

  useEffect(() => {
    async function fetchAPIKeys() {
      setLoading(true)
      try {
        const offset = pagination.pageIndex * pagination.pageSize
        const response = await fetch('/api/settings/api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offset, maxCount: pagination.pageSize }),
        })

        const data = await response.json()
        const formatted = data.data.map((key, index) => ({
          id: offset + index + 1,
          name: `API key ${offset + index + 1}`,
          key: key.key,
          owner: key.owner,
          email: key.eMail,
          created: new Date(key.created * 1000).toISOString().slice(0, 10),
        }))

        setApiKeys(formatted)
      } catch (error) {
        console.error('Error fetching API keys', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAPIKeys()
  }, [pagination])

  const toggleVisibility = (id, e) => {
    e.stopPropagation()
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (key, e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(key)
  }
  const handleRowClick = (key) => {
    router.push(`/settings/api-key/${key}`);
  };
  const columns = useMemo(
    () => [
      {
        accessorKey: 'owner',
        header: 'Owner',
        Cell: ({ row }) => (
          <span className="text-sm text-gray-900 font-medium">
            {row.original.owner}
          </span>
        ),
      },
      {
        accessorKey: 'key',
        header: 'API key',
        Cell: ({ row }) => (
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg font-mono text-sm w-full overflow-hidden">
            <span className="truncate w-full">
              {visibleKeys[row.original.id]
                ? row.original.key
                : '••••••••••••••••••••••••••••••••'}
            </span>
            <button
              onClick={(e) => toggleVisibility(row.original.id, e)}
              className="text-gray-500 hover:text-gray-700"
            >
              {visibleKeys[row.original.id] ? (
                <FaEyeSlash size={14} />
              ) : (
                <FaEye size={14} />
              )}
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
        accessorKey: 'email',
        header: 'Owner email',
        Cell: ({ row }) => (
          <span className="text-sm text-gray-800">{row.original.email}</span>
        ),
        size: 250, 
      },
      {
        accessorKey: 'created',
        header: 'Created',
        Cell: ({ row }) => (
          <span className="text-sm text-gray-800">{row.original.created}</span>
        ),
        size: 150,
      },
    ],
    [visibleKeys]
  )

  return (
    <div className="bg-white rounded-2xl  font-grotesk">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">API keys</h2>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <MaterialReactTable
          columns={columns}
          data={apiKeys}
          state={{ isLoading: loading, pagination }}
          manualPagination
          rowCount={rowCount}
          onPaginationChange={setPagination}
          positionPagination="top"
          enableBottomToolbar={false}
          enableColumnActions={false}
          paginationDisplayMode="pages"
          columnResizeMode="onChange"
          layoutMode="grid"
          enableColumnResizing
          muiPaginationProps={{
            shape: 'rounded',
            showFirstButton: false,
            showLastButton: false,
            sx: {
              '& .MuiPagination-ul': {
                justifyContent: 'flex-end',
                gap: '8px',
                padding: '8px',
              },
              '& .MuiPaginationItem-root': {
                borderRadius: '4px',
                minWidth: '32px',
                height: '32px',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: '"Space Grotesk", sans-serif',
                color: '#4B5563',
              },
              '& .Mui-selected': {
                backgroundColor: '#E9DDF8 !important',
                color: '#722FAD !important',
                fontWeight: 600,
              },
              '& .MuiPaginationItem-ellipsis': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '35px',
                color: '#9CA3AF',
                paddingBottom: '1rem',
                borderRadius: '4px',
              },

              '& .MuiPaginationItem-icon': {
                color: '#9CA3AF',
              },
            },
          }}
          muiTablePaperProps={{ elevation: 0 }}
          muiTableContainerProps={{
            sx: { borderRadius: '16px', overflow: 'hidden' },
          }}
          muiTableHeadCellProps={{
            sx: {
              backgroundColor: '#F9FAFB',
              color: '#4B5563',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: '"Space Grotesk", sans-serif',
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              fontSize: '14px',
              borderBottom: '1px solid #E5E7EB',
              paddingTop: '12px',
              paddingBottom: '12px',
              fontFamily: '"Space Grotesk", sans-serif',
            },
          }}
           muiTableBodyRowProps={({ row }) => ({
            onClick: () => handleRowClick(row.original.key),
            sx: {
              cursor: "pointer",
              "&:hover": { backgroundColor: "#f9fafb" },
            },
          })}
        />
      </div>
    </div>
  )
}
