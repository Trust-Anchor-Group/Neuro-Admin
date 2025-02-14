'use client'
import { PaginatedList } from '@/components/access/PaginatedList'
import { Pagination } from '@/components/access/Pagination';
import SearchBar from '@/components/SearchBar';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const AccessPage = () => {


  const searchParams = useSearchParams()  //Check the page number in the url

  const page = Number(searchParams.get('page') || 1)
  let limit = 5
  const query = searchParams.get('query') || ''
  const [userList, setUserList] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  
  useEffect(() => {
    async function getData(){

      try {
        const res = await fetch(`http://localhost:3000/api/mockdata?page=${page}&limit=${limit}&query=${encodeURIComponent(query)}`, {
          method:'GET',
          headers:{
            'Content-Type':'application/json',       
          },
          credentials:'include'
        })
  
        const data = await res.json()
        console.log(data)
        setUserList(data.data)
        setTotalPages(data.totalPages)
        console.log(userList)
      } catch (error) {
        throw new Error('Could not get userList',error)  
      }

    }

    getData()
  }, [page,limit,query])
  

  //Fetch data from backend


  const prevPage = page - 1 > 0 ? page - 1 : 1
  
  return (
    <div>
        <div className='flex justify-center items-center h-screen my-10'>
          <div className='flex flex-col gap-3'>
            <SearchBar placeholder={'Search...'} classNameText={'w-full border-2 rounded-md py-3 pl-10 text-sm'}/>
            <PaginatedList userList={userList}/>
            <Pagination page={page} prevPage={prevPage} totalPages={totalPages}/>
          </div>
        </div>
    </div>
  )
}

export default AccessPage