"use client";

import React, { useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import { Box, CircularProgress } from "@mui/material";
import { FaCheckCircle, FaTimesCircle, FaShippingFast, FaClock } from "react-icons/fa";

export default function AssetOrdersTable({ orders = [], isLoading = false }) {
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Token ID",
        size: 300,
        Cell: ({ cell }) => {
          const id = cell.getValue();
          return id?.slice?.(0, 10) ?? id;
        },
      },
      { accessorKey: "assetName", header: "Asset Name", size: 250 },
      { accessorKey: "category", header: "Category", size: 250 },
      { accessorKey: "amount", header: "Amount", size: 150 },
      { accessorKey: "orderDate", header: "Created Date", size: 200 },
      {
        accessorKey: "status",
        header: "Status",
        size: 150,
        Cell: ({ cell }) => {
          const status = cell.getValue();
          const icon =
            status === "delivered" ? (
              <FaCheckCircle style={{ color: "var(--status-success,#16a34a)" }} />
            ) : status === "shipped" ? (
              <FaShippingFast style={{ color: "var(--status-info,#2563eb)" }} />
            ) : status === "cancelled" ? (
              <FaTimesCircle style={{ color: "var(--status-error,#dc2626)" }} />
            ) : (
              <FaClock style={{ color: "var(--status-warn,#d97706)" }} />
            );

          const statusColor =
            status === "delivered"
              ? "var(--status-success,#16a34a)"
              : status === "shipped"
              ? "var(--status-info,#2563eb)"
              : status === "cancelled"
              ? "var(--status-error,#dc2626)"
              : "var(--status-warn,#d97706)";

          return (
            <Box display="flex" alignItems="center" gap={1}>
              {icon}
              <span style={{ fontWeight: 700, color: statusColor }}>
                {String(status).charAt(0).toUpperCase() + String(status).slice(1)}
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
        <CircularProgress sx={{ color: "var(--brand-primary)" }} />
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

      /* Top toolbar / search / icons */
      muiTopToolbarProps={{
        sx: {
          backgroundColor: "transparent",
          color: "var(--brand-text)",
          borderBottom: "1px solid var(--brand-border)",
          // toolbar title, actions, icons
          "& .MRT_Toolbar-Title, & .MuiTypography-root": { color: "var(--brand-text)" },
          "& .MuiButton-root": { color: "var(--brand-text)" },
          "& .MuiIconButton-root": { color: "var(--brand-text-color) !important", opacity: 0.95 },
          "& .MuiSvgIcon-root": { color: "var(--brand-text-color) !important", opacity: 0.95 },
        },
      }}
      muiSearchTextFieldProps={{
        variant: "outlined",
        size: "small",
        sx: {
          backgroundColor: "var(--brand-background)",
          "& .MuiInputBase-input": { color: "var(--brand-text)" },
          "& .MuiFormLabel-root": { color: "var(--brand-text-secondary)" },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--brand-border)" },
          "& .MuiSvgIcon-root": { color: "var(--brand-text-color)" },
        },
        InputProps: { sx: { color: "var(--brand-text)" } },
      }}

      /* Paper / container: strong overrides for nested MUI bits and borders */
      muiTablePaperProps={{
        elevation: 0,
        sx: {
          backgroundColor: "var(--brand-background)",
          color: "var(--brand-text)",
          border: "1px solid var(--brand-border)",
          borderRadius: "16px",
          overflow: "hidden",

          // header labels are secondary, header icons use icon color
          "& .MuiTableCell-head": { color: "var(--brand-text-secondary)", borderBottom: "1px solid var(--brand-border)" },
          "& .MuiTableCell-root": { borderBottom: "1px solid var(--brand-border)" },

          // header sort/filter icons - use primary icon color
          "& .MuiTableSortLabel-root, & .MuiTableSortLabel-root .MuiSvgIcon-root, & .MRT_TableHeadCellSortLabel": {
            color: "var(--brand-text-color) !important",
            opacity: 0.95,
          },

          // force general icons / iconbuttons to icon color
          "& .MuiSvgIcon-root": { color: "var(--brand-text-color) !important", opacity: 0.95 },
          "& .MuiIconButton-root": { color: "var(--brand-text-color) !important", opacity: 0.95 },
          "& .MuiButton-root": { color: "var(--brand-text)" },

          // helpers
          "& .MuiFormHelperText-root": { color: "var(--brand-text-secondary)" },
        },
      }}

      /* Table container: cover MRT no-data overlay classes and ensure overlays use proper border color */
      muiTableContainerProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
          backgroundColor: "var(--brand-background)",
          "& .MRTNoDataOverlay-root, & .MRTNoDataOverlay-root .MuiTypography-root, & .mrt-no-data-overlay, & .mrt-no-data-text": {
            color: "var(--brand-text-secondary) !important",
            backgroundColor: "transparent",
          },
          // if MRT adds a thin divider between header/body, ensure it uses brand-border
          "& .mrt-table, & .mrt-table thead, & .mrt-table tbody": {
            borderColor: "var(--brand-border) !important",
          },
        },
      }}

      /* Head cells - ensure header icons & sort labels use icon color and header bottom border is brand-border */
      muiTableHeadCellProps={{
        sx: {
          backgroundColor: "var(--brand-third)",
          color: "var(--brand-text-secondary)",
          fontSize: "13px",
          fontWeight: 500,
          textTransform: "none",
          fontFamily: '"Space Grotesk", sans-serif',
          borderBottom: "1px solid var(--brand-border)",
          "& .MuiTableSortLabel-root": { color: "var(--brand-text-color) !important" },
          "& .MuiTableSortLabel-icon, & .MuiTableSortLabel-root .MuiSvgIcon-root": {
            color: "var(--brand-text-color) !important",
            opacity: 0.95,
          },
          "& .MuiTableCell-head .MuiIconButton-root": { color: "var(--brand-text-color) !important" },
        },
      }}
      muiTableHeadRowProps={{
        sx: {
          backgroundColor: "var(--brand-third)",
          borderBottom: "1px solid var(--brand-border)",
        },
      }}

      /* Body cells */
      muiTableBodyCellProps={{
        sx: {
          fontSize: "14px",
          borderBottom: "1px solid var(--brand-border)",
          paddingTop: "12px",
          paddingBottom: "12px",
          fontFamily: '"Space Grotesk", sans-serif',
          color: "var(--brand-text)",
        },
      }}

      /* Body container props */
      muiTableBodyProps={{
        sx: {
          backgroundColor: "var(--brand-background)",
          color: "var(--brand-text)",
          "& .MuiTableRow-root": { color: "var(--brand-text)" },
        },
      }}

      /* Row props */
      muiTableBodyRowProps={({ row }) => ({
        onClick: () => {
          window.location.href = `/neuro-assets/detailpage/${row.original.id}`;
        },
        sx: {
          cursor: "pointer",
          backgroundColor: "transparent",
          color: "var(--brand-text)",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.02)" },
        },
      })}

      /* Pagination (top) */
      muiPaginationProps={{
        shape: "rounded",
        sx: {
          "& .MuiPaginationItem-root": { color: "var(--brand-text-secondary)" },
          "& .Mui-selected": {
            backgroundColor: "var(--brand-accent) !important",
            color: "var(--brand-primary) !important",
          },
        },
      }}

      /* Table pagination (rows per page / displayed rows) */
      muiTablePaginationProps={{
        sx: {
          color: "var(--brand-text-secondary)",
          "& .MuiTablePagination-displayedRows": { color: "var(--brand-text-secondary)" },
          "& .MuiSelect-select": { color: "var(--brand-text)" },
          "& .MuiSvgIcon-root": { color: "var(--brand-text-color) !important" },
          "& .MuiIconButton-root": { color: "var(--brand-text-color) !important" },
          "& .MuiTablePagination-selectLabel": { color: "var(--brand-text-secondary)" },
        },
        SelectProps: { sx: { color: "var(--brand-text)" } },
      }}

      /* Ensure table-level icons/buttons inherit primary icon color */
      muiTableProps={{
        sx: {
          color: "var(--brand-text)",
          "& .MuiButton-root": { color: "var(--brand-text)" },
          "& .MuiIconButton-root": { color: "var(--brand-text-color) !important" },
          "& .MuiSvgIcon-root": { color: "var(--brand-text-color) !important" },
          "& .MuiCheckbox-root": { color: "var(--brand-accent)" },
        },
      }}

      localization={{
        noRecordsToDisplay: "No orders to display",
      }}
    />
  );
}
