import Link from "next/link";
import { StatusIcon } from "./StatusIcon";
import { FaBan, FaCheck, FaExclamationTriangle, FaPlusCircle, FaTimes, FaTimesCircle } from "react-icons/fa";
import { MenuItem } from "@mui/material";

    //Decide what columns you should have in your table
   export const userColoumnsCurrentIds = [
    { accessorKey: "id", header: "Legal Identities", size: 100,
        muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
        muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } }, 
    },
        { accessorKey: "name", header: "Full Name", size: 100,
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } }, 
        }
        ,
        { accessorKey: "other.EMAIL", header: "Email", size: 100, 
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
        },
        { accessorKey: "account", header: "Account", size: 100,
          },
        { accessorKey: "state", header: "Status", size: 100, 
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
        },
    ]

    //Special actions a column should/could have
   export const customCellCurrentIdsTable = {
        state: ({ cell }) => {
          const state = cell.getValue();
          if (state === "Approved") return <StatusIcon icon={<FaCheck className="text-green-500" />} text="Approved" color="text-green-600" bgColor={'bg-green-500'} />;
          if (state === "Compromised") return <StatusIcon icon={<FaExclamationTriangle className="text-orange-500" />} text="Compromised" color="text-orange-500" bgColor={'bg-orange-500'} />;
          if (state === "Created") return <StatusIcon icon={<FaPlusCircle className="text-yellow-500" />} text="Created" color="text-yellow-500" bgColor={'bg-yellow-500'} />;
          if (state === "Obsoleted") return <StatusIcon icon={<FaTimesCircle className="text-red-500" />} text="Obsoleted" color="text-red-800" bgColor={'bg-red-500'} />;
          if (state === "Rejected") return <StatusIcon icon={<FaBan className="text-red-500" />} text="Rejected" color="text-red-500" bgColor={'bg-red-500'} />;
          return <span className="text-gray-500">Unknown</span>;
        },
    
        id: ({ cell }) => (
          <Link className="text-blue-600 hover:underline hover:text-blue-400" href={`/list/access/admin/${cell.getValue()}`}>
            {cell.getValue().slice(0, 10)}
          </Link>
        ),
        name: ({ cell, row }) => {
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
        
      }}

      export const currentIdActions = ({ closeMenu, row }) => [
        <MenuItem key={1} onClick={closeMenu}>
                <div className="flex flex-col gap-2 ">
                    <p className="font-semibold">Actions</p>
            <Link href={`/list/access/approve/${row.original.id}`}>
                    <span className="">View Details</span>
            </Link>
                </div>
        </MenuItem>,
        <MenuItem key={2} onClick={closeMenu}>
            <Link href={`/list/access/reject/${row.original.id}`}>
                <div className="flex gap-2 items-center">
                    <FaTimes className="text-red-600" />
                      <span>Reject</span>
                </div>
            </Link>
        </MenuItem>,
    ];