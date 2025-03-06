import { PaginatedList } from '@/components/access/PaginatedList'
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import config from '@/config/config';
import SearchBar from '../SearchBar';



export const AccessContet = () => {
    const searchParams = useSearchParams()  //Check the page number in the url

    const query = searchParams.get('query') || ''
    const filterIds = searchParams.get('filterIds') || ''

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
            <div className=''>
              <PaginatedList 
                    userList={userList} 
                    page={page}
                    totalPages={totalPages}
                    prevPage={prevPage}
                    limit={limit}
                />
            </div>
          </div>
      </div>
    )
  }