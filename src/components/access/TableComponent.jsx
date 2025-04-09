"use client"
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";


const TableComponent = ({data = [], columns = [],enableSorting = false, enableRowActions, renderRowActionMenuItems,
  customCellRenderers = {},}) => {


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
    muiTableContainerProps: {
      sx: {
        minHeight: "310px",
        maxHeight: "500px", // Fixed typo here from "310x" to "310px"
        overflowY: "auto",
      },
    },
    muiTableHeadCellProps: ({ column }) => ({
      sx: column.id === "mrt-row-actions" ? { 
        color: "rgba(24, 31, 37, 0.6)", 
        fontWeight: 500 
      } : {}, 
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
