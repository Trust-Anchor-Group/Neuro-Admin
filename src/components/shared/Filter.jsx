import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useRef } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

export const  Filter = ({linkArray,isFilterAccount,absoluteClassName,size,noUrlParam,selectArray}) => {

  const searchParams = useSearchParams()
  const filtered = isFilterAccount ? searchParams.get('filter-accounts') || 'all' : searchParams.get('limit') || '50'
  const [toggle, setToggle] = useState(false)
  const [filterNames, setFilterNames] = useState('')

  const filterRef = useRef(null)

  useEffect(() => {
    if(noUrlParam){
      setFilterNames(text)
    } else {
      switch (filtered) {
        case 'all':
          setFilterNames('All')
          break;
        case 'hasID':
          setFilterNames('Active Id')
          break
          case 'noID':
            setFilterNames('No Id')
            break
            case '50':
              setFilterNames('50')
              break;
            case '25':
              setFilterNames('25')
              break
              case '10':
                setFilterNames('10')
        default:
          break;
      }
    }
  }, [filtered])

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
        <div className={`relative flex items-center py-1.5 justify-between bg-neuroGray/70 border rounded-md ${size}`}>
          <span className='ml-2 text-gray-500 '>{filterNames}</span>
          <button className='mr-2' onClick={() => setToggle(prev => !prev)}>
            {toggle === false ? <FaChevronDown color='#6e6e6e' /> : <FaChevronUp color='#6e6e6e' />}
            </button>  
          {
                     toggle && linkArray && (
                        <div className={absoluteClassName} ref={filterRef}>   
                            {
                              linkArray.map((item,index) => (
                                <Link key={index} className='transition-all border pl-2 hover:bg-neuroGray'
                                href={item?.linkHref}>{item.text}</Link>  
                              )                          
                              )
                            }                     
                        </div>
                    )
                }
                {
                  toggle && selectArray && (
                    <div className={absoluteClassName} ref={filterRef}>

                    </div>
                  )
                }
        </div>


    </div>
  )
}
