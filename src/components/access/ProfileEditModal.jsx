import React from 'react'
import { ImageComponent } from './ImageComponent'
import { InputField } from './InputField'
import { Filter } from '../shared/Filter'

export const ProfileEditModal = ({ user, setModalToggle, isEditProfile }) => {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Edit profile modal">
      <section className="bg-white p-6 rounded-lg shadow-lg w-[512px] max-h-[90vh] overflow-y-auto">
        
        <header className='flex justify-between border-b-2 border-neuroButtonGray pb-3'>
          <h2 className='text-xl font-semibold'>
            {isEditProfile ? 'Edit personal information' : 'Edit client information'}
          </h2>
        </header>

        {isEditProfile ? (
          <form className='mt-5' aria-label="Personal information form">
            <fieldset className='mb-4'>
              <legend className='font-semibold'>Profile Page</legend>

              <div className='flex justify-center'>
                <ImageComponent user={user} />
              </div>

              <div className='flex flex-col gap-3 border-b-2 border-neuroButtonGray pb-3 mt-3'>
                <div className='grid grid-cols-2 mt-5 gap-5'>
                  <InputField labelText={'First name'} name={user.properties.FIRST} profil={true} />
                  <InputField labelText={'Last name'} name={user.properties.LAST} profil={true} />
                </div>
                <InputField labelText={'Nationality'} name={user.properties.COUNTRY} profil={true} />
                <InputField labelText={'Personal number'} name={user.properties.PNR} profil={true} />
                <InputField
                  labelText={'Email'}
                  name={user.properties.EMAIL}
                  profil={true}
                />
                <InputField labelText={'Phone number'} name={user.properties.PHONE} profil={true} />
              </div>
            </fieldset>

            <footer className='grid grid-cols-2 gap-3 mt-5'>
              <button
                type="button"
                onClick={() => setModalToggle(false)}
                className='bg-neuroRed/20 w-full text-obsoletedRed rounded-lg cursor-pointer py-1 transition-opacity font-semibold hover:opacity-70'
                aria-label='Cancel edit'>
                Cancel
              </button>
            </footer>
          </form>
        ) : (
          <form aria-label="Client settings form" className='mt-5'>
            <fieldset className='flex flex-col gap-5'>
              <legend className='sr-only'>Client settings</legend>
              <label className='text-neuroTextBlack/60'>Language</label>
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
                Cancel
              </button>
            </footer>
          </form>
        )}

      </section>
    </div>
  )
}
