"use client"
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import { enUS as coreEnUS, ptBR as corePtBR, frFR as coreFrFR } from '@mui/material/locale';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import { MRT_Localization_PT_BR } from 'material-react-table/locales/pt-BR';
import { MRT_Localization_FR } from 'material-react-table/locales/fr';
import { useLanguage } from '../../../context/LanguageContext';


const TableComponent = ({data = [], columns = [],enableSorting = false, enableRowActions, renderRowActionMenuItems,
  customCellRenderers = {}, page, limit, totalItems,}) => {
    
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = new URLSearchParams(searchParams)
    const pathnameWithFilter = `${pathname}?${params}`
    const router = useRouter()
  const { language } = useLanguage();
  const baseTheme = useTheme();
  const muiLocaleMap = {
    en: coreEnUS,
    pt: corePtBR,
    fr: coreFrFR,
  };
  const mrtLocaleMap = {
    en: MRT_Localization_EN,
    pt: MRT_Localization_PT_BR,
    fr: MRT_Localization_FR,
  };
  const mergedTheme = createTheme(baseTheme, muiLocaleMap[language] || coreEnUS);


  const modifiedColumns = columns.map((col) => ({
    ...col,
    Cell: customCellRenderers[col.accessorKey] || col.Cell, 
  }))

  // derive controlled pagination state from props/URL
  const total = Number.isFinite(Number(totalItems)) ? Number(totalItems) : data.length;
  const pageIndex = Math.max(0, (Number(page) || 1) - 1);
  const pageSize = Number.isFinite(Number(limit)) ? Number(limit) : (total || 50);
  
  const brandPaperSx = {
    backgroundColor: 'var(--brand-navbar)',
    color: 'var(--brand-text-color)',
    border: '1px solid var(--brand-border)',
    borderRadius: '16px',
    overflow: 'hidden',
  };

  const iconButtonPalette = {
    color: 'var(--brand-text-color)',
    '& svg': {
      color: 'var(--brand-text-color)',
    },
    '&:hover svg': {
      color: 'var(--brand-text-color)',
    },
  };

  const table = useMaterialReactTable({
    columns: modifiedColumns,
    data,
    enableSorting: true,
    enableColumnFilters: false,
    enablePagination: true,
    manualPagination: true, // server-side pagination
    rowCount: total, // total number of rows on the server
    enableGlobalFilter: false,
    enableColumnActions: true,
    enableRowActions: renderRowActionMenuItems == false ? false : true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enableHiding: true,
    positionActionsColumn: "last",
    renderRowActionMenuItems: renderRowActionMenuItems || undefined,
    localization: mrtLocaleMap[language] || MRT_Localization_EN,
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
      const nextPage = (next?.pageIndex ?? 0) + 1;
      const nextLimit = next?.pageSize ?? pageSize;
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('page', String(nextPage));
      newParams.set('limit', String(nextLimit));
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        if (!pathname.includes('id-application')) {
          const checkId = row.original.latestLegalId?.length
            ? row.original.latestLegalId
            : row.original.userName;
      
          router.push(`/neuro-access/detailpage/${checkId}?ref=${encodeURIComponent(pathnameWithFilter)}`)
        } else {
          router.push(`/neuro-access/detailpage/${row.original.id}?ref=${encodeURIComponent(pathnameWithFilter)}`)
        }
      },
      sx: {
        cursor: 'pointer',
        '& .MuiTableCell-root': {
          backgroundColor: 'var(--brand-third)',
          color: 'var(--brand-text-color)',
          borderBottom: '1px solid var(--brand-border)',
        },
      },
    }),
  
    muiTableHeadCellProps: ({ column }) => ({
      sx: {
        color: 'var(--brand-text-color) !important',
        fontWeight: 500,
        '& .MuiTableSortLabel-root': {
          color: 'var(--brand-text-color) !important',
          '&.Mui-active': {
            color: 'var(--brand-text-color) !important',
          },
          '& .MuiTableSortLabel-icon': {
            color: 'var(--brand-text-color) !important',
            opacity: 1,
          },
        },
        '& .MuiSvgIcon-root': {
          color: 'var(--brand-text-color) !important',
          opacity: 0.9,
        },
        '& .MuiIconButton-root': {
          ...iconButtonPalette,
        },
        ...(column.id === "mrt-row-actions"
          ? {}
          : {
              '& .MuiTableSortLabel-root:hover': {
                color: 'var(--brand-text-color)',
              },
            }),
      },
    }),
    
    muiTableHeadRowProps: {
      sx: {
        '& .MuiTableCell-root': {
          backgroundColor: 'var(--brand-third)',
          borderBottom: '1px solid var(--brand-border)',
        },
      },
    },

    muiTablePaperProps: ({ table }) => ({
      elevation: 0,
      sx: brandPaperSx,
      style: {
        zIndex: table.getState().isFullScreen ? 0 : undefined,
      },
    }),

    muiTableContainerProps: {
      sx: {
        backgroundColor: 'var(--brand-third)',
      },
    },

    muiBottomToolbarProps: {
      sx: {
        backgroundColor: 'var(--brand-navbar)',
        color: 'var(--brand-text-color)',
        borderTop: '1px solid var(--brand-border)',
        '& .MuiIconButton-root, & .MuiButtonBase-root, & .MuiTablePagination-actions button': {
          ...iconButtonPalette,
        },
      },
    },

    muiTopToolbarProps: {
      sx: {
        backgroundColor: 'var(--brand-navbar)',
        color: 'var(--brand-text-color)',
        borderBottom: '1px solid var(--brand-border)',
        marginTop: "100px", // Flyttar ned knapparna
        '& .MuiIconButton-root, & .MuiButtonBase-root': {
          ...iconButtonPalette,
        },
      },
    },

    muiPaginationProps: {
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
    },

    muiTablePaginationProps: {
      sx: {
        color: 'var(--brand-text-color)',
        '& .MuiTablePagination-toolbar': {
          color: 'var(--brand-text-color)',
          backgroundColor: 'var(--brand-navbar)',
        },
        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
          color: 'var(--brand-text-color) !important',
          opacity: 1,
        },
        '& .MuiSelect-select': {
          color: 'var(--brand-text-color) !important',
          opacity: 1,
        },
        '& .MuiTypography-root': {
          color: 'var(--brand-text-color) !important',
          opacity: 1,
        },
        '& .MuiInputBase-input': {
          color: 'var(--brand-text-color) !important',
        },
        '& .MuiSelect-icon': {
          color: 'var(--brand-text-color)',
        },
        '& .MuiTablePagination-actions button': {
          ...iconButtonPalette,
        },
        '& .MuiTablePagination-actions button svg': {
          color: 'var(--brand-text-color)',
        },
        '& .MuiInputBase-root': {
          color: 'var(--brand-text-color)',
          borderRadius: '8px',
          '& fieldset': {
            borderColor: 'var(--brand-border)',
          },
          '&:hover fieldset': {
            borderColor: 'var(--brand-border)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'var(--brand-primary)',
          },
        },
      },
    },
  });
  
  
  return (
    <ThemeProvider theme={mergedTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="">
          <MaterialReactTable table={table} />
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default TableComponent;
