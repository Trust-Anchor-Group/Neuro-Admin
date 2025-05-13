import React, { useState } from 'react'
import Image from 'next/image';
import { FaBan, FaCheck, FaChevronDown, FaChevronUp, FaExclamationTriangle, FaFileAlt, FaSignInAlt, FaTimes, FaTimesCircle, FaXbox } from 'react-icons/fa';
import { DetailpageStatus } from './DetailpageStatus';
import { ActionButtons } from './Buttons/ActionButtons';
import { dateConverter } from '../shared/ConvertDate';
import { InfoToggleButton } from './Buttons/InfoToggleButton';
import { MapOutInput } from '../shared/MapOutInput';
import { PopUpButton } from './Buttons/PopUpButton';
import { DisplayDetails } from './Buttons/DisplayDetails';
import { ImageComponent } from './ImageComponent';
import { InputField } from './InputField';

export const Identity = ({user,id,getData,fieldsToShow,onSubmitHandler}) => {

const [infoToggle, setIntoToggle] = useState(true)
const [infoToggleMetaData, setIntoToggleMetaData] = useState(false)
const [modalToggle, setModalToggle] = useState(false)
  const [form, setForm] = useState({
    email:''
  })

useEffect(() => {
    if(user){
        setForm(prev => ({...prev,email:user.properties.EMAIL}))
    }
}, [user])


function onHandleChange(field, value){
    setForm(prev => ({...prev,[field]:value}))
}


const adminActions = [
    {actionTitle:'Rejected', bgColor:'bg-neuroRed/20', icon:FaTimes,textColor:'text-obsoletedRed',name:'Deny\u00A0ID\u00A0application'},
    {actionTitle:'Approved', bgColor:'bg-neuroPurpleLight', icon:FaCheck,textColor:'text-neuroPurpleDark',name:'Approve\u00A0ID\u00A0application'},
    {actionTitle:'Compromised', bgColor:'bg-neuroDarkOrange/20', icon:FaExclamationTriangle,textColor:'text-neuroDarkOrange',name:'Compromise'},
    {actionTitle:'Obsoleted', bgColor:'bg-obsoletedRed/20', icon:FaTimesCircle,textColor:'text-obsoletedRed',name:'Obsolete'},
]

if(!user){
    return <div className='p-3 pb-12 max-md:grid-cols-1'>
        <p className='bg-white border-2 rounded-xl p-6 py-12 text-center  max-md:col-span-1 max-sm:p-0
        max-sm:pb-5 max-sm:overflow-auto'>No available data</p>

    </div>
}

  return (
    <div className='pb-12 max-md:grid-cols-1 max-sm:pb-0'>
    <div className='bg-white border-2 rounded-xl p-6 pt-8  max-md:col-span-1 max-sm:p-0
    max-sm:pb-5 max-sm:overflow-auto'>
        
        {
           user?.properties?.FIRST ? (
                <div className=''>
                    <div className='grid grid-cols-1 gap-1 max-sm:grid-cols-1 max-sm:px-5'>
                        <div className='flex items-center gap-3 pb-4 max-sm:flex-col max-sm:mt-5'>
                            <ImageComponent user={user}/>
                            <div className='flex flex-col pl-2 gap-2 max-md:text-center '>
                                    <DetailpageStatus user={user} adminActions={adminActions}/>
                                    <div>
                                    <p className='text-3xl font-semibold'>{user.properties.FIRST +
                                ' ' + user.properties.LAST || 'N/A'}</p>
                                <p className='text-text16 text-neuroDarkGray/70 '>{user.account || 'N/A'}</p>
                                <p className='text-text16 border-t-2 pt-2 text-neuroDarkGray/70'>
                                {user.state.includes('Created') ? 'Application made ' : 'Registered '}
                                 {dateConverter(user.created)}</p>
                                    </div>
                                    
                            </div>
                                
                                
                        </div>
                        <div className='bg-neuroGray/70 rounded-xl p-4 overflow-auto'>
                          <InfoToggleButton infoToggle={infoToggle} setIntoToggle={setIntoToggle} title={'Identity Information'}/>
                        {infoToggle && 
                            <MapOutInput fieldsToShow={fieldsToShow} user={user}/> }
                        </div>
                        <div className='bg-neuroGray/70 rounded-xl p-4 mt-5 overflow-auto'>
                          <InfoToggleButton infoToggle={infoToggleMetaData} setIntoToggle={setIntoToggleMetaData} title={'Identity Information'}/>
                        </div>
                        <div className='mt-5'>
                                {   id ?
                                    <ActionButtons user={user} adminActions={adminActions} id={id} getData={getData}/>
                                    : <PopUpButton title={'Edit Information'} setToggle={setModalToggle}/>
                                }
                        </div>
                        {
                        modalToggle && user && (
                            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-[512px] max-h-[90vh] overflow-y-auto">
                                <div className='flex justify-between border-b-2 border-neuroButtonGray pb-3'>
                                    <h2 className='text-xl font-semibold '>Edit personal information</h2>
                                </div>
                                <form onSubmit={onSubmitHandler} className='mt-5'>
                                    <h3 className='font-semibold'>Profile Page</h3>
                                    <div className='flex justify-center'>
                                        <ImageComponent user={user}/>
                                    </div>
                                    <div>
                                        <InputField labelText={'Account name'} name={user.account} profil={true}/>
                                        <p className='text-neuroTextBlack/65 mb-5'>Account name cannot be changed</p>
                                        <div className='grid grid-cols-2 gap-5'>
                                        <InputField labelText={'First name'} name={user.properties.FIRST} profil={true}/>
                                        <InputField labelText={'Last name'} name={user.properties.LAST} profil={true}/>
                                        </div>
                                        <p className='text-neuroTextBlack/65 mb-5'>Name cannot be changed from your Neuro-Access ID</p>
                                        <InputField labelText={'Nationality'} name={user.properties.COUNTRY} profil={true}/>
                                        <p className='text-neuroTextBlack/65 mb-5'>Nationality be changed from your Neuro-Access ID</p>
                                        <InputField labelText={'Personal number'} name={user.properties.PNR} profil={true}/>
                                        <p className='text-neuroTextBlack/65 mb-5'>Personal number cannot be changed from your Neuro-Access ID</p>
                                        <InputField labelText={'Email'} name={user.properties.EMAIL} editAble={true} value={form.email}
                                        onChange={value => onHandleChange('email',value)}/>
                                        <InputField phoneInput={user.properties.PHONE}/>
                                        <div className='grid grid-cols-2 gap-3 mt-5'>
                                            <button
                                            onClick={() => setModalToggle()} className='bg-neuroRed/20 text-obsoletedRed
                                            rounded-lg cursor-pointer py-1 transition-opacity font-semibold hover:opacity-70' aria-label='Close modal'>Cancel</button>
                                            <button aria-label='Submit' 
                                            className='bg-neuroPurpleLight text-neuroPurpleDark
                                            rounded-lg cursor-pointer py-1 transition-opacity font-semibold hover:opacity-70'>Save changes</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            </div>
                        )
                        }
                    </div>
                </div> 
            ) : (
                <div className='flex flex-col gap-5 justify-center items-center max-sm:p-5'>
                <FaExclamationTriangle className='size-20 max-sm:size-12'  color="orange" />
                <h1 className='text-xl font-semibold max-sm:text-sm'>
                Account&nbsp;does&nbsp;not&nbsp;have&nbsp;any&nbsp;Id</h1>
                <div className='text-gray-500 text-lg text-center max-sm:text-sm'>
                    <p>This account doesn't have an identity verification yet.</p>
                </div>
            </div>
            )
            
        }
    </div>
   
</div>
  )
}