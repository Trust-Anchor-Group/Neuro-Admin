import React from 'react'
import { useState } from 'react'
import { FaPen } from 'react-icons/fa'

export const PopUpButton = ({title,setToggle}) => {

  return (
    <div className='grid mt-5 grid-cols-2'>
      <button onClick={() => setToggle(prev => !prev)} className='col-start-2 shadow-sm col-end-4 bg-neuroPurpleLight text-neuroPurpleDark py-1 flex justify-center items-center
      font-semibold gap-2
        rounded-lg cursor-pointer transition-opacity hover:opacity-70'>{title}</button>
    </div>
  )
}
