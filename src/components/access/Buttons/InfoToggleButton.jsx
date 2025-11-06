import React from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

export const InfoToggleButton = ({infoToggle,setIntoToggle,title}) => {
  return (
    <div>
        {
          (
          <div className={`flex justify-between ${infoToggle === true ? 'border-b-2 border-[var(--brand-border)] pb-4' :''}`} >
            <h2 className='font-semibold text-[var(--brand-text-secondary)] text-[14px]'>{title}</h2>
            <button onClick={() => setIntoToggle(prev => !prev)}>{infoToggle ? <FaChevronUp color='var(--brand-text-secondary)' /> 
              : <FaChevronDown color='var(--brand-text-secondary)' />}</button>
             </div>)
          }
    </div>
  )
}
