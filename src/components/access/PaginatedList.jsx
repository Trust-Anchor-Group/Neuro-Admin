import React from 'react'
import TableComponent from './TableComponent';
import { Pagination } from './Pagination';
import SearchBar from '../SearchBar';
import { FiUserPlus } from "react-icons/fi"
import { FaBan, FaCheck, FaExclamationTriangle, FaPlusCircle, FaTimesCircle, FaUser, FaUserCog } from "react-icons/fa";
import { MenuItem } from "@mui/material";
import Link from 'next/link';
import { StatusIcon } from './StatusIcon';


export const PaginatedList = ({ userList, page, prevPage, totalPages,limit }) => {

    
    //Decide what columns you should have in your table
    const userColoumns = [
        { accessorKey: "id", header: "Legal identites", size: 100,
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
          },
        { accessorKey: "name", header: "Full Name", size: 100,
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } }, 
        }
        ,
        { accessorKey: "email", header: "Email", size: 100, 
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
        },
        { accessorKey: "account", header: "Account", size: 100,
          },
        { accessorKey: "state", header: "Status", size: 100, 
            muiTableBodyCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
            muiTableHeadCellProps: { sx: { display: { xs: "none", sm: "table-cell" } } },
        }
    ]

    //Special actions a column should/could have
    const customCellRenderers = {
        state: ({ cell }) => {
          const state = cell.getValue();
          if (state === "Approved") return <StatusIcon icon={<FaCheck className="text-green-500" />} text="Approved" color="text-green-600" />;
          if (state === "Compromised") return <StatusIcon icon={<FaExclamationTriangle className="text-orange-500" />} text="Compromised" color="text-orange-500" />;
          if (state === "Created") return <StatusIcon icon={<FaPlusCircle className="text-yellow-500" />} text="Created" color="text-yellow-500" />;
          if (state === "Obsoleted") return <StatusIcon icon={<FaTimesCircle className="text-red-500" />} text="Obsoleted" color="text-red-500" />;
          if (state === "Rejected") return <StatusIcon icon={<FaBan className="text-red-500" />} text="Rejected" color="text-red-500" />;
          return <span className="text-gray-500">Unknown</span>;
        },
    
        id: ({ cell }) => (
          <Link className="text-blue-600 hover:underline hover:text-blue-400" href={`/list/access/admin/${cell.getValue()}`}>
            {cell.getValue().slice(0, 10)}
          </Link>
        ),
        name: ({ cell, row }) => {
            const nameParts = cell.getValue()?.split(" ") || [];
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || ""
        
            const fullName = `${firstName}\u00A0${lastName}`.trim()
        
            return firstName && lastName ? (
              <Link
                className="text-blue-600 hover:underline hover:text-blue-400"
                href={`/list/access/detailpage/${row.original.id}`}
              >
                {fullName}
              </Link>
            ) : "-";
        
      }}
    
    //  If you plan to use the table on a different page, make sure to wrap both the <TableComponent />
    //  and <Pagination /> inside a <div className="relative">.
    //  This ensures that the table and pagination are always rendered together, preventing layout issues.

    if (!userList) {
        return (
            <div className="">
                <div className='flex justify-center items-center h-screen'>
                  <p className=" text-gray-600 text-xl max-sm:text-lg">Could not retrieve any data, try later</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className='mb-5 flex justify-between items-center'>
            </div>
                <SearchBar placeholder={'Search...'}
                 classNameText={'w-full border-2 rounded-md py-3 my-5 pr-10 pl-12 text-sm'}/>
            <table className="w-full table-auto border-collapse">
                <tbody>
                    <tr>
                        <td>
                            <div className="relative">
                            <TableComponent
                                data={userList}
                                columns={userColoumns}
                                enableRowActions={true}
                                enableGlobalFilter={false}
                                customCellRenderers={customCellRenderers}
                                //Actions Menu
                                renderRowActionMenuItems={({ closeMenu, row }) => [
                                    <MenuItem key={1} onClick={closeMenu}>
                                    <Link href={`/list/access/admin/${row.original.id}`}>
                                        <div className="flex gap-2 items-center">
                                        <FaUserCog className="text-lg" />
                                        Manage User
                                        </div>
                                    </Link>
                                    </MenuItem>,
                                    <MenuItem key={2} onClick={closeMenu}>
                                    <Link href={`/list/access/detailpage/${row.original.id}`}>
                                        <div className="flex gap-2 items-center">
                                        <FaUser className="text-lg" />
                                        View Details
                                        </div>
                                    </Link>
                                    </MenuItem>,
                                ]}
                                />
                                <Pagination page={page} prevPage={prevPage} totalPages={totalPages} limit={limit} />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
