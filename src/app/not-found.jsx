import Link from 'next/link'
import React from 'react'
import { FaInfoCircle } from 'react-icons/fa'

const NotFound = () => {
  return (
    <div className='flex flex-col justify-center bg-neuroGray h-screen items-center'>
        <FaInfoCircle className="text-gray-400 text-4xl mb-4"/>
        <h1 className='font-bold text-5xl'>404 - Page Not Found</h1>
        <p className='my-10 text-xl'>Could not find the requested resource</p>

     
            <Link className='py-4 px-4 bg-neuroDarkGray cursor-pointer text-white font-bold border
            transition-opacity rounded-lg hover:opacity-80' href={'/neuro-access'}>
            Return to Dashboard
            </Link>
      
    </div>
  )
}

export default NotFound