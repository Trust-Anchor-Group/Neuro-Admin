import Link from 'next/link'
import React from 'react'

export const LinkToPage = ({hrefName,title,handleLogout,icon,setToggle}) => {



  return (
    <Link href={hrefName ? hrefName :''}
    onClick={handleLogout ? handleLogout : () => {return setTimeout(() => {
      setToggle(false)
    }, 200);}} 
    className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700'>{icon}
    <span>
    {title}
    </span>
    </Link>
  )
}
