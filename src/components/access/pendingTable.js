import Link from "next/link";
import { StatusIcon } from "./StatusIcon";
import { FaBan, FaCheck, FaClock, FaExclamationTriangle, FaPlusCircle, FaTimes, FaTimesCircle } from "react-icons/fa";
import { MenuItem } from "@mui/material";
import { pendingAction } from './pendingFetch.js'

    //Decide what columns you should have in your table
   export const userColoumnsPending = [
        { accessorKey: "account", header: "Account", size: 200,
          },
        { accessorKey: "state", header: "Status", size: 50, 
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
        },
        { accessorKey: "createdDate", header: "Created", size: 200, 
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
        },
    ]

    //Special actions a column should/could have
   export const customCellPendingTable = {
        state: ({ cell }) => {
          const state = cell.getValue();
          if(state === 'Created'){
            
           return <div className={`grid grid-cols-2 bg-yellow-500/30 mr-12 pr-[35%] rounded-full items-center max-md:grid-cols-1`}>
            <span className={`z-10 pl-[30%]`}><FaPlusCircle className="text-yellow-500" /></span>
            <span className={`hidden md:inline`}>New&nbsp;application</span>
          </div>
          }
        },
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


    