'use client'
import React, { useEffect, useRef, useState } from 'react'
import { FaSpinner } from 'react-icons/fa'
import { Identity } from '@/components/access/Identity'
import { LocalizationSettings } from '@/components/access/LocalizationSettings'
import { InputField } from '@/components/access/InputField'
import { ProfileEditModal } from '@/components/access/ProfileEditModal'
import { PopUpButton } from '@/components/access/Buttons/PopUpButton'
import { Validate } from '../shared/validate'

const ProfileContent = ({profileData}) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const [modalToggle, setModalToggle] = useState(false)
    const [modalToggleClient, setModalToggleClient] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        if(profileData){
            setUser(profileData.data)
        }
    }, [profileData])
    

    const fieldsToShowIdentity = [
      { label: "First Name", key: "properties.FIRST" },
      { label: "Nationality", key: "properties.COUNTRY" },
      { label: "Address", key: "properties.ADDR" },
      { label: "Date of birth", key: "properties.PNR" },
      { label: "Phone", key: "properties.PHONE" },
      
    ];

    
    const fieldsToShowMetadata = [
      { label: "ID status", key: "state" },
      { label: "ID created", key: "created" },
      
    ];

      const [form, setForm] = useState({
          userName:'',
          email:'',
          password:'',
          phone:'',
          enabled:''

  })

useEffect(() => {
    if(user){
        setForm({
          userName:user.account,
          email:user.properties.EMAIL,
          password:'',
          phone:user.properties.PHONE,
          enabled:''
        })
    }
}, [user])

function onHandleChange(field, value){
    setForm(prev => ({...prev,[field]:value}))
}

   async function onSubmitHandler(e){
      e.preventDefault()
      setErrorMessage('')
      
       Validate(form,setErrorMessage)
     console.log('Formulär',form) 

     try {
      const res = await fetch('/api/updateAccount',{
        method:'POST',
        headers:{
          'Content':'application/json'
        },
        body: JSON.stringify('')
      })
     } catch (error) {
      
     }

    }

  return (
    <div className='relative grid grid-cols-2 gap-5 p-5'>
      <div className=''>
      <Identity user={user} fieldsToShow={fieldsToShowIdentity} onSubmitHandler={onSubmitHandler}
      form={form} setForm={setForm} modalToggle={modalToggle}
       setModalToggle={setModalToggle} onHandleChange={onHandleChange}
        fieldsToShowMetaData={fieldsToShowMetadata}
        errorMessage={errorMessage}
          />
      </div>
             {loading && (
                  <div className="absolute inset-0 bg-white/50  flex items-center justify-center z-50">
                    <FaSpinner className="animate-spin text-4xl text-gray-500" />
                  </div>
        )}
           <div className='flex flex-col  bg-white border-2 rounded-xl p-5 gap-3 max-sm:flex-col max-sm:mt-5'>
            <h2 className='text-text26 font-semibold'>System</h2>
            <div className='bg-neuroGray/70 rounded-xl p-5 overflow-auto'>
                <InputField labelText={'Langauge'} name={'English'}/>
               <LocalizationSettings/>
                <InputField labelText={'Default theme'} name={'Timed'}/>
                {
                  modalToggleClient && user &&
                  (
                      <ProfileEditModal 
                      setModalToggle={setModalToggleClient}
                      isEditProfile={false}/>
                  )
                  
                }
            </div>
                <PopUpButton title={'Edit Information'} setToggle={setModalToggleClient}/>
             </div>
    </div>
  )
}

export default ProfileContent