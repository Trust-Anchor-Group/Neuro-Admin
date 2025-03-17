import Link from "next/link";
import { StatusIcon } from "./StatusIcon";
import { FaBan, FaCheck, FaExclamationTriangle, FaPlusCircle, FaRegTimesCircle, FaTimes, FaTimesCircle, FaUser, FaUserCircle } from "react-icons/fa";
import { MenuItem } from "@mui/material";
import { pendingAction } from "./pendingFetch";

    //Decide what columns you should have in your table
   export const userColoumnsCurrentIds = [
        { accessorKey: "name", header: "Name", size: 100,
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
          { accessorKey: "createdDate", header: "Created", size: 100, 
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
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
          if (state === "Approved") return <StatusIcon icon={<FaCheck className="text-green-500" />} text="Approved" color="text-green-600" bgColor={'bg-green-500/30'} />;
          if (state === "Compromised") return <StatusIcon icon={<FaExclamationTriangle className="text-orange-500" />} text="Compromised" color="text-orange-500" bgColor={'bg-orange-500/30'} />;
          if (state === "Created") return <StatusIcon icon={<FaPlusCircle className="text-yellow-500" />} text="Created" color="text-yellow-500" bgColor={'bg-yellow-500/30'} />;
          if (state === "Obsoleted") return <StatusIcon icon={<FaTimesCircle className="text-red-500" />} text="Obsoleted" color="text-red-800" bgColor={'bg-red-500/30'} />;
          if (state === "Rejected") return <StatusIcon icon={<FaBan className="text-red-500" />} text="Rejected" color="text-red-500" bgColor={'bg-red-500/30'} />;
          return <span className="text-gray-500">Unknown</span>;
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
                className="text-blue-600 hover:underline hover:text-blue-400"
                href={`/list/access/detailpage/${row.original.id}`}
                >
                {fullName}
              </Link>

            </div>
          </div>
          ) : "-";
        
      }}


      const arrayActions = [
        {actionTitle:'Approved',icon:FaCheck,iconColor:'text-green-600',name:'Approve'},
        {actionTitle:'Rejected',icon:FaTimes,iconColor:'text-red-600',name:'Reject'},
        {actionTitle:'Obsoleted',icon:FaRegTimesCircle,iconColor:'text-red-600',name:'Obsolete'},
        {actionTitle:'Compromised',icon:FaExclamationTriangle,iconColor:'text-orange-500',name:'Compromise'},
      ]


      export const currentIdActions = ({ closeMenu, row,getData }) => [
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