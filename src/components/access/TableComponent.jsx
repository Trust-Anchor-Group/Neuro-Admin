"use client"
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";


const TableComponent = ({data = [], columns = [],enableSorting = false, enableRowActions, renderRowActionMenuItems,
  customCellRenderers = {},}) => {
    
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = new URLSearchParams(searchParams)
    const pathnameWithFilter = `${pathname}?${params}`
    const router = useRouter()


  const modifiedColumns = columns.map((col) => ({
    ...col,
    Cell: customCellRenderers[col.accessorKey] || col.Cell, 
  }))
  
  const table = useMaterialReactTable({
    columns: modifiedColumns,
    data,
    enableSorting: true,
    enableColumnFilters: false,
    enablePagination: false,
    enableGlobalFilter: false,
    enableColumnActions: true,
    enableRowActions: renderRowActionMenuItems == false ? false : true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enableHiding: true,
    positionActionsColumn: "last",
    renderRowActionMenuItems: renderRowActionMenuItems || undefined,
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
      },
    }),
  
    muiTableHeadCellProps: ({ column }) => ({
      sx: column.id === "mrt-row-actions" ? { 
        color: "rgba(24, 31, 37, 0.6)", 
        fontWeight: 500 
      } : {}, 
    }),
    
    muiTablePaperProps: ({ table }) => ({
  //not sx
  style: {
    zIndex: table.getState().isFullScreen ? 0 : undefined,
  },
}),

    muiTopToolbarProps: {
      sx: {
        marginTop: "100px", // Flyttar ned knapparna
      },
    }
  });
  
  
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="">
      <MaterialReactTable 
      table={table} /> 
      </div>
    </LocalizationProvider>
  );
};

export default TableComponent;
