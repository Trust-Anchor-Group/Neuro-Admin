'use client'
import { AccountDetails, DisplayDetails } from '@/components/access/Buttons/DisplayDetails'
import { CreateUserData } from '@/components/shared/CreateUserData'
import config from '@/config/config'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { FaSpinner } from 'react-icons/fa'
import { Identity } from '@/components/access/Identity'

const ProfilePage = () => {

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const isFetchingRef = useRef()

    async function getData(id) {
      try {
        setLoading(true)
        if(isFetchingRef.current) return
        isFetchingRef.current = true

          const url = `${config.protocol}://${config.origin}/api/legalIdentity`;
          const res = await fetch(url, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({  legalIdentity: id })
          })
          
          if (!res.ok) {
              const errorText = await res.text()
              console.error('Fetch error details:', errorText)
              throw new Error('Failed to fetch user')
          }
          
          const data = await res.json()
          console.log('New ID, Profile Page',data)
      
          setUser(data.data)
          console.log(user)

      } catch (error) {
          console.error('Error fetching user:', error)
          setUser(undefined) 
      } finally {
          setLoading(false) 
          isFetchingRef.current = false
      }
  }

     useEffect(() => {
      const storedUser = sessionStorage.getItem("neuroUser");
      console.log('stored User ID',storedUser)
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
       getData(parsedUser.legalId)
      }
    }, []);

    const fieldsToShowIdentity = [
      { label: "First Name", key: "properties.LAST" },
      { label: "Nationality", key: "properties.COUNTRY" },
      { label: "Address", key: "properties.ADDR" },
      { label: "Date of birth", key: "properties.PNR" },
      { label: "Phone", key: "properties.PHONE" },
      
    ];

    const fieldsToShow = [
      { label: "First Name", key: "properties.LAST" },
      { label: "Nationality", key: "properties.COUNTRY" },
      { label: "Address", key: "properties.ADDR" },
      { label: "Date of birth", key: "properties.PNR" },
      { label: "Phone", key: "properties.PHONE" },
    ]

    function onSubmitHandler(){

    }

  return (
    <div className='relative grid grid-cols-2 gap-5 p-5'>
      <div className=''>
      <Identity user={user} fieldsToShow={fieldsToShowIdentity} onSubmitHandler={onSubmitHandler}
          />
      </div>
             {loading && (
                  <div className="absolute inset-0 bg-white/50  flex items-center justify-center z-50">
                    <FaSpinner className="animate-spin text-4xl text-gray-500" />
                  </div>
        )}
           <div className='flex flex-col  bg-white border-2 rounded-xl p-5 gap-3 max-sm:flex-col max-sm:mt-5'>
            <div className='bg-neuroGray/70 rounded-xl p-5 overflow-auto'>
             
            </div>
             </div>
    </div>
  )
}

export default ProfilePage