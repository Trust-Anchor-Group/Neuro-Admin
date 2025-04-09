import Link from "next/link";
import { FaBan, FaCheck, FaExclamationTriangle, FaEye, FaPlusCircle, FaTimes, FaTimesCircle, FaTrash, FaUser, FaUserCircle } from "react-icons/fa";
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  typography: {
    fontFamily: `"Space Grotesk", sans-serif`,
  },
});



    //Decide what columns you should have in your table
   export const userColoumnsAccount = [
    { accessorKey: "account", header: "Account Name", size: 100,
    muiTableHeadCellProps:{
      sx:{
        color: "rgba(24, 31, 37, 0.6)",
            fontWeight: 500, 
      }
    }
     }
        ,
        { accessorKey: "other.EMAIL", header: "Email", size: 100, 

            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },color: "rgba(24, 31, 37, 0.6)",
            fontWeight: 500, },       }
            ,
        },
        { accessorKey: "other.PHONE", header: "Phone", size: 200,
          muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
          muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },color: "rgba(24, 31, 37, 0.6)",
          fontWeight: 500, } }},
        { accessorKey: "state", header: "Identity", size: 50, 
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },color: "rgba(24, 31, 37, 0.6)",
            fontWeight: 500, } },
        },
        { accessorKey: "createdDate", header: "Created", size: 100, 
          muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
          muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },color: "rgba(24, 31, 37, 0.6)",
          fontWeight: 500, } },
      },
      {
        accessorKey: "actions",
        header: "Actions",
        size: 100,
        muiTableHeadCellProps: {
          sx: {
            color: "rgba(24, 31, 37, 0.6)",
            fontWeight: 500,
          },
        },
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
       
          if(row.original.name !== ''){
            return <div>
              <Link href={`/list/access/detailpage/${row.original.id}`}>
                <p className="font-semibold">{row.original.name}</p>
                <p className="cursor-pointer text-blue-600 hover:underline
                  hover:text-blue-400">{row.original.account}</p>
              </Link>
            </div>
          }
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
    


         
    