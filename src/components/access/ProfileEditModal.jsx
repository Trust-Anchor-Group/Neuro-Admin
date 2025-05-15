import React from 'react'
import { ImageComponent } from './ImageComponent'
import { InputField } from './InputField'
import { Filter } from '../shared/Filter'

export const ProfileEditModal = ({user,onSubmitHandler,form,onHandleChange,setModalToggle,isEditProfile}) => {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[512px] max-h-[90vh] overflow-y-auto">
              {
                isEditProfile ? <>
                   <div className='flex justify-between border-b-2 border-neuroButtonGray pb-3'>
                    <h2 className='text-xl font-semibold '>Edit personal information</h2>
                </div>
                <form onSubmit={(e) => onSubmitHandler(e)} className='mt-5'>
                    <h3 className='font-semibold'>Profile Page</h3>
                    <div className='flex justify-center'>
                        <ImageComponent user={user}/>
                    </div>
                    <div className='border-b-2 border-neuroButtonGray pb-3'>
                    <InputField labelText={'Account name'} name={user.account} profil={true}/>
                    <p className='text-neuroTextBlack/60 mb-5'>Account name cannot be changed</p>
                    <div className='grid grid-cols-2 gap-5'>
                    <InputField labelText={'First name'} name={user.properties.FIRST} profil={true}/>
                    <InputField labelText={'Last name'} name={user.properties.LAST} profil={true}/>
                    </div>
                    <p className='text-neuroTextBlack/60 mb-5'>Name cannot be changed from your Neuro-Access ID</p>
                    <InputField labelText={'Nationality'} name={user.properties.COUNTRY} profil={true}/>
                    <p className='text-neuroTextBlack/60 mb-5'>Nationality be changed from your Neuro-Access ID</p>
                    <InputField labelText={'Personal number'} name={user.properties.PNR} profil={true}/>
                    <p className='text-neuroTextBlack/60 mb-5'>Personal number cannot be changed from your Neuro-Access ID</p>
                    <InputField labelText={'Email'} name={user.properties.EMAIL} editAble={true} value={form.email}
                    onChange={value => onHandleChange('email',value)}/>
                    <InputField phoneInput={true} value={form.phone} onChange={value => onHandleChange('phone',value)}/>
                    </div>
                    <div className='grid grid-cols-2 gap-3 mt-5'>
                        <button
                        onClick={() => setModalToggle(false)} className='bg-neuroRed/20 text-obsoletedRed
                        rounded-lg cursor-pointer py-1 transition-opacity font-semibold hover:opacity-70' aria-label='Close modal'>Cancel</button>
                        <button aria-label='Submit' 
                        className='bg-neuroPurpleLight text-neuroPurpleDark
                        rounded-lg cursor-pointer py-1 transition-opacity font-semibold hover:opacity-70'>Save changes</button>
                    </div>
                </form>
                </> : <>
                   <div className='flex justify-between border-b-2 border-neuroButtonGray pb-3'>
                    <h2 className='text-xl font-semibold '>Edit client information</h2>
                </div>
                    <div>
                      <form onClick={(e) => {e.preventDefault()}}>

                    <div className='flex flex-col gap-5'>
                      <div className='mt-5'>
                      <label className='text-neuroTextBlack/60'>Language</label>
                      <Filter 
                      noUrlParam={true}
                      selectArray={[
                        {value:'en',label:'English'},
                        {value:'sv',label:'Svenska'},
                        {value:'br',label:'Português'},                  
                      ]}
                      isFilterAccount={true}
                      absoluteClassName={'absolute top-9 left-0 z-10 flex bg-white flex-col w-full cursor-pointer'}
                      size={'w-full'}/>
                      </div> 
                    <div>
                    <label className='text-neuroTextBlack/60'>Your timezone</label>
                    <Filter 
                    noUrlParam={true}
                    selectArray={[
                      {value:'en',label:'English'},
                      {value:'sv',label:'Svenska'},
                      {value:'br',label:'Português'},                  
                    ]}
                    isFilterAccount={true}
                    absoluteClassName={'absolute top-9 left-0 z-10 flex bg-white flex-col w-full cursor-pointer'}
                    size={'w-full'}/>
                    </div>
                      <div>
                    <label className='text-neuroTextBlack/60'>Your timezone</label>
                    <Filter 
                    noUrlParam={true}
                    selectArray={[
                      {value:'en',label:'English'},
                      {value:'sv',label:'Svenska'},
                      {value:'br',label:'Português'},                  
                    ]}
                    isFilterAccount={true}
                    absoluteClassName={'absolute top-9 left-0 z-10 flex bg-white flex-col w-full cursor-pointer'}
                    size={'w-full'}/>
                    </div>
                    
                      </div>
                    <div className='grid grid-cols-2 gap-3 mt-5'>
                        <button
                        onClick={() => setModalToggle(false)} className='bg-neuroRed/20 text-obsoletedRed
                        rounded-lg cursor-pointer py-1 transition-opacity font-semibold hover:opacity-70' aria-label='Close modal'>Cancel</button>
                        <button aria-label='Submit' 
                        className='bg-neuroPurpleLight text-neuroPurpleDark
                        rounded-lg cursor-pointer py-1 transition-opacity font-semibold hover:opacity-70'>Save changes</button>
                    </div>
                        </form>
                    </div>
                </>

              }
            </div>
               </div>
  )
}
