import Link from "next/link";
import { FaCheck, FaExclamationTriangle, FaPlusCircle, FaTimes, FaTimesCircle, FaUser } from "react-icons/fa";
import { MenuItem } from "@mui/material";
import { pendingAction } from './pendingFetch.js'
import { StatusIcon } from "./StatusIcon.jsx";

    //Decide what columns you should have in your table
   export const userColoumnsPending = [
    {
      accessorKey:'name', header:'ID name', size:100,
      muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
      muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },color: "rgba(24, 31, 37, 0.6)",
      fontWeight: 500, } },
    },  
        { accessorKey: "account", header: "Account", size: 200,
          muiTableHeadCellProps: {
            sx: {
              color: "rgba(24, 31, 37, 0.6)",
              fontWeight: 500,
            },
          },
          },
          { accessorKey: "other.EMAIL", header: "Email", size: 100, 

            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },color: "rgba(24, 31, 37, 0.6)",
            fontWeight: 500, },       }
            ,
        },
        { accessorKey: "city", header: "Location", size: 200, 
          muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
          muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },   color: "rgba(24, 31, 37, 0.6)",
          fontWeight: 500, } },
      },
     
    ]

    //Special actions a column should/could have
   export const customCellPendingTable = {
    account: ({ cell, row }) => {
       
      if(row.original.name !== ''){
        return <div>
          
            <p className="font-semibold">{row.original.name}</p>
            <p className="
              ">{row.original.account}</p>
        
        </div>
      }
     return <div>

   
         <p className="
   ">{row.original.account}</p>
  
    
   </div>
  }
      }

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


    