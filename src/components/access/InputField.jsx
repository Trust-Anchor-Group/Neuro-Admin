import React from 'react'

export const InputField = ({labelText,name}) => {
  return (
    <div>
        <label className='text-gray-500'>{labelText}</label>
        <p className='text-lg max-sm:text-md'>{name}</p>
    </div>
  )
}
