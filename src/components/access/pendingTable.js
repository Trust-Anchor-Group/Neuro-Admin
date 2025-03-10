import Link from "next/link";
import { StatusIcon } from "./StatusIcon";
import { FaBan, FaCheck, FaClock, FaExclamationTriangle, FaTimes, FaTimesCircle } from "react-icons/fa";
import { MenuItem } from "@mui/material";
import { pendingAction } from './pendingFetch.js'

    //Decide what columns you should have in your table
   export const userColoumnsPending = [
        { accessorKey: "account", header: "Account", size: 150,
          },
        { accessorKey: "state", header: "Status", size: 50, 
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
        },
        { accessorKey: "createdDate", header: "Created", size: 150, 
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
        },
    ]

    //Special actions a column should/could have
   export const customCellPendingTable = {
        state: ({ cell }) => {
          const state = cell.getValue();
          if (state === "Approved") return <StatusIcon icon={<FaCheck className="text-green-500" />} text="Approved" color="text-green-600" bgColor={'bg-green-500'} />;
          if (state === "Compromised") return <StatusIcon icon={<FaExclamationTriangle className="text-orange-500" />} text="Compromised" color="text-orange-500" bgColor={'bg-orange-500'} />;
          if (state === "Created") return <StatusIcon icon={<FaClock className="text-yellow-500" />} text="New application" color="text-yellow-500" bgColor={'bg-yellow-500'} />;
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

     function handleClick(userId,clickedState){
       pendingActions(userId,clickedState)
      }

      export const pendingActions = ({ closeMenu, row }) => {
      console.log(row)    
        return [
          <MenuItem className="bg-black" key={1} onClick={closeMenu}>
            <button 
              onClick={() => handleClick(row.original.id, 'Approved')} 
              className="flex gap-2 rounded-full items-center"
            >
              <FaCheck className="text-green-600" />
              Approve
            </button>
          </MenuItem>,
          <MenuItem key={2} onClick={closeMenu}>
            <Link href={`/list/access/reject/${row.original.id}`}>
              <div className="flex gap-2 items-center">
                <FaTimes className="text-red-600" />
                Reject
              </div>
            </Link>
          </MenuItem>,
        ];
      };


    