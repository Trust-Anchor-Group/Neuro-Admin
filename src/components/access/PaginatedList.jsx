import React from 'react'
import TableComponent from './TableComponent';
import { Pagination } from './Pagination';
import SearchBar from '../SearchBar';
import { FaUser, FaUserCog } from "react-icons/fa";
import { MenuItem } from "@mui/material";
import Link from 'next/link';



export const PaginatedList = ({ userList, page, prevPage, totalPages,limit,customCellRenderers,userColoumns,renderRowActions }) => {

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
                                renderRowActionMenuItems={renderRowActions}
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
