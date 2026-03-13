"use client";

import React, { useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import { Box, CircularProgress } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FaCheckCircle, FaLeaf, FaBoxOpen } from "react-icons/fa";

/*
  Theme overrides to force MUI internals to use your CSS variables.
*/
const muiTheme = createTheme({
  typography: { fontFamily: '"Space Grotesk", sans-serif' },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: { color: "var(--brand-text)" },
        body1: { color: "var(--brand-text-secondary)" },
      },
    },
    MuiFormLabel: {
      styleOverrides: { root: { color: "var(--brand-text-secondary)" } },
    },
    MuiInputLabel: {
      styleOverrides: { root: { color: "var(--brand-text-secondary)" } },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { color: "var(--brand-text) !important" },
        input: { color: "var(--brand-text) !important" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { color: "var(--brand-text) !important" },
        input: { color: "var(--brand-text) !important" },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: { color: "var(--brand-text) !important" },
        input: { color: "var(--brand-text) !important" },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          color: "var(--brand-text) !important",
        },
        standard: {
          color: "var(--brand-text) !important",
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { color: "var(--brand-text-secondary)" },
        toolbar: { color: "var(--brand-text-secondary)" },
        displayedRows: { color: "var(--brand-text-secondary)" },
      },
    },
    MuiSvgIcon: {
      styleOverrides: { root: { color: "var(--brand-text-color)" } },
    },
    MuiIconButton: {
      styleOverrides: { root: { color: "var(--brand-text-color)" } },
    },
    MuiTableCell: {
      styleOverrides: { head: { color: "var(--brand-text-secondary)" }, root: { color: "var(--brand-text)" } },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          color: "var(--brand-text-color) !important",
          "& .MuiTableSortLabel-icon": { color: "var(--brand-text-color) !important" },
        },
      },
    },
  },
});

const toProjectDate = (value) => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number" || /^\d+$/.test(String(value))) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return null;
    const millis = numeric < 1e12 ? numeric * 1000 : numeric;
    const parsed = new Date(millis);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatProjectDate = (value) => {
  const parsed = toProjectDate(value);
  if (!parsed) return "N/A";
  return parsed.toLocaleString();
};

