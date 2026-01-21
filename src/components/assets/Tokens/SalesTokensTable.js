"use client";

import React, { useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import { Box, CircularProgress } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FaCheckCircle, FaTimesCircle, FaShippingFast, FaClock } from "react-icons/fa";

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
        select: { color: "var(--brand-text) !important" },
        standard: { color: "var(--brand-text) !important" },
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

export default function SalesTokensTable({ orders = [], isLoading = false, onRowClick }) {
  const columns = useMemo(
    () => [
      { accessorKey: "assetName", header: "Asset Name", size: 250 },
      { accessorKey: "category", header: "Category", size: 250 },
      { accessorKey: "amount", header: "Amount", size: 140 },
      { accessorKey: "orderDate", header: "Created Date", size: 200 },
      
      {
        header: "Payment",
        size: 140,
        accessorFn: () => 'Paid',
        Cell: () => (
          <Box display="flex" alignItems="center" gap={1}>
            <FaCheckCircle style={{ color: "var(--status-success,#16a34a)" }} />
            <span style={{ fontWeight: 700, color: "var(--status-success,#16a34a)" }}>Paid</span>
          </Box>
        ),
      },
      {
        accessorKey: "id",
        header: "Token ID",
        size: 300,
        Cell: ({ cell }) => {
          const id = cell.getValue();
          return id?.toString?.()?.slice?.(0, 10) ?? id ?? "";
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
        initialState={{ density: 'compact' }}
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
            overflowX: 'auto',
            "& .MRTNoDataOverlay-root, & .MRTNoDataOverlay-root .MuiTypography-root, & .mrt-no-data-overlay, & .mrt-no-data-text": {
              color: "var(--brand-text-secondary) !important",
              backgroundColor: "transparent",
            },
            "& .mrt-table, & .mrt-table thead, & .mrt-table tbody": {
              borderColor: "var(--brand-border) !important",
            },
            "& .MuiTableCell-root": {
              verticalAlign: 'middle',
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
        muiTableBodyRowProps={({ row }) => ({
          onClick: () => onRowClick?.(row.original),
          sx: {
            cursor: "pointer",
            backgroundColor: "transparent",
            color: "var(--brand-text)",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.02)" },
          },
        })}
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
