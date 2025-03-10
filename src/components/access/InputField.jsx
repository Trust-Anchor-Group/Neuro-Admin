import React from 'react'

export const InputField = ({labelText,name}) => {
  return (
    <div>
        <label className='text-gray-500'>{labelText}</label>
        <p className='text-lg'>{name}</p>
    </div>
  )
}
