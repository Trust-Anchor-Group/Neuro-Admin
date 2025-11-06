'use client'
import React, { useEffect, useRef, useState } from 'react'
import { FaSpinner } from 'react-icons/fa'
import { Identity } from '@/components/access/Identity'
import { LocalizationSettings } from '@/components/access/LocalizationSettings'
import { InputField } from '@/components/access/InputField'
import { ProfileEditModal } from '@/components/access/ProfileEditModal'
import { useLanguage } from '../../../context/LanguageContext'
import { fetchUserImage } from '@/utils/fetchUserImage'

const ProfileContent = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modalToggle, setModalToggle] = useState(false)
  const [modalToggleClient, setModalToggleClient] = useState(false)
  const { language, content } = useLanguage()
  const t = content?.[language]?.profilePage || {}

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('profile')
    if (storedProfile) {
      const data = JSON.parse(storedProfile)
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

  // Dynamically generate fields to show for identity from user.properties
  const fieldsToShowIdentity = user?.properties
    ? Object.keys(user.properties).map(key => ({
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        key: `properties.${key}`,
      }))
    : [];

  const fieldsToShowMetadata = [
    { label: ti.idStatus || 'ID status', key: 'state' },
    { label: ti.idCreated || 'ID created', key: 'created' },
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

      <aside aria-label="System Settings" className='flex flex-col bg-[var(--brand-navbar)] border-2 border-[var(--brand-border)] rounded-xl p-5 gap-3 max-sm:mt-5'>
        <header>
          <h2 className='text-text26 font-semibold'>{t.systemTitle || 'System'}</h2>
        </header>

        <section className='bg-[var(--brand-background)] rounded-xl p-5 overflow-auto'>
          <InputField labelText={t.languageLabel || 'Language'} name={t.languageValueEnglish || 'English'} />
          <LocalizationSettings />
          <InputField labelText={t.defaultThemeLabel || 'Default theme'} name={t.defaultThemeTimed || 'Timed'} />

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