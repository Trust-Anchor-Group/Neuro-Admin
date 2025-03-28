import React from 'react'
import { FaTimes } from 'react-icons/fa'

export const Modal = ({ text, setToggle,onHandleModal}) => {




  return (
    <div className='fixed inset-0 flex justify-center items-center z-10 '>
        <div className='relative flex flex-col  bg-neuroGray p-5 rounded-lg border-2 max-md:mx-10'>
        <div>
            <span onClick={() => setToggle((prev => !prev))} className='flex justify-end text-lg'><FaTimes className='
            transition-all
             size-7 cursor-pointer hover:rounded-full hover:bg-black/50 hover:text-white' /></span>
        </div>
        <p className='text-center my-10 text-xl font-semibold'>{text}</p>
        <div className='grid grid-cols-2 gap-5'>
            <button onClick={onHandleModal} className='transition-opacity py-4 px-4 bg-neuroGreen text-white 
            font-semibold rounded-lg hover:opacity-50'>Confirm</button>
            <button className='transition-opacity py-4 px-4 bg-neuroPink text-white font-semibold rounded-lg
            hover:opacity-50' onClick={() => setToggle((prev => !prev))}>Cancel</button>
        </div>
        </div>
    </div>
  )
}
