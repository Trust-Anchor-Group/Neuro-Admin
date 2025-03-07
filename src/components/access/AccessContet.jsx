import { PaginatedList } from '@/components/access/PaginatedList'
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import config from '@/config/config';
import Link from 'next/link';
import { FiUserPlus } from 'react-icons/fi';
import { userColoumnsAccount,customCellAcountTable,accountActions } from './accountTableList.js'


export const AccessContet = () => {
    const searchParams = useSearchParams()  //Check the page number in the url

    const query = searchParams.get('query') || ''

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
    }, [page,limit,query])
    
  
 
  
  
    const prevPage = page - 1 > 0 ? page - 1 : 1

    return (
      <div>
          <div className='p-5'>
            <div className='flex justify-between items-center'>
              <div>
                      <h1 className="mb-2 text-xl font-semibold md:text-3xl">Legal&nbsp;Identities</h1>
                      <p className='text-lg opacity-70 max-sm:text-sm'>Manage user accounts and permissions</p>
                  </div>
                  <div className=''>
                      <button className='flex cursor-pointer
                      items-center justify-center gap-2 py-3 px-3
                        bg-neuroBlue text-white text-lg rounded-lg transition-all 
                        hover:bg-neuroBlue/70 max-sm:text-sm'><FiUserPlus className=''/>Add&nbsp;user</button>
                  </div>
            </div>
            <div className=''>
              <PaginatedList 
                    userList={userList} 
                    page={page}
                    totalPages={totalPages}
                    prevPage={prevPage}
                    limit={limit}
                    userColoumns={userColoumnsAccount}
                    customCellRenderers={customCellAcountTable}
                    renderRowActions={accountActions}
                />
            </div>
          </div>
      </div>
    )
  }