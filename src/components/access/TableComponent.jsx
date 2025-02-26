"use client"; // Viktigt för Next.js 13+ (App Router)

import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Link from "next/link";
import { FaBan, FaCheck, FaExclamationTriangle, FaPlusCircle, FaTimesCircle } from "react-icons/fa";
import { RedirectButton } from "./RedirectButton";
import { StatusIcon } from "./StatusIcon";
import { useRouter } from "next/navigation";

const TableComponent = ({ userList }) => {
  const data = userList || [];
  const router = useRouter();


  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "User ID",
        size: 100,
        Cell: ({ cell }) => (
          <Link className="text-blue-600 hover:underline hover:text-blue-400" href={`/list/access/admin/${cell.getValue()}`}>
            {cell.getValue().slice(0, 10)}
          </Link>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
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
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 100,
        Cell: () => "vincentpraktiant@Email.com",
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
      },
      {
        accessorKey: "actions",
        header: "Actions",
        size: 100,
        Cell: ({ row }) => <RedirectButton hamburgMeny={true} userId={row.original.id} />,
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
    muiPaginationProps: {
      sx:{display:'none'}
    },
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MaterialReactTable table={table} sx={{ maxWidth: "1000px", overflowX: "auto" }} />
    </LocalizationProvider>
  );
};

export default TableComponent;
