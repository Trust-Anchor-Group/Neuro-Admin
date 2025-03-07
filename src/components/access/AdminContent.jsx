import { PaginatedList } from '@/components/access/PaginatedList'
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import config from '@/config/config';
import Link from 'next/link';
import { FiUserPlus } from 'react-icons/fi';


export const AdminContent = () => {
    const searchParams = useSearchParams()  //Check the page number in the url

    const query = searchParams.get('query') || ''
    const filterIds = searchParams.get('filterIds') || ''
    const tab = searchParams.get('tab') || 'current'
    const [userList, setUserList] = useState(null)
    let limit = 5
    const page = Number(searchParams.get('page') || 1)

    const [totalPages, setTotalPages] = useState(0)
    
    useEffect(() => {
    //Fetch data from backend
      async function getData(){
        try {
          const url = `${config.protocol}://${config.origin}/api/mockdata?page=${page}&limit=${limit}&query=${encodeURIComponent(query)}`;
          const res = await fetch(url, {
            method:'GET',
            headers:{
              'Content-Type':'application/json',       
            },
            credentials:'include'
          })
    
          const data = await res.json()
          console.log(data)
          setUserList(data.data)
          setTotalPages(2)
          console.log(userList)
        } catch (error) {
          throw new Error('Could not get userList',error)  
        }
  
      }
  
      getData()
    }, [page,limit,query,filterIds])
    
  
 
  
  
    const prevPage = page - 1 > 0 ? page - 1 : 1

    return (
      <div>
          <div className='p-5'>
          <div>
            <h1 className="mb-2 text-xl font-semibold md:text-3xl">Identity&nbsp;Management</h1>
            <p className='text-lg opacity-70 max-sm:text-sm'>Manage identity verification and roles</p>
                </div>
                <nav className="grid grid-cols-3 py-6 px-4 bg-gray-400 text-center">
                    <Link href="/list/access/admin/?tab=current&page=1">
                    <p className={`text-lg ${tab === 'current' ? 'text-blue-600' : 'text-gray-600'}`}>Current Ids</p>
                    </Link>
                    <Link href="/list/access/admin/?tab=pending&page=1">
                    <p className={`text-lg ${tab === 'pending' ? 'text-blue-600' : 'text-gray-600'}`}>Pending Applications</p>
                    </Link>
                    <Link href="/list/access/admin/?tab=roles&page=1">
                    <p className={`text-lg ${tab === 'roles' ? 'text-blue-600' : 'text-gray-600'}`}>Identity Roles</p>
                    </Link>
                </nav>

              {tab === 'current' && (
                <div className=''>
                <PaginatedList 
                        userList={userList} 
                        page={page}
                        totalPages={totalPages}
                        prevPage={prevPage}
                        limit={limit}
                    />
                </div>
                )}
                {tab === 'pending' && (
                    <div>
                    <h2 className="text-xl">Identity Roles</h2>
                    <PaginatedList 
                        userList={userList} 
                        page={page}
                        totalPages={totalPages}
                        prevPage={prevPage}
                        limit={limit}
                    />
                    </div>
                )}
                {tab === 'roles' && (
                    <div>
                    <h2 className="text-xl">Identity Roles</h2>
                      Husseins
                    </div>
                )}
          </div>
      </div>
    )
  }