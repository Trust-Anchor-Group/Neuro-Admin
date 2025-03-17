import Link from "next/link";
import { FaBan, FaCheck, FaExclamationTriangle, FaPlusCircle, FaTimes, FaTimesCircle, FaTrash, FaUser, FaUserCircle } from "react-icons/fa";
import { MenuItem } from "@mui/material";

    //Decide what columns you should have in your table
   export const userColoumnsAccount = [
    { accessorKey: "name", header: "Name", size: 100,
      muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
      muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } }, 
  }
        ,
        { accessorKey: "other.EMAIL", header: "Email", size: 100, 
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
        },
        { accessorKey: "account", header: "Account", size: 200,
          },
        { accessorKey: "state", header: "Id status", size: 50, 
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
        },
        { accessorKey: "createdDate", header: "Created", size: 100, 
          muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
          muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
      },
    ]

    //Special actions a column should/could have
   export const customCellAcountTable = {
        state: ({ cell,row }) => {
           const name = row.original.name
           if(name === ''){
            return <p>Light ID</p>
           }else{
            return <p>Full ID</p>
           }
        },
        name: ({ cell, row }) => {
          const nameParts = cell.getValue()?.split(" ") || [];
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || ""
      
          const fullName = `${firstName}\u00A0${lastName}`.trim()
      
          const profileImage = row.original.profileImage

          return firstName && lastName ? (
            <div className="flex items-center gap-5">
                {profileImage ? (
                <img
                  src={profileImage}
                  alt={fullName}
                  className="size-8 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="size-8 text-gray-400" />
              )}
            <div>
              <Link
                className=""
                href={`/list/access/detailpage/${row.original.id}`}
                >
                   <p className="cursor-pointer text-blue-600 hover:underline
             hover:text-blue-400">{fullName}</p>
              </Link>

            </div>
          </div>
          ) : "-";
        
      }}

      const arrayActions = [
        {actionTitle:'Approved',icon:FaCheck,iconColor:'text-green-600',name:'Approve'},
        {actionTitle:'Rejected',icon:FaTimes,iconColor:'text-red-600',name:'Reject'},
        {actionTitle:'Obsoleted',icon:FaTimesCircle,iconColor:'text-red-600',name:'Obsolete'},
        {actionTitle:'Compromised',icon:FaExclamationTriangle,iconColor:'text-orange-500',name:'Compromise'},
      ]

      export const accountActions = ({ closeMenu, row,getData }) => [
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
                      onClick={async() => {
                        try {
                          await pendingAction(row.original.id, item.actionTitle)
                          getData()
                        } catch (error) {
                          console.log(error)
                        }
                      }}
                      className="flex gap-2 rounded-full items-center"
                    >
                      <item.icon className={item.iconColor} />
                      {item.name}
                    </button>
                  </MenuItem>
                    )),   
    ];