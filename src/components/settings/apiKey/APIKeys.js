'use client'

import { useState, useEffect, useMemo } from 'react'
import { useLanguage, content as i18nContent } from '../../../../context/LanguageContext'
import { useRouter } from 'next/navigation'
import { MaterialReactTable } from 'material-react-table'
import { FaEye, FaEyeSlash, FaCopy } from 'react-icons/fa'
import { FiSearch } from 'react-icons/fi'

export default function APIKeys() {
  const { language } = useLanguage();
  const t = i18nContent?.[language]?.apiKeysList || {};
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
    router.push(`/neuro-access/settings/api-key/${key}`);
  };
  const columns = useMemo(
    () => [
      {
        accessorKey: 'owner',
        header: t.columns?.owner || 'Owner',
        Cell: ({ row }) => (
          <span className="text-sm font-medium" style={{ color: 'var(--brand-text-color)' }}>
            {row.original.owner}
          </span>
        ),
      },
      {
        accessorKey: 'key',
        header: t.columns?.apiKey || 'API key',
        Cell: ({ row }) => (
          <div className="flex items-center gap-2 bg-[var(--brand-third)] px-3 py-1 rounded-lg font-mono text-sm w-full overflow-hidden">
            <span className="truncate w-full" style={{ color: 'var(--brand-text-color)' }}>
              {visibleKeys[row.original.id]
                ? row.original.key
                : (row.original.key ? row.original.key.replace(/./g, '*') : '********')}
            </span>
            <button
              onClick={(e) => toggleVisibility(row.original.id, e)}
              className="transition-colors"
              style={{ color: 'var(--brand-text-color)' }}
            >
              {visibleKeys[row.original.id] ? (
                <FaEyeSlash size={14} />
              ) : (
                <FaEye size={14} />
              )}
            </button>
            <button
              onClick={(e) => copyToClipboard(row.original.key, e)}
              className="transition-colors"
              style={{ color: 'var(--brand-text-color)' }}
            >
              <FaCopy size={14} />
            </button>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: t.columns?.ownerEmail || 'Owner email',
        Cell: ({ row }) => (
          <span className="text-sm" style={{ color: 'var(--brand-text-secondary)' }}>
            {row.original.email}
          </span>
        ),
        size: 250,
      },
      {
        accessorKey: 'created',
        header: t.columns?.created || 'Created',
        Cell: ({ row }) => (
          <span className="text-sm" style={{ color: 'var(--brand-text-secondary)' }}>
            {row.original.created}
          </span>
        ),
        size: 150,
      },
    ],
    [visibleKeys, t]
  )

  return (
    <div className="bg-[var(--brand-navbar)] rounded-2xl font-grotesk text-[var(--brand-text-color)] p-6">
      <h2 className="text-2xl font-bold text-[var(--brand-text-color)] mb-6">{t.title || 'API keys'}</h2>

      <div className="border border-[var(--brand-border)] rounded-2xl shadow-sm bg-[var(--brand-navbar)] text-[var(--brand-text-color)]">
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
              '& .MuiTablePagination-toolbar': {
                color: 'var(--brand-text-color)',
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: 'var(--brand-text-color)',
              },
              '& .MuiSelect-icon': {
                color: 'var(--brand-text-color)',
              },
              '& .MuiPaginationItem-root': {
                borderRadius: '6px',
                minWidth: '32px',
                height: '32px',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: '"Space Grotesk", sans-serif',
                color: 'var(--brand-text-color)',
              },
              '& .MuiPaginationItem-root.Mui-selected': {
                backgroundColor: 'var(--brand-primary)',
                color: 'var(--brand-background)',
                fontWeight: 600,
              },
              '& .MuiPaginationItem-ellipsis': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'var(--brand-text-color)',
              },
              '& .MuiPaginationItem-icon': {
                color: 'var(--brand-text-color)',
              },
              '& .MuiSvgIcon-root': {
                color: 'var(--brand-text-color)',
              },
            },
          }}
          muiTablePaperProps={{
            elevation: 0,
            sx: {
              backgroundColor: 'var(--brand-navbar)',
              borderRadius: '16px',
              border: '1px solid var(--brand-border)',
              color: 'var(--brand-text-color)',
            },
          }}
          muiTableContainerProps={{
            sx: {
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: 'var(--brand-third)',
            },
          }}
          muiTableHeadCellProps={{
            sx: {
              backgroundColor: 'var(--brand-third)',
              color: 'var(--brand-text-color) !important',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: '"Space Grotesk", sans-serif',
              borderBottom: '1px solid var(--brand-border)',
              '& .MuiTableSortLabel-root': {
                color: 'var(--brand-text-color) !important',
              },
              '& .MuiTableSortLabel-root.Mui-active': {
                color: 'var(--brand-text-color) !important',
              },
              '& .MuiTableSortLabel-icon': {
                color: 'var(--brand-text-color) !important',
                opacity: 1,
              },
              '& .MuiIconButton-root': {
                color: 'var(--brand-text-color)',
                '& svg': {
                  color: 'var(--brand-text-color)',
                },
              },
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              fontSize: '14px',
              borderBottom: '1px solid var(--brand-border)',
              paddingTop: '12px',
              paddingBottom: '12px',
              fontFamily: '"Space Grotesk", sans-serif',
              color: 'var(--brand-text-color)',
              backgroundColor: 'var(--brand-third)',
            },
          }}
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => handleRowClick(row.original.key),
            sx: {
              cursor: "pointer",
              '& .MuiTableCell-root': {
                backgroundColor: 'var(--brand-third)',
              },
              "&:hover .MuiTableCell-root": {
                backgroundColor: 'var(--brand-third)',
                filter: 'brightness(1.05)',
              },
            },
          })}
          muiTopToolbarProps={{
            sx: {
              backgroundColor: 'var(--brand-navbar)',
              color: 'var(--brand-text-color)',
              borderBottom: '1px solid var(--brand-border)',
              '& .MuiIconButton-root': {
                color: 'var(--brand-text-color)',
                '& svg': { color: 'var(--brand-text-color)' },
              },
              '& .MuiInputBase-root': {
                backgroundColor: 'var(--brand-third)',
                color: 'var(--brand-text-color)',
                borderRadius: '8px',
                paddingInline: '6px',
                '& fieldset': { borderColor: 'var(--brand-border)' },
                '&:hover fieldset': { borderColor: 'var(--brand-border)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--brand-primary)' },
                '& .MuiSvgIcon-root': { color: 'var(--brand-text-color)' },
              },
              '& .MuiTypography-root': {
                color: 'var(--brand-text-color)',
              },
            },
          }}
        />
      </div>
    </div>
  )
}


