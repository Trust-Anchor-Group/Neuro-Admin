import React, { useEffect, useRef } from 'react'
import { FaSpinner, FaTimes } from 'react-icons/fa'

export const Modal = ({ text:{textState,textVerifiedEmail}, setToggle,onHandleModal,loading}) => {

  return (
    <div className='fixed inset-0 flex justify-center items-center z-50 '>
        <div className='relative flex flex-col  bg-neuroGray p-5 rounded-lg border-2 max-md:mx-10'>
          {loading ? <div className="absolute inset-1 flex items-center justify-center z-50">
                                  <FaSpinner className="animate-spin text-4xl text-gray-500" />
                                </div> :''}
        <div>
            <span onClick={() => setToggle((prev => !prev))} className='flex justify-end text-lg'><FaTimes className='
            transition-all
             size-7 cursor-pointer hover:rounded-full hover:bg-black/50 hover:text-white' /></span>
        </div>
        <p className='text-center mb-2 mt-5 text-xl font-semibold'>{textState}</p>
        <p className='text-center text-lg mb-5 font-semibold'>{textVerifiedEmail}</p>
        <div className='flex justify-center items-center gap-5'>
            <button onClick={onHandleModal} className='transition-opacity py-2 px-4 bg-activeGreen/20 text-activeGreen
            font-semibold rounded-lg hover:opacity-50'>Confirm</button>
            <button className='transition-opacity py-2 px-4 text-obsoletedRed bg-neuroRed/20 font-semibold rounded-lg
            hover:opacity-50' onClick={() => setToggle((prev => !prev))}>Cancel</button>
        </div>
        </div>
    </div>
  )
}
