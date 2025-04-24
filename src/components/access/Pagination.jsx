'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export const Pagination = ({ page, prevPage, totalPages, limit }) => {
  const searchParams = useSearchParams()
  const maxCount = totalPages * limit

  const buildPaginationURL = (newPage) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page',newPage.toString())
    return `?${params.toString()}`
  }

  return (
    <div className='absolute bottom-[3vh] right-[3vw] z-50 flex gap-2 justify-between items-center max-sm:right-[6vw] max-sm:bottom-[2.4vh] max-sm:gap-0'>
      <div className='flex gap-2 justify-center items-center'>
        {page === 1 ? (
          <div className='flex justify-center items-center gap-2'>
            <FiChevronLeft className='text-gray-300' size={20} />
          </div>
        ) : (
          <div className='flex justify-center items-center gap-2'>
            <Link href={buildPaginationURL(prevPage)}>
              <FiChevronLeft className='cursor-pointer hover:opacity-70' size={20} />
            </Link>
          </div>
        )}

        <div className='flex items-center gap-2'>
          {page !== 1 && (
            <>
              <Link
                className='p-3   transition-all hover:bg-neuroPurpleLight hover:text-neuroPurpleDark'
                href={buildPaginationURL(1)}
              >
                1
              </Link>
              <div className='flex gap-[2px] text-gray-500 max-sm:hidden'>
                <span>•</span>
                <span>•</span>
                <span>•</span>
              </div>
            </>
          )}

          <p className='bg-neuroPurpleLight text-neuroPurpleDark  p-3'>{page}</p>

          {(page + 1 <= totalPages) && (
            <Link
              className='p-3 transition-all hover:bg-neuroPurpleLight hover:text-neuroPurpleDark'
              href={buildPaginationURL(page + 1)}
            >
              {page + 1}
            </Link>
          )}

          {(page + 2 <= totalPages) && (
            <Link
              className='p-3 transition-all hover:bg-neuroPurpleLight hover:text-neuroPurpleDark'
              href={buildPaginationURL(page + 2)}
            >
              {page + 2}
            </Link>
          )}
        </div>

        <div className='flex gap-[2px] text-gray-500 max-sm:hidden'>
          <span>•</span>
          <span>•</span>
          <span>•</span>
        </div>

        <Link
          className='p-3 transition-all hover:bg-neuroPurpleLight hover:text-neuroPurpleDark'
          href={buildPaginationURL(totalPages)}
        >
          <p>{maxCount}</p>
        </Link>
      </div>

      <div>
        {page === totalPages ? (
          <div className='flex justify-center items-center gap-2'>
            <FiChevronRight className='text-gray-300' size={20} />
          </div>
        ) : (
          <div className='flex justify-center items-center gap-2'>
            <Link href={buildPaginationURL(page + 1)}>
              <FiChevronRight className='cursor-pointer hover:opacity-70' size={20} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
