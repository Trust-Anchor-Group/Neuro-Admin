'use client'

import Link from 'next/link'

export default function Custom403() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-center p-8">
      
      <div className="relative mb-4">
        <h1 className="text-9xl font-bold text-gray-300 select-none">403</h1>
        <svg
          className="absolute top-1/2 left-1/2 w-12 h-12 fill-purple-600 transform -translate-x-1/2 -translate-y-1/2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          aria-hidden="true"
        >
          <path d="M336 64c-88.22 0-160 71.78-160 160…"/>
        </svg>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        No authorization found.
      </h2>
      <p className="text-gray-600 mb-8 max-w-md">
        This page is not publicly available.
      </p>

      <Link
        href="/"
        className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-md text-lg transition-colors"
      >
        RETURN HOME
      </Link>
    </div>
  )
}
