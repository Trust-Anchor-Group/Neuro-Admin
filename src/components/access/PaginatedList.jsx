'use server'
import React from 'react'
import { FaCheck, FaClock, FaTimesCircle } from 'react-icons/fa';

export const PaginatedList = async ({userList}) => {


    return (
        <div className='p-5 border-2 bg-white rounded-xl overflow-x-auto md:overflow-x-hidden min-w-[800px] min-h-[400px]'>
            <h2 className='text-center mb-10 text-xl font-semibold md:text-3xl'>User&nbsp;List</h2>
            <table className='w-full table-auto border-collapse'>
                <thead>
                    <tr className='border-b-2'>
                        <th className='p-3 text-left md:text-center'>User&nbsp;ID</th>
                        <th className='p-3 text-left md:text-center'>Name</th>
                        <th className='p-3 text-left md:text-center'>Email</th>
                        <th className='p-3 text-left md:text-center'>Access&nbsp;Level</th>
                        <th className='p-3 text-left md:text-center'>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {userList && userList.map((user) => (
                        <tr className="border-b" key={user.userId}>
                            <td className="p-3 break-words md:text-center">{user.userId}</td>
                            <td className="p-3 break-words md:text-center">{user.name}</td>
                            <td className="p-3 break-words md:text-center">{user.email}</td>
                            <td className="p-3 break-words md:text-center">{user.accessLevel}</td>
                            <td className="p-3 md:text-center">
                                <div className="flex items-center justify-center gap-2">
                                    {user.status === "Active" ? (
                                        <>
                                            <FaCheck className='text-green-500' />
                                            <span className="text-green-600 hidden md:inline">Active</span>
                                        </>
                                    ) : user.status === "Pending" ? (
                                        <>
                                            <FaClock className='text-orange-500' />
                                            <span className="text-orange-500 hidden md:inline">Pending</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaTimesCircle className='text-red-500' />
                                            <span className="text-red-500 hidden md:inline">Revoked</span>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
