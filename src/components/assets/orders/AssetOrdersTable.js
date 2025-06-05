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
        Cell:({cell})=> {
          const id = cell.getValue()
          const slicedId = id.slice(0,10)
          return slicedId

        }
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
        onClick: () => {
          window.location.href = `/neuro-assets/detailpage/${row.original.id}`;
        },
        sx: {
          cursor: 'pointer',
        },
      })}
      />
  );
};

export default AssetOrdersTable;
