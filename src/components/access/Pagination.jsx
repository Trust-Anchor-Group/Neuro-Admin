'use client'
import Link from 'next/link'
import React from 'react'



 export const Pagination = ({page,prevPage,totalPages}) => {

    //Pagination buttons.

   return (
     <div className='flex justify-between items-center'>
       {page === 1 ? (
        <button className='px-6 py-4 rounded-lg 
        font-medium shadow-md transition-all bg-neuroDarkGray text-neuroGray opacity-70' aria-disabled='true'>Previous</button>
       ): <Link href={`?page=${prevPage}`}><button className='px-6 py-4 rounded-lg 
        font-medium shadow-md transition-all bg-neuroDarkGray text-neuroGray hover:opacity-70 max-sm:ml-5' aria-label='Previous Page'>Previous</button></Link>}
        
        {page === totalPages ? (
          <button className='px-6 py-4 rounded-lg 
          font-medium shadow-md transition-all bg-neuroDarkGray
           text-neuroGray opacity-70' aria-disabled='true'>Next</button>
        ): <Link href={`?page=${page + 1}`}><button className='px-6 py-4 rounded-lg 
        font-medium shadow-md transition-all bg-neuroDarkGray
         text-neuroGray hover:opacity-70 max-sm:mr-5' aria-label='Next Page'>Next</button></Link>}
     </div>
   )
 }
