import React from 'react'

export const InputField = ({labelText,name,profil}) => {
 

  if(profil){
    return (
      <div>
        <label className='text-md text-neuroTextBlack/60 font-semibold'>{labelText}</label>
        <p className='text-text16 max-sm:text-md py-3 pl-4 font-semibold border
         rounded-lg w-full bg-neuroInputBackground text-neuroTextBlack/60'>{name}</p>
      </div>
    )
  }


  return (
    <div className='grid grid-cols-3 items-center justify-center border-b-2 animate-fade-in'>
        <label className='text-text16 text-neuroTextBlack/60 my-2'>{labelText}:</label>
        <p className='text-text16 max-sm:text-md my-2'>{name}</p>
    </div>
  )
}
