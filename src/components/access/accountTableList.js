import Link from "next/link";
import { FaBan, FaCheck, FaExclamationTriangle, FaEye, FaPlusCircle, FaTimes, FaTimesCircle, FaTrash, FaUser, FaUserCircle } from "react-icons/fa";
import { MenuItem } from "@mui/material";

    //Decide what columns you should have in your table
   export const userColoumnsAccount = [
    { accessorKey: "account", header: "Account Name", size: 100, }
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
      {
        accessorKey: "actions",
        header: "Actions",
        size: 100,
        Cell: ({ row }) => (
          <Link
            href={`/list/access/detailpage/${row.original.id}`}
            className="text-blue-600 hover:text-blue-400 flex items-center gap-2"
          >
            <FaEye /> View
          </Link>
        ),
      },
    ];
    

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
        account: ({ cell, row }) => {
       
         return <div>

          <Link
          className=""
          href={`/list/access/detailpage/${row.original.id}`}
          >
             <p className="cursor-pointer text-blue-600 hover:underline
       hover:text-blue-400">{row.original.account}</p>
        </Link>
        
       </div>
      }}
    


         
    