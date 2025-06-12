import Link from 'next/link'
import React from 'react'
import { FaInfoCircle } from 'react-icons/fa'

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-center p-8">
      
      <div className="relative mb-4">
        <h1 className="text-9xl font-bold text-gray-300 select-none">404</h1>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        404 - Page Not Found.
      </h2>
      <p className="text-gray-600 mb-8 max-w-md">
       Could not find the requested resource
      </p>

      <Link
        href="/neuro-access"
        className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-md text-lg transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  )
}

export default NotFound