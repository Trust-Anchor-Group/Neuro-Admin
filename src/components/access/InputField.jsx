import React from 'react'

export const InputField = ({labelText,name,profil}) => {
 

  if(profil){
    return (
      <div>
        <label className='text-md text-[var(--brand-text-secondary)] '>{labelText}</label>
        <p className='text-text16 max-sm:text-md py-3 pl-4 border
         rounded-lg border-[var(--brand-border)] w-full bg-[var(--brand-input-background)] text-[var(--brand-text-primary)]'>{name}</p>
      </div>
    )
  }


  return (
    <div className='grid grid-cols-3 items-center justify-center border-b-2 border-[var(--brand-border)] animate-fade-in'>
        <label className='text-text16 text-[var(--brand-text-secondary)] my-2'>{labelText}:</label>
        <p className='text-text16 max-sm:text-md my-2'>{name}</p>
    </div>
  )
}
