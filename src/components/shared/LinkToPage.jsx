import Link from 'next/link'
import React from 'react'

export const LinkToPage = ({hrefName,title,handleLogout,icon}) => {



  return (
    <Link href={hrefName ? hrefName :''}
    onClick={handleLogout} 
    className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700'>{icon}
    <span>
    {title}
    </span>
    </Link>
  )
}
