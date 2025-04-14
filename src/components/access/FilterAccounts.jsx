import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useRef } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

export const FilterAccounts = () => {

  const searchParams = useSearchParams()
  const filterAccount = searchParams.get('filter-accounts') || 'all'
  const [toggle, setToggle] = useState(false)
  const [filterNames, setFilterNames] = useState('')

  const filterRef = useRef(null)

  useEffect(() => {
    switch (filterAccount) {
      case 'all':
        setFilterNames('All')
        break;
      case 'hasID':
        setFilterNames('Has ID')
        break
        case 'noID':
          setFilterNames('No ID')
      default:
        break;
    }
  }, [filterAccount])

  useEffect(() => {
    
    const handleClickOutSide = (e) => {
      if(filterRef.current && !filterRef.current.contains(e.target)){
        setToggle(false)
      }
    }

    document.addEventListener('mousedown',handleClickOutSide)

    return () => {
      document.removeEventListener('mousedown',handleClickOutSide)
    }

  }, [])
  
  

  return (
    <div>
        <div className='relative flex items-center py-1.5 justify-between bg-neuroGray/70 border rounded-md w-[170px] '>
          <span className='ml-2 text-gray-500 '>{filterNames}</span>
          <button className='mr-2' onClick={() => setToggle(prev => !prev)}>
            {toggle === false ? <FaChevronDown color='#6e6e6e' /> : <FaChevronUp color='#6e6e6e' />}
            </button>  
          {
                     toggle && (
                        <div className='absolute top-9 left-0 z-10 flex bg-white flex-col w-full cursor-pointer' ref={filterRef}>   
                            <Link className='transition-all border pl-2 hover:bg-neuroGray'
                             href={'/list/access/?filter-accounts=all'}>All</Link>                          
                            <Link className='transition-all border pl-2 hover:bg-neuroGray' 
                             href={'/list/access/?filter-accounts=hasID'}>Has ID</Link>                       
                            <Link className='transition-all border pl-2 hover:bg-neuroGray'  
                            href={'/list/access/?filter-accounts=noID'}>No ID</Link>                       
                        </div>
                    )
                }
        </div>


    </div>
  )
}
