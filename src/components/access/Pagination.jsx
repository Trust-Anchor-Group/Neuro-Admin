'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'




 export const Pagination = ({ page,prevPage,totalPages,limit }) => {
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab') || 'current'
    const maxCount = totalPages * limit

    const startItem = (page -1) * limit + 1
    const endItem = Math.min(page * limit, maxCount)
    //Pagination buttons.

   return (
     <div className='absolute bottom-[3vh] right-[3vw] z-50 flex gap-2 justify-between items-center'>
      <div className='flex gap-2 justify-center items-center'>
        <p>{startItem}-{endItem}</p>
        <p>of</p>
        <p>{maxCount}</p>
      </div>
      <div>
       {page === 1 ? (
        <div className='flex justify-center items-center gap-2'>
         <FiChevronsLeft className='text-gray-300' size={20} />
        <FiChevronLeft className='text-gray-300' size={20} />
        </div>
       ):
       <div className='flex justify-center items-center gap-2'>
        <Link href={`?tab=${tab}&page=1`}>
          <FiChevronsLeft className='cursor-pointer hover:opacity-70' size={20} />   
        </Link>
       <Link href={`?tab=${tab}&page=${prevPage}`}>
       <FiChevronLeft className='cursor-pointer hover:opacity-70' size={20} />
        </Link>
       </div> 
        }
      </div>
        
        <div>
        {page === totalPages ? (
      
      <div className='flex justify-center items-center gap-2'>
        <FiChevronRight className='text-gray-300' size={20} />
        <FiChevronsRight className='text-gray-300' size={20} />   
      </div>
       
        ):
        <div className='flex justify-center items-center gap-2'>
        <Link href={`?tab=${tab}&page=${page + 1}`}>
        <FiChevronRight className='cursor-pointer hover:opacity-70' size={20} />
         </Link>
         <Link href={`?tab=${tab}&page=${totalPages}`}>
            <FiChevronsRight className='cursor-pointer hover:opacity-70' size={20} />   
         </Link>
        </div> 
         }
        </div>
        <div>
        </div>
     </div>
   )
 }
