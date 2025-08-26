import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useRef } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

export const  Filter = ({linkArray,isFilterAccount,absoluteClassName,size,selectArray}) => {

  const searchParams = useSearchParams()
  const filtered = isFilterAccount ? searchParams.get('filter') || 'all' : searchParams.get('limit') || '50'
  const [toggle, setToggle] = useState(false)
  const [filterNames, setFilterNames] = useState(selectArray?.[0]?.value || '')
  const [selectedValue, setSelectedValue] = useState()

  const filterRef = useRef(null)

  useEffect(() => {
 if(selectArray?.length > 0){
      setFilterNames(selectArray[0].label)
    } 
  else {
    switch (filtered) {
      case 'all':
        setFilterNames('All')
        break
      case 'hasID':
        setFilterNames('Has Id')
        break
      case 'noID':
        setFilterNames('No Id')
        break
      case 'all':
        setFilterNames('Show all')
        break
      case '50':
        setFilterNames('50')
        break
      case '25':
        setFilterNames('25')
        break
      case '10':
        setFilterNames('10')
        break
      default:
        // For limit filter: show a friendly label when selecting a custom value (e.g., "Show all")
        if (!isFilterAccount) {
          const n = Number(filtered)
          if (!Number.isNaN(n)) {
            // Treat any value greater than the largest preset as "Show all"
            if (n > 50) {
              setFilterNames('Show all')
            } else {
              setFilterNames(String(filtered))
            }
          }
        }
        break
    }
  }
}, [filtered, selectArray, selectedValue])
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
  
function handleSelect(value){
  setSelectedValue(value)
  setToggle(false)
}
  

  return (
    <div>
        <div className={`relative z-20 flex items-center py-1.5 justify-between bg-neuroGray/70 border rounded-md ${size}`}>
          <span className='ml-2 text-neuroTextBlack '>{filterNames}</span>
          <button className='mr-2' onClick={() => setToggle(prev => !prev)}>
            {toggle === false ? <FaChevronDown color='#6e6e6e' /> : <FaChevronUp color='#6e6e6e' />}
            </button>  
          {
                     toggle && linkArray && (
                        <div className={absoluteClassName} ref={filterRef}>   
                            {
                              linkArray.map((item,index) => (
                                <Link key={index} onClick={() => setToggle(false)} className='transition-all border pl-2 hover:bg-neuroGray'
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
                        {selectArray.map(({value,label},index)=> (
                          <button
                          onClick={() => handleSelect(value)}
                          key={index}
                          className="block w-full text-left px-2 py-1 text-lg text-neuroTextBlack hover:bg-neuroGray">
                            {label}
                          </button>
                        ))}
                    </div>
                  )
                }
        </div>


    </div>
  )
}
