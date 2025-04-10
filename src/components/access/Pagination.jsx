'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import { FaEllipsisH } from 'react-icons/fa'
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'




 export const Pagination = ({ page,prevPage,totalPages,limit }) => {
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab') || 'current'
    const maxCount = totalPages * limit

    const startItem = (page -1) * limit + 1
    const endItem = Math.min(page * limit, maxCount)
    //Pagination buttons.

   return (
     <div className='absolute bottom-[3vh] right-[3vw] z-50 flex gap-2 justify-between items-center max-sm:right-[10vw] max-sm:gap-0'>
      <div className='flex gap-2 justify-center items-center'>
      {page === 1 ? (
        <div className='flex justify-center items-center gap-2'>
         {/* <FiChevronsLeft className='text-gray-300 hidden md:block' size={20} /> */}
        <FiChevronLeft className='text-gray-300' size={20} />
        </div>
       ):
       <div className='flex justify-center items-center gap-2'>
        <Link href={`?tab=${tab}&page=1`}>
          {/* <FiChevronsLeft className='cursor-pointer hidden hover:opacity-70 md:block' size={20} />    */}
        </Link>
       <Link href={`?tab=${tab}&page=${prevPage}`}>
       <FiChevronLeft className='cursor-pointer hover:opacity-70' size={20} />
        </Link>
       </div> 
        }
          {/*  */}
        <div className='flex items-center gap-2'>
          <div className='flex items-center'>
            { page != 1 &&
            <>
            <Link className='p-2
         transition-all hover:bg-neuroPurpleLight hover:text-neuroPurpleDark' href={'?tab=${tab}&page=1'}>1</Link>
        <div className='flex gap-[2px] text-gray-500 max-sm:hidden'>
             <span>•</span>
              <span>•</span>
              <span>•</span>
        </div>
            </> 
            }
          </div>
        <p className='bg-neuroPurpleLight text-neuroPurpleDark p-2 '>
          {page}
        </p>
        <Link className='p-2
         transition-all hover:bg-neuroPurpleLight hover:text-neuroPurpleDark'
          href={`?tab=${tab}&page=${page + 1}`}>{page + 1}</Link>
        <Link className='p-2
         transition-all hover:bg-neuroPurpleLight hover:text-neuroPurpleDark'
          href={`?tab=${tab}&page=${page + 2}`}>{page + 2}</Link>
        </div>
               {/* Ikon */}
          <div className='flex gap-[2px] text-gray-500 max-sm:hidden'>
             <span>•</span>
              <span>•</span>
              <span>•</span>
        </div>
        <Link className='p-2
         transition-all hover:bg-neuroPurpleLight hover:text-neuroPurpleDark
         ' href={`?tab=${tab}&page=${totalPages}`}>
          <p>{maxCount}</p>
        </Link>
      </div>
      <div>
 
      </div>
        
        <div>
        {page === totalPages ? (
      
      <div className='flex justify-center items-center gap-2'>
        <FiChevronRight className='text-gray-300' size={20} />
        {/* <FiChevronsRight className='text-gray-300 hidden md:block' size={20} />    */}
      </div>
       
        ):
        <div className='flex justify-center items-center gap-2'>
        <Link href={`?tab=${tab}&page=${page + 1}`}>
        <FiChevronRight className='cursor-pointer hover:opacity-70' size={20} />
         </Link>
         <Link href={`?tab=${tab}&page=${totalPages}`}>
            {/* <FiChevronsRight className='hidden cursor-pointer hover:opacity-70 md:block' size={20} />    */}
         </Link>
        </div> 
         }
        </div>
        <div>
        </div>
     </div>
   )
 }
