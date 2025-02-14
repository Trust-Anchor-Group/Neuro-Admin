import React from 'react'
import { FaCheck, FaExclamationTriangle, FaPlusCircle, FaTimesCircle, FaBan } from 'react-icons/fa';
import { DetailPageLink } from './DetailPageLink';
import { RedirectButton } from './RedirectButton';

export const PaginatedList = ({userList}) => {

    return (
        <>
        {
             userList === null || userList === undefined ?
            <div className='p-5 border-2 bg-white rounded-xl  min-w-[800px] min-h-[400px]'>
                <h2 className='text-center mb-10 text-xl font-semibold md:text-3xl'>User&nbsp;List</h2>
                <h3 className='flex justify-center items-center'>Could not retrieve any data, try later</h3>

            </div> :

            <div className='p-5 border-2 bg-white rounded-xl min-w-[800px] min-h-[400px] max-sm:min-w-[300px]'>
            <h2 className='text-center mb-10 text-xl font-semibold md:text-3xl'>User&nbsp;List</h2>
            <table className='w-full table-auto border-collapse'>
                <thead>
                    <tr className='border-b-2'>
                        <th className='p-3 text-left max-sm:text-center'>User&nbsp;ID</th>
                        <th className='p-3 text-left max-sm:text-center'>Name</th>
                        <th className='p-3 text-left max-sm:hidden'>Account</th>
                        <th className='p-3 text-left max-sm:hidden'>Access&nbsp;Level</th>
                        <th className='p-3 text-left'>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {userList && userList.map((user) => (
                        <tr className="border-b" key={user.id}>
                            <DetailPageLink name={user.id.slice(0,10)} userId={user.id} hrefText={'/'} classNameText={'text-blue-600 hover:underline hover:text-blue-400'}/>
                            <DetailPageLink name={user.name} userId={user.id} hrefText={'/list/access/detailpage'} classNameText={'text-blue-600 hover:underline hover:text-blue-400'}/>
                            <td className="p-3 break-words text-left max-sm:hidden">{user.account}</td>
                            <td className="p-3 break-words text-left max-sm:hidden">{user.accessLevel}</td>
                            <td className="p-3 flex justify-center items-center gap-4 md:text-center">
                            <div className="grid grid-cols-2 max-w-[100px]">
                            {user.state === "Approved" ? (
    <div className='grid grid-cols-2 items-center'>
      <FaCheck className='text-green-500' />
      <span className="text-green-600 hidden md:inline">Approved</span>
    </div>
  ) : user.state === "Compromised" ? (
    <div className='grid grid-cols-2 items-center'>
      <FaExclamationTriangle className='text-orange-500' />
      <span className="text-orange-500 hidden md:inline">Compromised</span>
    </div>
  ) : user.state === "Created" ? (
    <div className='grid grid-cols-2 items-center'>
      <FaPlusCircle className='text-yellow-500' />
      <span className="text-yellow-500 hidden md:inline">Created</span>
    </div>
  ) : user.state === "Obsoleted" ? (
    <div className='grid grid-cols-2 items-center'>
      <FaTimesCircle className='text-red-500' />
      <span className="text-red-500 hidden md:inline">Obsoleted</span>
    </div>
  ) : user.state === "Rejected" ? (
    <div className='grid grid-cols-2 items-center'>
      <FaBan className='text-red-500' />
      <span className="text-red-500 hidden md:inline">Rejected</span>
    </div>
  ) : (
    <span className="text-gray-500">Unknown</span>
  )}
                                    </div>
                                    <RedirectButton hamburgMeny={true} userId={user.userId}/>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
                }
                    </>
    )
}
