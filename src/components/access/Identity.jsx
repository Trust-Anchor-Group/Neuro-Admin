import React, { useEffect, useState } from 'react'
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
import { ProfileEditModal } from './ProfileEditModal';

export const Identity = ({user,id,getData,fieldsToShow,onSubmitHandler,form,setForm,modalToggle,setModalToggle,onHandleChange}) => {

const [infoToggle, setIntoToggle] = useState(true)
const [infoToggleMetaData, setIntoToggleMetaData] = useState(false)







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
                            <ProfileEditModal 
                            user={user} 
                            onSubmitHandler={onSubmitHandler}
                            form={form}
                            onHandleChange={onHandleChange}
                            setModalToggle={setModalToggle}/>
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