export default function AssetTokensTable({ orders = [], isLoading = false, onRowClick }) {
  const columns = useMemo(
    () => [
      {
        id: "project",
        accessorFn: (row) => row?.token?.project_label || row?.token?.friendly_name || row?.project_id || "-",
        header: "Project",
        size: 300,
        Cell: ({ row }) => (
          <Box>
            <div className="font-bold text-[var(--brand-text)]">
              {row.original?.token?.project_label || row.original?.token?.friendly_name || "-"}
            </div>
            <div className="text-xs text-[var(--brand-text-secondary)]">
              {row.original?.token?.project_type || row.original?.project_id}
            </div>
          </Box>
        )
      },
      {
        id: "issuer",
        accessorFn: (row) => row?.token?.issuer_name || "-",
        header: "Issuer",
        size: 150,
        Cell: ({ cell }) => <span>{cell.getValue()}</span>
      },
      {
        id: "country",
        accessorFn: (row) => row?.token?.project_country_code || row?.token?.project_country || "-",
        header: "Country",
        size: 150,
        Cell: ({ cell }) => (
          <Box display="flex" alignItems="center" gap={1}>
            <FaLeaf style={{ color: "var(--brand-accent)" }} />
            <span>{cell.getValue()}</span>
          </Box>
        )
      },
      {
        id: "tokenQuantity",
        accessorFn: (row) => row?.token?.token_quantity ?? 0,
        header: "Total Tokens",
        size: 150,
        Cell: ({ cell }) => (
          <Box display="flex" alignItems="center" gap={1}>
            <FaBoxOpen style={{ color: "var(--brand-accent)" }} />
            <span>{Number(cell.getValue() || 0).toLocaleString()}</span>
          </Box>
        )
      },
      {
        id: "tokensLeft",
        accessorFn: (row) => row?.token?.tokens_left ?? 0,
        header: "Tokens Left",
        size: 150,
        Cell: ({ cell }) => (
          <Box display="flex" alignItems="center" gap={1}>
            <FaCheckCircle className="text-emerald-500" />
            <span>{Number(cell.getValue() || 0).toLocaleString()}</span>
          </Box>
        )
      },
      {
        id: "tokenPrice",
        accessorFn: (row) => row?.token_price ?? 0,
        header: "Token Price",
        size: 150,
        Cell: ({ cell, row }) => {
          const currency = (row.original?.currency || "BRL").toUpperCase();
          const value = Number(cell.getValue() || 0);

          try {
            return (
              <span className="font-mono text-[var(--brand-text)]">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency,
                  minimumFractionDigits: 2,
                }).format(value)}
              </span>
            );
          } catch {
            return (
              <span className="font-mono text-[var(--brand-text)]">
                {currency} {value.toFixed(2)}
              </span>
            );
          }
        },
      },
      {
        id: "visibility",
        accessorFn: (row) => String(row?.visibility || "Private"),
        header: "Visibility",
        size: 140,
        Cell: ({ cell }) => {
          const raw = String(cell.getValue() || "").toLowerCase();
          const visibilityKey = ["deleted", "private", "unlisted", "public"].includes(raw)
            ? raw
            : "private";
          const label = visibilityKey === "deleted"
            ? "Deleted"
            : visibilityKey === "unlisted"
              ? "Unlisted"
              : visibilityKey === "public"
                ? "Public"
                : "Private";
          const className = visibilityKey === "public"
            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
            : visibilityKey === "private"
              ? "bg-slate-500/10 text-slate-500 border border-slate-500/20"
              : visibilityKey === "unlisted"
                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                : "bg-rose-500/10 text-rose-600 border border-rose-500/20";
          return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
              {label}
            </span>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        size: 150,
        accessorFn: (row) => {
          const now = new Date();
          const startDate = toProjectDate(row?.start_date);
          const endDate = toProjectDate(row?.end_date);

          if (startDate && startDate > now) return "Upcoming";
          if (endDate && endDate < now) return "Closed";
          return "Live";
        },
        Cell: ({ cell, row }) => {
          const status = cell.getValue();
          const isLive = status === "Live";
          const isUpcoming = status === "Upcoming";
          const iconColor = isLive ? "var(--status-success,#16a34a)" : isUpcoming ? "#d97706" : "var(--brand-text-secondary)";
          return (
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <FaCheckCircle style={{ color: iconColor }} />
                <span style={{ fontWeight: 700, color: iconColor }}>
                  {status}
                </span>
              </Box>
              <span className="text-[10px] text-[var(--brand-text-secondary)]">
                {`Schedule: ${formatProjectDate(row.original?.start_date)} → ${formatProjectDate(row.original?.end_date)}`}
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
    <ThemeProvider theme={muiTheme}>
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

        /* top toolbar */
        muiTopToolbarProps={{
          sx: {
            backgroundColor: "transparent",
            color: "var(--brand-text)",
            borderBottom: "1px solid var(--brand-border)",
            "& .MRT_Toolbar-Title, & .MRT_Toolbar-InternalActions, & .MRT_Toolbar-LeftActions": {
              color: "var(--brand-text)",
            },
            "& .MuiButton-root": { color: "var(--brand-text)" },
            "& .MuiIconButton-root": { color: "var(--brand-text-color) !important", opacity: 0.95 },
            "& .MuiSvgIcon-root": { color: "var(--brand-text-color) !important", opacity: 0.95 },
            "& .MuiTypography-root": { color: "var(--brand-text)" },
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

        /* paper / container */
        muiTablePaperProps={{
          elevation: 0,
          sx: {
            backgroundColor: "var(--brand-background)",
            color: "var(--brand-text)",
            border: "1px solid var(--brand-border)",
            borderRadius: "16px",
            overflow: "hidden",
            "& .MuiTableCell-head": { color: "var(--brand-text-secondary)", borderBottom: "1px solid var(--brand-border)" },
            "& .MuiTableCell-root": { borderBottom: "1px solid var(--brand-border)" },
            "& .MuiTableSortLabel-root, & .MuiTableSortLabel-root .MuiSvgIcon-root, & .MRT_TableHeadCellSortLabel": {
              color: "var(--brand-text-color) !important",
              opacity: 0.95,
            },
            "& .MuiSvgIcon-root": { color: "var(--brand-text-color) !important", opacity: 0.95 },
            "& .MuiIconButton-root": { color: "var(--brand-text-color) !important", opacity: 0.95 },
            "& .MuiButton-root": { color: "var(--brand-text)" },
            "& .MuiFormHelperText-root": { color: "var(--brand-text-secondary)" },
            "& .MuiTablePagination-root .MuiSelect-select, & .MuiTablePagination-root .MuiInputBase-input": {
              color: "var(--brand-text) !important",
            },
          },
        }}

        muiTableContainerProps={{
          sx: {
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: "var(--brand-background)",
            "& .MRTNoDataOverlay-root, & .MRTNoDataOverlay-root .MuiTypography-root, & .mrt-no-data-overlay, & .mrt-no-data-text": {
              color: "var(--brand-text-secondary) !important",
              backgroundColor: "transparent",
            },
            "& .mrt-table, & .mrt-table thead, & .mrt-table tbody": {
              borderColor: "var(--brand-border) !important",
            },
          },
        }}

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

        muiTableBodyProps={{
          sx: {
            backgroundColor: "var(--brand-background)",
            color: "var(--brand-text)",
            "& .MuiTableRow-root": { color: "var(--brand-text)" },
          },
        }}

        muiTableBodyRowProps={({ row }) => {
          const handleClick = onRowClick
            ? () => onRowClick(row.original)
            : () => {
                const fallbackId = row.original.project_id || row.original.id;
                if (fallbackId) {
                  window.location.href = `/neuro-assets/detailpage/${fallbackId}`;
                }
              };

          return {
            onClick: handleClick,
            sx: {
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "var(--brand-text)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.02)" },
            },
          };
        }}

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

        muiTablePaginationProps={{
          sx: {
            color: "var(--brand-text-secondary)",
            "& .MuiTablePagination-displayedRows": { color: "var(--brand-text-secondary)" },
            "& .MuiSelect-select": { color: "var(--brand-text) !important" },
            "& .MuiInputBase-input": { color: "var(--brand-text) !important" },
            "& .MuiSvgIcon-root": { color: "var(--brand-text-color) !important" },
            "& .MuiIconButton-root": { color: "var(--brand-text-color) !important" },
            "& .MuiTablePagination-selectLabel": { color: "var(--brand-text-secondary)" },
          },
          SelectProps: { sx: { color: "var(--brand-text)" } },
        }}

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
          noRecordsToDisplay: "No tokens to display",
        }}
      />
    </ThemeProvider>
  );
}