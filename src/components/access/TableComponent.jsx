"use client"; // Viktigt för Next.js 13+ (App Router)

import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Link from "next/link";
import { FaBan, FaCheck, FaExclamationTriangle, FaPlusCircle, FaTimesCircle, FaUser, FaUserCog } from "react-icons/fa";
import { StatusIcon } from "./StatusIcon";
import { MenuItem } from "@mui/material";


const TableComponent = ({ userList }) => {



  const data = userList || [];



  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Legal identites",
        size: 100,
        muiTableBodyCellProps: {
          sx: {
            display: { xs: "none", sm: "table-cell" }, 
          },
        },
        muiTableHeadCellProps: {
          sx: {
            display: { xs: "none", sm: "table-cell" }, 
          },
        },
      
        Cell: ({ cell }) => (
          <Link className="text-blue-600 hover:underline hover:text-blue-400" href={`/list/access/admin/${cell.getValue()}`}>
            {cell.getValue().slice(0, 10)}
          </Link>
        ),
      },
      {
        accessorKey: "name",
        header: "Full Name",
        size: 100,
        Cell: ({ cell, row }) => {
          const nameParts = cell.getValue()?.split(" ") || [];
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || ""
      
          const fullName = `${firstName}\u00A0${lastName}`.trim()
      
          return firstName && lastName ? (
            <Link
              className="text-blue-600 hover:underline hover:text-blue-400"
              href={`/list/access/detailpage/${row.original.id}`}
            >
              {fullName}
            </Link>
          ) : "-";
        },
      },
      {
        accessorKey: "account",
        header: "Account",
        size: 100,
        muiTableBodyCellProps: {
          sx: {
            display: { xs: "none", sm: "table-cell" }, 
          },
        },
        muiTableHeadCellProps: {
          sx: {
            display: { xs: "none", sm: "table-cell" }, 
          },
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 100,
        Cell: () => "vincentpraktiant@Email.com",
        muiTableBodyCellProps: {
          sx: {
            display: { xs: "none", sm: "table-cell" }, 
          },
        },
        muiTableHeadCellProps: {
          sx: {
            display: { xs: "none", sm: "table-cell" }, 
          },
        },
      
      },
      {
        accessorKey: "state",
        header: "Status",
        size: 100,
        Cell: ({ cell }) => {
          const state = cell.getValue();
          if (state === "Approved") return <StatusIcon icon={<FaCheck className="text-green-500" />} text="Approved" color="text-green-600" />;
          if (state === "Compromised") return <StatusIcon icon={<FaExclamationTriangle className="text-orange-500" />} text="Compromised" color="text-orange-500" />;
          if (state === "Created") return <StatusIcon icon={<FaPlusCircle className="text-yellow-500" />} text="Created" color="text-yellow-500" />;
          if (state === "Obsoleted") return <StatusIcon icon={<FaTimesCircle className="text-red-500" />} text="Obsoleted" color="text-red-500" />;
          if (state === "Rejected") return <StatusIcon icon={<FaBan className="text-red-500" />} text="Rejected" color="text-red-500" />;
          return <span className="text-gray-500">Unknown</span>;
        },

      },
      {
        accessorKey: "type of id",
        header: "Type of Id",
        size: 100,
        filterVariant: "select",
        Cell: ({ row }) => (row.original.name ? "Full ID" : "Light ID"),
        muiTableBodyCellProps: {
          sx: {
            display: { xs: "none", sm: "table-cell" }, 
          },
        },
        muiTableHeadCellProps: {
          sx: {
            display: { xs: "none", sm: "table-cell" }, 
          },
        },
      },

    ],
    []
  );



  const table = useMaterialReactTable({
    columns,
    data,
    initialState: { showColumnFilters: false },
    enablePagination: false,
    manualPagination: false,
    enableRowActions: true,
    enableColumnFilters: false,
    enableSorting: false, 
    positionActionsColumn:'last',
    enableGlobalFilter: false,
    enableColumnActions: false,
    renderRowActionMenuItems: ({ closeMenu, row }) => [
      <MenuItem
      key={1}
      onClick={() => closeMenu()}
      >
        <Link href={`/list/access/admin/${row.original.id}`}>
            <div className="flex justify-center items-center gap-5">
                <FaUserCog className='text-lg'/>
                <span>
                Manage user            
                </span>  
            </div>
        </Link>
      
      </MenuItem>,
            <MenuItem
            key={2}
            onClick={() => {
              closeMenu();
            }}
          >
            <Link href={`/list/access/detailpage/${row.original.id}`}>
              <div className="flex justify-center items-center gap-5">
                   <FaUser className='text-lg'/>
              <span>
              Manage userId  
              </span>
              </div>
            </Link>
          
          </MenuItem>,
  
    ],

  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-[400px]">
      <MaterialReactTable 
      table={table} 
      sx={{ 
        minWidth: "800px", 
        minHeight: "400px", 
        overflowX: "auto",
        display: "flex", // Ser till att tabellen fyller utrymmet
        flexDirection: "column" // Behåller strukturen
      }}  />
      </div>
    </LocalizationProvider>
  );
};

export default TableComponent;
