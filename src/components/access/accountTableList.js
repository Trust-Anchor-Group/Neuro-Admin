import Link from "next/link";
import { FaBan, FaCheck, FaExclamationTriangle, FaPlusCircle, FaTimes, FaTimesCircle, FaTrash, FaUser, FaUserCircle } from "react-icons/fa";
import { MenuItem } from "@mui/material";

    //Decide what columns you should have in your table
   export const userColoumnsAccount = [
    { accessorKey: "name", header: "Name", size: 100, }
        ,
        { accessorKey: "other.EMAIL", header: "Email", size: 100, 
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
        },
        { accessorKey: "other.PHONE", header: "Phone", size: 200,
          muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
          muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } }},
        { accessorKey: "state", header: "Identity", size: 50, 
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
            return <p>No</p>
           }else{
            return <p className="">Yes</p>
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
                      <p>View&nbsp;details</p>
                    </div>
            </Link>
                </div>
        </MenuItem>,
         
    ];