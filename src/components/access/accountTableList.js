import Link from "next/link";
import { FaBan, FaCheck, FaExclamationTriangle, FaEye, FaPlusCircle, FaTimes, FaTimesCircle, FaTrash, FaUser, FaUserCircle } from "react-icons/fa";
import { createTheme } from "@mui/material/styles";
import { StatusIcon } from "./StatusIcon";

export const theme = createTheme({
  typography: {
    fontFamily: `"Space Grotesk", sans-serif`,
  },
});



    //Decide what columns you should have in your table
   export const userColoumnsAccount = [
    {
      accessorKey:'name', header:'ID name', size:100,
      muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
      muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },color: "rgba(24, 31, 37, 0.6)",
      fontWeight: 500, } },
    },  
    { accessorKey: "state", header: "Identity", size: 50, 
      muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
      muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },color: "rgba(24, 31, 37, 0.6)",
      fontWeight: 500, } },
  },
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
   
        { accessorKey: "createdDate", header: "Created", size: 100, 
          muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
          muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },color: "rgba(24, 31, 37, 0.6)",
          fontWeight: 500, } },
      },
      
    ];
    

    //Special actions a column should/could have
   export const customCellAcountTable = {
        state: ({ cell,row }) => {
           const state = cell.getValue()
          if (state === "Approved") return <StatusIcon  text="Active Id" color="text-activeGreen" bgColor={'bg-activeGreen/20'} />;
           if (state === "Compromised") return <StatusIcon  text="Compromised" color="text-orange-500" bgColor={'bg-orange-500/30'} />;
           if (state === "Created") return <StatusIcon  text="Id pending" color="text-neuroDarkOrange" bgColor={'bg-neuroOrange/20'} />;
           if (state === "Obsoleted") return <StatusIcon text="Obsoleted" color="text-obsoletedRed" bgColor={'bg-obsoletedRed/20'} />;
           if (state === "Rejected") return <StatusIcon  text="Rejected" color="text-obsoletedRed" bgColor={'bg-neuroRed/20'} />;
  
           return <span className="text-gray-500">Unknown</span>;
        },
      
        account: ({ cell, row }) => {
       
          if(row.original.name !== ''){
            return <div>
             
                <p className="font-semibold">{row.original.account}</p>
                
            
            </div>
          }
         return <div>
            
             <p className="">-</p>  
       </div>
      }}
    


         
    