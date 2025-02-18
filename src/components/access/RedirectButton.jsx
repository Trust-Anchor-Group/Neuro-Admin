'use client'
import Link from 'next/link'
import React, {  useState, } from 'react'
import { FaBars, FaUser, FaUserCog } from 'react-icons/fa'
import { ImCross } from 'react-icons/im'
import { HiDotsHorizontal } from "react-icons/hi"

export const RedirectButton = ({ hrefText, classText, hamburgMeny,userId,buttonName }) => {
 //Send id and a href to redirect to another page
 //If using a hamburgMeny, write hambrugMeny = true. 
 //You can use this component just as a button to just redirect back(without id)

  const [toggle, setToggle] = useState(false)
  
  function handleToggle() {
    setToggle((prev) => !prev)
  }

  return (
    <>
      {hamburgMeny ? (
        <div className="relative">
          {
            toggle ? 
            <HiDotsHorizontal className='' /> :
            <FaBars
              onClick={handleToggle}
              className={`cursor-pointer text-2xl`}
            /> 
          }
          {toggle && (
            <div
              className="absolute top-8 right-0 w-48 bg-white border-2 rounded-lg shadow-lg z-10 pt-4 animate-fade-in"
            >
              <ImCross
                onClick={handleToggle}
                className="absolute top-2 right-2 text-xl cursor-pointer text-gray-500 hover:text-black"
              />
              <div className="flex flex-col gap-2 mt-6">
                <button
                onClick={() => console.log('hej')}
                  className="p-2 text-sm text-left text-gray-700 hover:bg-gray-100 hover:text-black rounded-md transition"
                >
                  <div className='flex items-center gap-5'>
                    <FaUserCog className='text-lg'/>
                    <p>Manage User</p>
                  </div>
                </button>
                <button
                  className="p-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black rounded-md transition"
                >
                  <Link href={`/list/access/detailpage/${userId}`}>
                  <div className='flex items-center gap-5'>
                    <FaUser className='text-lg'/>
                    <p>
                    See User Profile
                    </p>
                  </div>
                  
                  </Link>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link href={hrefText}>
          <button className={classText}>{buttonName}</button>
        </Link>
      )}
    </>
  )
}
