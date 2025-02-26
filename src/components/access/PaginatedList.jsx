import React from 'react'
import { FaCheck, FaExclamationTriangle, FaPlusCircle, FaTimesCircle, FaBan } from 'react-icons/fa';
import { RedirectButton } from './RedirectButton';
import Link from 'next/link';
import TableComponent from './TableComponent';
import { Pagination } from './Pagination';

export const PaginatedList = ({userList,page,prevPage,totalPages}) => {

    return (
        <>
        {
             userList === null || userList === undefined ?
            <div className='border-2 bg-white rounded-xl  min-w-[600px] min-h-[400px]'>
                <h2 className='text-center mb-10 text-xl font-semibold md:text-3xl'>User&nbsp;List</h2>
                <h3 className='flex justify-center items-center'>Could not retrieve any data, try later</h3>

            </div> :

            <div className='p-5 border-2 bg-white rounded-xl min-w-[800px] min-h-[400px] max-sm:min-w-[300px]'>
            <h2 className='text-center mb-10 text-xl font-semibold md:text-3xl'>User&nbsp;List</h2>
            <table className='w-full table-auto border-collapse'>
                <tbody>
                  <tr>
                    <td>
                      <div className='relative'>
                        <TableComponent userList={userList}/>
                        <Pagination page={page} prevPage={prevPage} totalPages={totalPages} />
                      </div>
                    </td>
                  </tr>
                 
                    {/* {userList && userList.map((user) => (
                        <tr className="border-b text-center" key={user.id}>
                          <td>
                            <Link className='text-blue-600 hover:underline hover:text-blue-400'
                             href={`/list/access/admin/${user.id}`}>{user.id.slice(0,10)}</Link> 
                          </td>
                          <td>
                          </td>
                            {user.name === '' ? <td>-</td> : 
                              <td>
                                <Link className='text-blue-600 hover:underline hover:text-blue-400'
                                 href={`/list/access/detailpage/${user.id}`}>{user.name}</Link>
                              </td>
                            }
                            <td className="p-3 break-words text-left max-sm:hidden">{user.account}</td>
                            <td className="p-3 break-words text-left max-sm:hidden">vincentpraktiant@Email.com</td>
                            <td className="p-3 flex justify-center items-center gap-4 md:text-center">
                            <div className="grid grid-cols-2 max-w-[100px]">
                            {user.state === "Approved" ? (
                              <div className='grid grid-cols-2 items-center max-md:grid-cols-1'>
                                              <FaCheck className='text-green-500' />
                                              <span className="text-green-600 hidden md:inline">Approved</span>
                                            </div>
                                          ) : user.state === "Compromised" ? (
                                            <div className='grid grid-cols-2 items-center max-md:grid-cols-1'>
                                              <FaExclamationTriangle className='text-orange-500' />
                                              <span className="text-orange-500 hidden md:inline">Compromised</span>
                                            </div>
                                          ) : user.state === "Created" ? (
                                            <div className='grid grid-cols-2 items-center max-md:grid-cols-1'>
                                              <FaPlusCircle className='text-yellow-500' />
                                              <span className="text-yellow-500 hidden md:inline">Created</span>
                                            </div>
                                          ) : user.state === "Obsoleted" ? (
                                            <div className='grid grid-cols-2 items-center max-md:grid-cols-1'>
                                              <FaTimesCircle className='text-red-500' />
                                              <span className="text-red-500 hidden md:inline">Obsoleted</span>
                                            </div>
                                          ) : user.state === "Rejected" ? (
                                            <div className='grid grid-cols-2 items-center max-md:grid-cols-1'>
                                              <FaBan className='text-red-500' />
                                              <span className="text-red-500 hidden md:inline">Rejected</span>
                                            </div>
                                          ) : (
                                            <span className="text-gray-500">Unknown</span>
                                          )}
                                    </div>
                            </td>

                                    {
                                      user.name === '' ?
                                  <td className='max-sm:hidden'>
                                    Light ID
                                  </td> : 
                                  <td className='max-sm:hidden'>
                                    Full ID
                                  </td>
                                    }
                                  <td>
                                    <RedirectButton hamburgMeny={true} userId={user.id}/>
                                  </td>
                        </tr>
                    ))} */}
                </tbody>
            </table>
        </div>
                }
                    </>
    )
}
