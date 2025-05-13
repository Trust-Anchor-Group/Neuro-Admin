import React from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

export const InfoToggleButton = ({infoToggle,setIntoToggle,title}) => {
  return (
    <div>
        {
          (
          <div className={`flex justify-between ${infoToggle === true ? 'border-b-2 pb-4' :''}`} >
            <h2 className='font-semibold text-neuroDarkGray/70'>{title}</h2>
            <button onClick={() => setIntoToggle(prev => !prev)}>{infoToggle ? <FaChevronDown color='#6e6e6e' /> 
            : <FaChevronUp color='#6e6e6e' />}</button>
             </div>)
          }
    </div>
  )
}
