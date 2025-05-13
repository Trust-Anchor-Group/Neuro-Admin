import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useRef } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

export const LimitFilter = () => {

  const searchParams = useSearchParams()
  const limitFilter = searchParams.get('limit') || '50'
  const [toggle, setToggle] = useState(false)
  const [filterNames, setFilterNames] = useState('')

  const filterRef = useRef(null)

  useEffect(() => {
    switch (limitFilter) {
      case 'all':
        setFilterNames('All')
        break;
      case 'hasID':
        setFilterNames('Active Id')
        break
        case 'noID':
          setFilterNames('No Id')
      default:
        break;
    }
  }, [limitFilter])

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
                             href={'/neuro-access/account?filter-accounts=all'}>All</Link>                          
                            <Link className='transition-all border pl-2 hover:bg-neuroGray' 
                             href={'/neuro-access/account?filter-accounts=hasID'}>Active Id</Link>                       
                            <Link className='transition-all border pl-2 hover:bg-neuroGray'  
                            href={'/neuro-access/account?filter-accounts=noID'}>No Id</Link>                       
                        </div>
                    )
                }
        </div>


    </div>
  )
}
