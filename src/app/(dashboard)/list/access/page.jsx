'use server'
import { getUserList } from '@/app/utils/getUserList';
import { PaginatedList } from '@/components/access/PaginatedList'
import { Pagination } from '@/components/access/Pagination';
import SearchBar from '@/components/SearchBar';
import React from 'react'

const AccessPage = async ({searchParams}) => {

  //Check the page number in the url
  let page = parseInt((await searchParams)?.page || '1', 10)
  page = !page || page < 1 ? 1 : page
  
  const limit = 5
  
  const query = (await searchParams)?.query || ''


  //Fetch data from backend
  const { data:userList,totalPages } = await getUserList(page,limit,query)
  console.log(userList)
  const prevPage = page - 1 > 0 ? page - 1 : 1
  
  return (
    <div>
        <div className='flex justify-center items-center h-screen my-10'>
          <div className='flex flex-col gap-3'>
            <SearchBar placeholder={'Search...'} classNameText={'w-full border-2 rounded-md py-3 pl-10 text-sm'}/>
            <PaginatedList userList={userList} />
            <Pagination page={page} prevPage={prevPage} totalPages={totalPages}/>
          </div>
        </div>
    </div>
  )
}

export default AccessPage