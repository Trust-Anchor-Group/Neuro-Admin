import React from 'react'
import { ImageComponent } from './ImageComponent'
import { InputField } from './InputField'
import { Filter } from '../shared/Filter'
import { useLanguage } from '../../../context/LanguageContext'

export const ProfileEditModal = ({ user, setModalToggle, isEditProfile }) => {
  const { language, content } = useLanguage()
  const t = content?.[language]?.profileEditModal || {}
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Edit profile modal">
      <section className="bg-[var(--brand-navbar)] p-6 rounded-lg shadow-lg w-[512px] max-h-[90vh] overflow-y-auto">

        <header className='flex justify-between border-b-2 border-[var(--brand-border)] pb-3'>
          <h2 className='text-xl font-semibold'>
            {isEditProfile ? (t.editPersonal || 'Edit personal information') : (t.editClient || 'Edit client information')}
          </h2>
        </header>

        {isEditProfile ? (
          <form className='mt-5' aria-label="Personal information form">
            <fieldset className='mb-4'>
              <legend className='text-[var(--brand-text)]'>{t.profilePageLegend || 'Profile Page'}</legend>

              <div className='flex justify-center'>
                <ImageComponent user={user} />
              </div>

              <div className='flex flex-col gap-3 border-b-2 border-[var(--brand-border)] pb-3 mt-3'>
                <div className='grid grid-cols-2 mt-5 gap-5 text-[var(--brand-text-color)]'>
                  <InputField labelText={t.firstName || 'First name'} name={user.properties.FIRST} profil={true} />
                  <InputField labelText={t.lastName || 'Last name'} name={user.properties.LAST} profil={true} />
                </div>
                <InputField labelText={t.nationality || 'Nationality'} name={user.properties.COUNTRY} profil={true} />
                <InputField labelText={t.personalNumber || 'Personal number'} name={user.properties.PNR} profil={true} />
                <InputField
                  labelText={t.email || 'Email'}
                  name={user.properties.EMAIL}
                  profil={true}
                />
                <InputField labelText={t.phoneNumber || 'Phone number'} name={user.properties.PHONE} profil={true} />
              </div>
            </fieldset>

            <footer className='grid grid-cols-2 gap-3 mt-5'>
              <button
                type="button"
                onClick={() => setModalToggle(false)}
                className='bg-neuroRed/20 w-full text-obsoletedRed rounded-lg cursor-pointer py-1 transition-opacity font-semibold hover:opacity-70'
                aria-label='Cancel edit'>
                {t.cancel || 'Cancel'}
              </button>
            </footer>
          </form>
        ) : (
          <form aria-label="Client settings form" className='mt-5'>
            <fieldset className='flex flex-col gap-5'>
              <legend className='sr-only'>{t.clientSettingsLegend || 'Client settings'}</legend>
              <label className='text-neuroTextBlack/60'>{t.language || 'Language'}</label>
              <Filter
                noUrlParam={true}
                selectArray={[
                  { value: 'en', label: 'English' },
                  { value: 'sv', label: 'Svenska' },
                  { value: 'br', label: 'Português' },
                ]}
                isFilterAccount={true}
                absoluteClassName={'absolute top-9 left-0 z-10 flex bg-white flex-col w-full cursor-pointer'}
                size={'w-full'}
              />
            </fieldset>

            <footer className='grid grid-cols-2 gap-3 mt-5'>
              <button
                type="button"
                onClick={() => setModalToggle(false)}
                className='bg-neuroRed/20 text-obsoletedRed rounded-lg cursor-pointer py-1 transition-opacity font-semibold hover:opacity-70'
                aria-label='Cancel edit'>
                {t.cancel || 'Cancel'}
              </button>
            </footer>
          </form>
        )}

      </section>
    </div>
  )
}
