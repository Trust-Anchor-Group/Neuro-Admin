'use client'
import { createTheme } from "@mui/material/styles";
import { StatusIcon } from "./StatusIcon";
import { useState } from "react";
import { Box } from "@mui/material";


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
        {
          accessorKey: "latestLegalIdState",
          header: "Identity status",
          size: 100,
          muiTableBodyCellProps: {
            sx: {
              display: { xs: "none", sm: "table-cell" },
            },
          },
          muiTableHeadCellProps: {
            sx: {
              display: { xs: "none", sm: "table-cell" },
              color: "rgba(24, 31, 37, 0.6)",
              fontWeight: 500,
            },
          },
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
        { accessorKey: "email", header: "Email", size: 100, 

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
    const state = cell.getValue();

    // Skapa status-komponenten med olika text och färger
    let statusComponent;
    switch (state) {
      case "Approved":
        statusComponent = (
          <StatusIcon
            text="Approved"
            color="text-activeGreen"
            bgColor="bg-activeGreen/20"
          />
        );
        break;
      case "Compromised":
        statusComponent = (
          <StatusIcon
            text="Compromised"
            color="text-orange-500"
            bgColor="bg-orange-500/30"
          />
        );
        break;
      case "Created":
        statusComponent = (
          <StatusIcon
            text="Id pending"
            color="text-neuroDarkOrange"
            bgColor="bg-neuroOrange/20"
          />
        );
        break;
      case "Obsoleted":
        statusComponent = (
          <StatusIcon
            text="Obsoleted"
            color="text-obsoletedRed"
            bgColor="bg-obsoletedRed/20"
          />
        );
        break;
      case "Rejected":
        statusComponent = (
          <StatusIcon
            text="Rejected"
            color="text-obsoletedRed"
            bgColor="bg-neuroRed/20"
          />
        );
        break;
      default:
        statusComponent = (
          <StatusIcon
            text="No Id"
            color="text-neuroTextBlack/60"
            bgColor="bg-neuroButtonGray"
          />
        );
    }
        const paddingLeftByState = {
          Approved: "1rem",
          Compromised: "0.5rem",
          Created: "1.25rem",
          Obsoleted: "1rem",
          Rejected: "1rem",
          default: "2rem",
        };
    // Returnera komponenten inuti en Box med valfri padding
    return (
      <Box
        sx={{
          pl: paddingLeftByState[state] ?? paddingLeftByState.default, // 👈 detta justerar bara för "Approved"
        }}
      >
        {statusComponent}
      </Box>
    );
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
      email: ({ row }) => {
        const email = row.original.email;
        return email ? (
          <p title={email}>
            {email.length > 20 ? `${email.slice(0, 20)}...` : email}
          </p>
        ) : (
          <p>-</p>
        );
      },
      userName: ({row}) => {
        const userName = row.original.userName
        if(userName){
          return <p>{userName}</p>
        } else
        <p>-</p>
      }
      }
    


         
    