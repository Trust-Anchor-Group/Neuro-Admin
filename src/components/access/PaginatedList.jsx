import React from 'react'
import TableComponent from './TableComponent';
import { Pagination } from './Pagination';
import { FaSpinner } from 'react-icons/fa';

export const PaginatedList = ({ userList, page, prevPage, totalPages, loading }) => {

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <FaSpinner className="text-4xl text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!userList) {
        return (
            <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold md:text-3xl">User&nbsp;List</h2>
                <h3 className="mt-4 text-gray-600">Could not retrieve any data, try later</h3>
            </div>
        );
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
                                <Pagination page={page} prevPage={prevPage} totalPages={totalPages} />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
