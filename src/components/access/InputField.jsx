import React from 'react'

export const InputField = ({labelText,name,profil}) => {
 

  if(profil){
    return (
      <div>
        <label className='text-md text-[var(--brand-text-secondary)] '>{labelText}</label>
        <p className='text-text16 max-sm:text-md py-3 pl-4 border
         rounded-lg border-[var(--brand-border)] w-full bg-[var(--brand-input-background)] text-[var(--brand-text-primary)] whitespace-pre-line break-words [overflow-wrap:anywhere]'>{name}</p>
      </div>
    )
  }


  return (
    <div className='grid grid-cols-1 gap-1 border-b-2 border-[var(--brand-border)] py-3 animate-fade-in md:grid-cols-[minmax(0,180px)_minmax(0,1fr)] md:gap-6'>
        <label className='text-text16 text-[var(--brand-text-secondary)]'>{labelText}:</label>
        <p className='min-w-0 text-text16 max-sm:text-md whitespace-pre-line break-words [overflow-wrap:anywhere]'>{name}</p>
    </div>
  )
}
