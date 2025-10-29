"use client";
import { useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import { Box } from "@mui/material";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useLanguage, content } from "../../../context/LanguageContext";
  
const DigitalAssetsTable = ({ assets = [] }) => {
  const { language } = useLanguage();
  const t = content[language]?.Clients;

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: t?.table?.columns?.facilityId || "Facility ID",
        size: 250,
        Cell: ({ cell }) => {
          const id = cell.getValue();
          return typeof id === "string" ? id.slice(0, 10) : id;
        },
      },
      {
        accessorKey: "name",
        header: t?.table?.columns?.name || "Name",
        size: 200,
      },
      {
        accessorKey: "address",
        header: t?.table?.columns?.address || "Address",
        size: 250,
      },
      {
        accessorKey: "carbonProcessed",
        header: t?.table?.columns?.carbonProcessed || "Total Processed Carbon",
        size: 220,
      },
      {
        accessorKey: "status",
        header: t?.table?.columns?.status || "Status",
        size: 140,
        Cell: ({ cell }) => {
          const status = cell.getValue();
          const isActive = status === "Active";
          return (
            <Box display="flex" alignItems="center" gap={1}>
              {isActive ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaTimesCircle className="text-red-500" />
              )}
              <span className={`font-bold ${isActive ? "text-green-600" : "text-red-600"}`}>
                {status}
              </span>
            </Box>
          );
        },
      },
    ],
    [t]
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={assets}
      enableColumnFilters
      enableSorting
      enablePagination
      positionPagination="top"
      paginationDisplayMode="pages"
      enableBottomToolbar={false}
      enableColumnActions={false}
      layoutMode="grid"
      columnResizeMode="onChange"
      enableColumnResizing
      muiPaginationProps={{
        shape: "rounded",
        showFirstButton: false,
        showLastButton: false,
        sx: {
          "& .MuiPagination-ul": {
            justifyContent: "flex-end",
            gap: "8px",
            padding: "8px",
          },
          "& .MuiPaginationItem-root": {
            borderRadius: "6px",
            minWidth: "32px",
            height: "32px",
            fontSize: "14px",
            fontWeight: 500,
            fontFamily: '"Space Grotesk", sans-serif',
            color: "var(--brand-text-secondary)",
          },
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: "var(--brand-primary)",
            color: "var(--brand-secondary)",
            fontWeight: 600,
          },
          "& .MuiPaginationItem-ellipsis": {
            color: "var(--brand-text-secondary)",
          },
          "& .MuiPaginationItem-icon": {
            color: "var(--brand-text-secondary)",
          },
        },
      }}
      muiTablePaperProps={{
        elevation: 0,
        sx: {
          backgroundColor: "var(--brand-navbar)",
          color: "var(--brand-text-color)",
          borderRadius: "16px",
          border: "1px solid var(--brand-border)",
          overflow: "hidden",
        },
      }}
      muiTableContainerProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
          backgroundColor: "var(--brand-navbar)",
        },
      }}
      muiTopToolbarProps={{
        sx: {
          backgroundColor: "var(--brand-navbar)",
          color: "var(--brand-text-color)",
          borderBottom: "1px solid var(--brand-border)",
          "& .MuiIconButton-root, & .MuiButtonBase-root": {
            color: "var(--brand-text-secondary)",
          },
          "& .MuiInputBase-root": {
            color: "var(--brand-text-color)",
            "& .MuiInputBase-input": {
              color: "var(--brand-text-color)",
            },
          },
          "& .MuiSvgIcon-root": {
            color: "var(--brand-text-secondary)",
          },
          "& .MuiTypography-root": {
            color: "var(--brand-text-secondary)",
          },
          "& .MuiTablePagination-root": {
            color: "var(--brand-text-secondary)",
            "& .MuiInputBase-root": {
              color: "var(--brand-text-color)",
            },
            "& .MuiSelect-icon": {
              color: "var(--brand-text-secondary)",
            },
          },
        },
      }}
      muiTableHeadCellProps={{
        sx: {
          backgroundColor: "var(--brand-navbar)",
          color: "var(--brand-text-secondary)",
          fontSize: "13px",
          fontWeight: 600,
          textTransform: "none",
          fontFamily: '"Space Grotesk", sans-serif',
          borderBottom: "1px solid var(--brand-border)",
          "& .MuiTableSortLabel-root": {
            color: "var(--brand-text) !important",
          },
          "& .MuiTableSortLabel-icon": {
            color: "var(--brand-text) !important",
            opacity: 1,
          },
          "& .MuiSvgIcon-root": {
            color: "var(--brand-text) !important",
          },
          "& .MuiTableSortLabel-root.Mui-active": {
            color: "var(--brand-text) !important",
          },
          "& .MuiTableSortLabel-root.Mui-active .MuiTableSortLabel-icon": {
            color: "var(--brand-text) !important",
            opacity: 1,
          },
        },
      }}
      muiTableBodyCellProps={{
        sx: {
          fontSize: "14px",
          borderBottom: "1px solid var(--brand-border)",
          paddingTop: "12px",
          paddingBottom: "12px",
          fontFamily: '"Space Grotesk", sans-serif',
          color: "var(--brand-text-color)",
          backgroundColor: "var(--brand-navbar)",
        },
      }}
      muiTableBodyRowProps={({ row }) => ({
        onClick: () => {
          window.location.href = `/neuro-assets/detailpageclient`;
        },
        sx: {
          cursor: "pointer",
          backgroundColor: "var(--brand-navbar)",
          "&:hover": {
            backgroundColor: "var(--brand-hover)",
          },
        },
      })}
    />
  );
};

export default DigitalAssetsTable;
