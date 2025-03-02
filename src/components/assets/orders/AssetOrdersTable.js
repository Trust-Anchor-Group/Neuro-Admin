"use client";

import { useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import { Box, CircularProgress } from "@mui/material";
import { FaCheckCircle, FaTimesCircle, FaShippingFast, FaClock } from "react-icons/fa";

const AssetOrdersTable = ({ orders, isLoading }) => {
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Token ID",
        size: 300,
      },
      {
        accessorKey: "assetName",
        header: "Asset Name",
        size: 250,
      },
      {
        accessorKey: "category",
        header: "Category",
        size: 250,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        size: 150,
      },
      {
        accessorKey: "orderDate",
        header: "Created Date",
        size: 200,
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 150,
        Cell: ({ cell }) => {
          const status = cell.getValue();
          return (
            <Box display="flex" alignItems="center" gap={1}>
              {status === "delivered" ? (
                <FaCheckCircle className="text-green-500" />
              ) : status === "shipped" ? (
                <FaShippingFast className="text-blue-500" />
              ) : status === "cancelled" ? (
                <FaTimesCircle className="text-red-500" />
              ) : (
                <FaClock className="text-yellow-500" />
              )}
              <span
                className={`font-bold ${
                  status === "delivered"
                    ? "text-green-600"
                    : status === "shipped"
                    ? "text-blue-600"
                    : status === "cancelled"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </Box>
          );
        },
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MaterialReactTable
      columns={columns}
      data={orders}
      enableColumnFilters
      enableSorting
      enablePagination
      muiTableProps={{
        sx: { boxShadow: 2, borderRadius: 2 },
      }}
      muiTableBodyProps={{
        sx: { "& tr:hover": { backgroundColor: "#f5f5f5" } },
      }}
      muiTableContainerProps={{
        sx: { maxHeight: "600px" }, // Set max height for scrollable table
      }}
      initialState={{
        pagination: { pageSize: 5, pageIndex: 0 }, // Default page size
        sorting: [{ id: "orderDate", desc: true }], // Default sorting by date
      }}
    />
  );
};

export default AssetOrdersTable;
