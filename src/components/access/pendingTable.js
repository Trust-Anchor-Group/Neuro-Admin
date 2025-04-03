import Link from "next/link";
import { FaCheck, FaExclamationTriangle, FaPlusCircle, FaTimes, FaTimesCircle, FaUser } from "react-icons/fa";
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
            
           return <div className={`text-center bg-yellow-500/30 max-w-[125px] rounded-full items-center`}>
            <span className={``}>Pending&nbsp;approval</span>
          </div>
          }
        },
        account: ({ cell, row }) => {
          return <Link href={`/list/access/detailpage/${row.original.id}`}>
            <p className="cursor-pointer text-blue-600 hover:underline
             hover:text-blue-400">{row.original.account}</p>
          </Link>
            
        
      }}     

     const arrayActions = [
          {actionTitle:'Approved',icon:FaCheck,iconColor:'text-green-600',name:'Approve'},
          {actionTitle:'Rejected',icon:FaTimes,iconColor:'text-red-600',name:'Reject'},
          {actionTitle:'Obsoleted',icon:FaTimesCircle,iconColor:'text-red-600',name:'Obsolete'},
          {actionTitle:'Compromised',icon:FaExclamationTriangle,iconColor:'text-orange-500',name:'Compromise'},
        ]
  

      export const pendingActions = ({ closeMenu, row,getData,onToggleHandler }) => [
        <MenuItem key={1} onClick={closeMenu}>
                <div className="">
            <Link href={`/list/access/detailpage/${row.original.id}`}>
                  <div className="flex gap-2 items-center">
                      <FaUser />
                          <p>See Profile</p>
                    </div>
            </Link>
                </div>
        </MenuItem>,
                arrayActions.map((item,index) =>(
                  <MenuItem key={index + 2} onClick={closeMenu}>
                    <button 
                      onClick={() => onToggleHandler(row.original.id,item.actionTitle,item.name)}
                      className="flex gap-2 rounded-full items-center"
                    >
                      <item.icon className={item.iconColor} />
                      {item.name}
                    </button>
                  </MenuItem>
                    )),   
    ];


    