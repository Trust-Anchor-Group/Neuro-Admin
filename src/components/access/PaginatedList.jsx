import React from 'react'
import TableComponent from './TableComponent';
import { Pagination } from './Pagination';
import SearchBar from '../SearchBar';

export const PaginatedList = ({ userList, page, prevPage, totalPages,limit }) => {



    if (!userList) {
        return (
            <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold md:text-3xl">User&nbsp;List</h2>
                <h3 className="mt-4 text-gray-600">Could not retrieve any data, try later</h3>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-center mb-10 text-xl font-semibold md:text-3xl">User&nbsp;List</h2>
            <table className="w-full table-auto border-collapse">
                <tbody>
                    <tr>
                        <td>
                            <div className="relative">
                                <TableComponent userList={userList} />
                                <Pagination page={page} prevPage={prevPage} totalPages={totalPages} limit={limit} />
                                <SearchBar placeholder={'Search...'} classNameText={'w-full border-2 rounded-md py-2 pr-10 pl-2 text-sm'}/>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
