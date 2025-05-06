'use client'
import { AccountDetails } from '@/components/shared/AccountDetails'
import { CreateUserData } from '@/components/shared/CreateUserData'
import config from '@/config/config'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { FaSpinner } from 'react-icons/fa'

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
      
          setUser(data)
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

    const fieldsToShow = [
      { label: "Full name", key: "name" },
      { label: "Account", key: "account" },
      { label: "Email", key: "email" },
      { label: "Phone", key: "phone" },
      { label: "Location", key: "country" },
      { label: "Created", key: "created" }
    ];
  
    // Logga fieldsToShow för att kontrollera om strukturen är korrekt



  return (
    <div className='relative grid grid-cols-4 gap-5 p-5'>
      <div className='col-span-3'>

        <AccountDetails 
          fieldsToShow={fieldsToShow}
          userData={CreateUserData(user)}/>
      </div>
             {loading && (
                  <div className="absolute inset-0 bg-white/50  flex items-center justify-center z-50">
                    <FaSpinner className="animate-spin text-4xl text-gray-500" />
                  </div>
        )}
           <div className='flex flex-col  bg-white border-2 rounded-xl p-5 gap-3 max-sm:flex-col max-sm:mt-5'>
                    {
                      user && (
                        <div className='flex justify-end'>
                          <span>{user.data.state}</span>
                        </div>
                      )
                    }
                    {
                    user && user?.data?.attachments?.length === 0 ?
                      <div className='rounded-xl overflow-hidden'>
                        <Image
                         className='w-full h-full object-cover'
                         src={`https://res.cloudinary.com/drkty7j9v/image/upload/v1737114626/profil-ezgif.com-avif-to-jpg-converter_jkimmv.jpg`}
                         width={1200}
                         height={1200}
                        alt='Profile'
                        />
                       </div>:               
                        <div className='w-full h-[200px] rounded-md overflow-hidden'>
                           <Image
                           className='w-full h-full object-cover'
                            src={`data:image/png;base64,${user?.data?.attachments[0]?.data}`}
                            width={1200}
                            height={1200}
                            alt='Profile'
                               />
                         </div>
                       }
             </div>
    </div>
  )
}

export default ProfilePage