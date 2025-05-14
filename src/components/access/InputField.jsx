'use client'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { FaRegCopy } from 'react-icons/fa'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css';

export const InputField = ({labelText,name,profil,phoneInput,editAble,value,onChange,setForm}) => {
 
  const [phone, setPhone] = useState('')



  useEffect(() => {
    setPhone(phoneInput)
  }, [phoneInput])
  
  if(editAble){
    return (
        <div>
        <label className='text-md text-neuroTextBlack/65 font-semibold'>{labelText}</label>
        <input type='text' className='text-text16 max-sm:text-md py-3 my-2 pl-4 font-semibold border
         rounded-lg w-full bg-neuroInputBackground text-neuroTextBlack/65' value={value} onChange={e => onChange(e.target.value)}/>
      </div>
    )
  }


  if(profil){
    return (
      <div>
        <label className='text-md text-neuroTextBlack/65 font-semibold'>{labelText}</label>
        <p className='text-text16 max-sm:text-md py-3 my-2 pl-4 font-semibold border
         rounded-lg w-full bg-neuroInputBackground text-neuroTextBlack/65'>{name}</p>
      </div>
    )
  }

  if(phoneInput){
    return (
      <div>
    <label className="text-md text-neuroTextBlack/65 font-semibold b-4">Phone number</label>
      <PhoneInput
        className='bg-neuroInputBackground text-neuroTextBlack/65'
        country={'se'}
        value={value}
        onChange={(e) => onChange(e)}
        enableSearch
        buttonClass='!bg-neuroInputBackground'
        inputClass="!w-full !bg-neuroInputBackground !text-neuroTextBlack/65 !font-semibold "
        containerClass="!w-full !bg-neuroInputBackground !text-neuroTextBlack/65 !font-semibold "
      />
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 items-center justify-center border-b-2 animate-fade-in'>
        <label className='text-text16 text-neuroTextBlack/65 my-2'>{labelText}:</label>
        <p className='text-text16 max-sm:text-md my-2'>{name}</p>
    </div>
  )
}
