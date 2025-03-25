"use client"
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";


const TableComponent = ({data = [], columns = [],enableSorting = false, enableRowActions = false, renderRowActionMenuItems = () => [],
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
    enableRowActions: true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enableHiding: true,
    positionActionsColumn: "last",
    renderRowActionMenuItems,
    muiTableContainerProps: {
      sx: {
        minHeight: "310px",
        maxHeight: "310px", // Fixed typo here from "310x" to "310px"
        overflowY: "auto",
      },
    },
    muiTableBodyCellProps: ({ column }) => ({
      sx: column.id === "mrt-row-actions"
        ? {
            textAlign: "center",
            backgroundColor: "#f9fafb", 
            "& button": {
              backgroundColor: "black",
              color: "white",
              borderRadius: "9999px", 
              padding: "6px",
              minWidth: "32px",
              minHeight: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                backgroundColor: "#333",
              }
            }
          }
        : {},
    }),
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
