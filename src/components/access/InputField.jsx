import React from 'react'
import { FaRegCopy } from 'react-icons/fa'

export const InputField = ({labelText,name}) => {
  return (
    <div className='grid grid-cols-2 items-center justify-center border-b-2'>
        <label className='text-gray-500 my-2'>{labelText}:</label>
        <p className='text-lg max-sm:text-md my-2'>{name}</p>
    </div>
  )
}
