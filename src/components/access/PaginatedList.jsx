'use server'
import React from 'react'
import { FaCheck, FaClock, FaTimesCircle } from 'react-icons/fa';
import { DetailPageLink } from './DetailPageLink';
import { RedirectButton } from './RedirectButton';

export const PaginatedList = async ({userList}) => {


    return (
        <div className='p-5 border-2 bg-white rounded-xl  min-w-[800px] min-h-[400px]'>
            <h2 className='text-center mb-10 text-xl font-semibold md:text-3xl'>User&nbsp;List</h2>
            <table className='w-full table-auto border-collapse'>
                <thead>
                    <tr className='border-b-2'>
                        <th className='p-3 text-left'>User&nbsp;ID</th>
                        <th className='p-3 text-left'>Name</th>
                        <th className='p-3 text-left'>Email</th>
                        <th className='p-3 text-left'>Access&nbsp;Level</th>
                        <th className='p-3 text-left'>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {userList && userList.map((user) => (
                        <tr className="border-b" key={user.userId}>
                            <DetailPageLink name={user.userId} userId={user.userId} hrefText={'/'}/>
                            <DetailPageLink name={user.name} userId={user.userId} hrefText={'/list/access/detailpage'}/>
                            <td className="p-3 break-words text-left">{user.email}</td>
                            <td className="p-3 break-words text-left">{user.accessLevel}</td>
                            <td className="p-3 flex justify-center items-center gap-4 md:text-center">
                                <div className="grid grid-cols-2 max-w-[100px]">
                                    {user.status === "Active" ? (
                                        <>
                                        <div className='grid grid-cols-2 items-center'>
                                            <FaCheck className='text-green-500' />
                                            <span className="text-green-600 hidden md:inline">Active</span>
                                        </div>
                                        </>
                                    ) : user.status === "Pending" ? (
                                        <>
                                        <div className='grid grid-cols-2 items-center'>
                                            <FaClock className='text-orange-500' />
                                            <span className="text-orange-500 hidden md:inline">Pending</span>
                                        </div>
                                        </>
                                    ) : (
                                        <>
                                        <div className='grid grid-cols-2 items-center'>
                                            <FaTimesCircle className='text-red-500' />
                                            <span className="text-red-500 hidden md:inline">Revoked</span>
                                        </div>
                                        </>
                                    )}
                                </div>
                                    <RedirectButton hamburgMeny={true} userId={user.userId}/>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
