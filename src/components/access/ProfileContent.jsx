'use client'
import React, { useEffect, useRef, useState } from 'react'
import { FaSpinner } from 'react-icons/fa'
import { Identity } from '@/components/access/Identity'
import { LocalizationSettings } from '@/components/access/LocalizationSettings'
import { InputField } from '@/components/access/InputField'
import { ProfileEditModal } from '@/components/access/ProfileEditModal'
import { fetchUserImage } from '@/utils/fetchUserImage'

const ProfileContent = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modalToggle, setModalToggle] = useState(false)
  const [modalToggleClient, setModalToggleClient] = useState(false)

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('profile')
    if (storedProfile) {
      const data = JSON.parse(storedProfile)
      console.log('Klientdata', data)
      fetchUserImage(data?.Attachments[0].Id).then((imageUrl) => {
        if(imageUrl){
         
           const filterData = {
                Id:data.Id,
                created:data.Created,
                imageUrl:{imageUrl},
                properties:{
                 COUNTRY:data.Properties.COUNTRY,
                 EMAIL:data.Properties.EMAIL,
                 PHONE:data.Properties.PHONE,
                 CITY:data.Properties.CITY,
                 FIRST:data.Properties.FIRST,
                 LAST:data.Properties.LAST,
                 PNR:data.Properties.PNR,
                 ADDR:data.Properties.ADDR   
                },
                state:data.State
            }
      setUser(filterData)
        }else{
          throw new Error('Could not get the Image')
        }
      })

 
    }
  }, [])

  const fieldsToShowIdentity = [
    { label: "First Name", key: "properties.FIRST" },
    { label: "Nationality", key: "properties.COUNTRY" },
    { label: "Address", key: "properties.ADDR" },
    { label: "Date of birth", key: "properties.PNR" },
    { label: "Phone", key: "properties.PHONE" },
  ]

  const fieldsToShowMetadata = [
    { label: "ID status", key: "state" },
    { label: "ID created", key: "created" },
  ]

  return (
    <main className='relative grid grid-cols-2 gap-5 p-5 max-md:grid-cols-1'>
      
      <section aria-label="User Identity">
        <article>
          <Identity
            user={user}
            fieldsToShow={fieldsToShowIdentity}
            modalToggle={modalToggle}
            setModalToggle={setModalToggle}
            fieldsToShowMetaData={fieldsToShowMetadata}
          />
        </article>
      </section>

      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50" aria-live="polite" aria-busy="true">
          <FaSpinner className="animate-spin text-4xl text-gray-500" />
        </div>
      )}

      <aside aria-label="System Settings" className='flex flex-col bg-white border-2 rounded-xl p-5 gap-3 max-sm:mt-5'>
        <header>
          <h2 className='text-text26 font-semibold'>System</h2>
        </header>

        <section className='bg-neuroGray/70 rounded-xl p-5 overflow-auto'>
          <InputField labelText={'Language'} name={'English'} />
          <LocalizationSettings />
          <InputField labelText={'Default theme'} name={'Timed'} />

          {modalToggleClient && user && (
            <ProfileEditModal
              setModalToggle={setModalToggleClient}
              isEditProfile={false}
            />
          )}
        </section>
      </aside>
    </main>
  )
}

export default ProfileContent
