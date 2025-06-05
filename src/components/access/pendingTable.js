'use client'
import Link from "next/link";
import { FaCheck, FaExclamationTriangle, FaPlusCircle, FaTimes, FaTimesCircle, FaUser } from "react-icons/fa";
import { MenuItem } from "@mui/material";
import { MdAssignment } from 'react-icons/md'

    //Decide what columns you should have in your table
   export const userColoumnsPending = [
    {
      accessorKey:'name', header:'ID name', size:100,
      muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
      muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },color: "rgba(24, 31, 37, 0.6)",
      fontWeight: 500, } },
    },  
        { accessorKey: "account", header: "Account", size: 100,
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
        { accessorKey: "city", header: "Location", size: 100, 
          muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
          muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },   color: "rgba(24, 31, 37, 0.6)",
          fontWeight: 500, } },
      },
      { accessorKey: "createdDate", header: "Created", size: 100, 
        muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
        muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },color: "rgba(24, 31, 37, 0.6)",
        fontWeight: 500, } },
    },
     
    ]

    //Special actions a column should/could have
   export const customCellPendingTable = {
    account: ({ cell, row }) => {
       const account = row.original.account
      if(account){
        return (
          <p>{account}</p>
        )
      } else {
        <p>-</p>
      } 
  },
     name: ({ cell, row }) => {
       const name = row.original.name
      if(name){
        return (
          <p>{name}</p>
        )
      } else {
        <p>-</p>
      }}
      ,     
      "other.EMAIL": ({ cell, row }) => {
       const email = row.original.other.EMAIL
        return email ? (
          <p title={email}>
            {email.length > 20 ? `${email.slice(0, 20)}...` : email}
          </p>
        ) : (
          <p>-</p>
        );
    },
         city: ({ cell, row }) => {
       const city = row.original.city
      if(city){
        return (
          <p>{city}</p>
        )
      } else {
        <p>-</p>
      }}
      }

     const arrayActions = [
          {actionTitle:'Approved',icon:FaCheck,iconColor:'text-green-600',name:'Approve application'},
          {actionTitle:'Rejected',icon:FaTimes,iconColor:'text-red-600',name:'Deny application'},
        ]
  
    

      export const pendingActions = ({ closeMenu, row,getData,onToggleHandler,pathnameWithFilter }) => [
        <MenuItem key={1} onClick={closeMenu}>
                <div className="">
            <Link href={`/neuro-access/detailpage/${row.original.id}?ref=${encodeURIComponent(pathnameWithFilter)}`}>
                  <div className="flex gap-2 items-center">
                      <MdAssignment />
                          <p>See Application</p>
                    </div>
            </Link>
                </div>
        </MenuItem>,
                arrayActions.map((item,index) =>(
                  <MenuItem key={index + 2}>
                    <button 
                      onClick={() => {
                        onToggleHandler(row.original.id, item.actionTitle, item.name);
                        closeMenu(); // Kalla på closeMenu efteråt
                      }}
                      className="flex gap-2 rounded-full items-center"
                    >
                      <item.icon className={item.iconColor} />
                      {item.name}
                    </button>
                  </MenuItem>
                    )),   
    ];


    