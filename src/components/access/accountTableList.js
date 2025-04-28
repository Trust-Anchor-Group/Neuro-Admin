
import Link from "next/link";
import { FaBan, FaCheck, FaExclamationTriangle, FaEye, FaPlusCircle, FaTimes, FaTimesCircle, FaTrash, FaUser, FaUserCircle } from "react-icons/fa";
import { createTheme } from "@mui/material/styles";
import { StatusIcon } from "./StatusIcon";
import { useSearchParams } from "next/navigation";

export const theme = createTheme({
  typography: {
    fontFamily: `"Space Grotesk", sans-serif`,
  },
});

 

    //Decide what columns you should have in your table
   export const userColoumnsAccount = [
    {
      accessorKey:'firstName', header:'ID name', size:100,
      muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
      muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },color: "rgba(24, 31, 37, 0.6)",
      fontWeight: 500, } },
    },  
    { accessorKey: "latestLegalIdState", header: "Identity", size: 50, 
      muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" }, textAlign: "center",},},
      muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },color: "rgba(24, 31, 37, 0.6)",
      fontWeight: 500, } },
  },
    { accessorKey: "userName", header: "Account Name", size: 100,
    muiTableHeadCellProps:{
      sx:{
        color: "rgba(24, 31, 37, 0.6)",
            fontWeight: 500, 
      }
    }
     }
        ,
        { accessorKey: "eMail", header: "Email", size: 100, 

            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },color: "rgba(24, 31, 37, 0.6)",
            fontWeight: 500, },       }
            ,
        },
   
        { accessorKey: "created", header: "Created", size: 100, 
          muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
          muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" },color: "rgba(24, 31, 37, 0.6)",
          fontWeight: 500, } },
      },
      
    ];
    

    //Special actions a column should/could have
   export const customCellAcountTable = {
    latestLegalIdState: ({ cell,row }) => {
           const state = cell.getValue()
          if (state === "Approved") return <StatusIcon  text="Active Id" color="text-activeGreen" bgColor={'bg-activeGreen/20'} />;
           if (state === "Compromised") return <StatusIcon  text="Compromised" color="text-orange-500" bgColor={'bg-orange-500/30'} />;
           if (state === "Created") return <StatusIcon  text="Id pending" color="text-neuroDarkOrange" bgColor={'bg-neuroOrange/20'} />;
           if (state === "Obsoleted") return <StatusIcon text="Obsoleted" color="text-obsoletedRed" bgColor={'bg-obsoletedRed/20'} />;
           if (state === "Rejected") return <StatusIcon  text="Rejected" color="text-obsoletedRed" bgColor={'bg-neuroRed/20'} />;
  
           return <StatusIcon text={'No Id'} bgColor={'bg-neuroButtonGray'} color={'text-neuroTextBlack/60'}/>
        },
      firstName:({row}) => {
        const firstName = row.original.firstName
        const lastName = row.original.lastNames
        if(firstName !== ''){
          return (
            <p>{firstName}{' '}{lastName}</p>
          )
        } else {
          return <p>-</p>
        }
      },
      created: ({ row }) => {
        const createdTimestamp = row.original.created;
        if (!createdTimestamp) return <span>-</span>;
      
        const date = new Date(createdTimestamp * 1000); // multiplicera med 1000 för sekunder → millisekunder
        const formattedDate = date.toLocaleDateString("sv-SE", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        return <span>{formattedDate}</span>;
      },
       eMail: ({ row }) => {
        const email= row.original.eMail
        if(email!== ''){
          return (
            <p>{email}</p>
          )
        } else {
          return <p>-</p>
        }
      }}
    


         
    