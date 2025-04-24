import React, { useState } from 'react'
import { Modal } from '../shared/Modal';
import { InputField } from './InputField';
import Image from 'next/image';
import { FaBan, FaCheck, FaChevronDown, FaChevronUp, FaExclamationTriangle, FaFileAlt, FaSignInAlt, FaTimes, FaTimesCircle } from 'react-icons/fa';
import { DetailpageStatus } from './DetailpageStatus';
import { ActionButtons } from './ActionButtons';

export const Identity = ({user,id,getData}) => {

const [infoToggle, setIntoToggle] = useState(true)


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
           user?.data?.properties?.FIRST ? (
                <div className=''>
                    <div className='grid grid-cols-1 gap-1 max-sm:grid-cols-1 max-sm:px-5'>
                        <div className='flex items-center gap-3 pb-4 max-sm:flex-col max-sm:mt-5'>
                        {
                                 user && user.data.attachments.length === 0 ?
                                 <div className='w-[100px] h-[100px] rounded-xl overflow-hidden'>
                                <Image
                                    className='w-full h-full object-cover'
                                    src={`https://res.cloudinary.com/drkty7j9v/image/upload/v1737114626/profil-ezgif.com-avif-to-jpg-converter_jkimmv.jpg`}
                                    width={1200}
                                    height={1200}
                                    alt='Profile'
                                    />
                            </div>:               
                                <div className='w-[128px] h-[128px] rounded-xl overflow-hidden'>
                                    <Image
                                        className='w-full h-full object-cover'
                                        src={`data:image/png;base64,${user.data.attachments[0].data}`}
                                        width={1200}
                                        height={1200}
                                        alt='Profile'
                                        />
                                </div>
                            }
                            <div className='flex flex-col pl-2 gap-2 max-md:text-center '>
                                    <DetailpageStatus user={user} adminActions={adminActions}/>
                                    <div>
                                    <p className='text-3xl font-semibold'>{user.data.properties.FIRST +
                                ' ' + user.data.properties.LAST || 'N/A'}</p>
                                <p className='text-text16 text-neuroDarkGray/70 '>{user.data.account || 'N/A'}</p>
                                <p className='text-text16 border-t-2 pt-2 text-neuroDarkGray/70'>Application made 2025-04-08</p>
                                    </div>
                                    
                            </div>
                                
                                
                        </div>
                        <div className='bg-neuroGray/70 rounded-xl p-5 overflow-auto'>
                           {
                           infoToggle ? (
                            <div className='flex justify-between border-b-2 pb-2'>
                            <h2 className='font-semibold text-neuroDarkGray/70'>Identity Information</h2>
                             <button onClick={() => setIntoToggle(prev => !prev)}><FaChevronDown color='#6e6e6e' /></button>
                            </div>
                           ) :
                           <div className='flex justify-between border-b-2 pb-2'>
                               <h2 className='font-semibold text-neuroDarkGray/70'>Identity Information</h2>
                            <button onClick={() => setIntoToggle(prev => !prev)}> <FaChevronUp color='#6e6e6e' /></button>
                        </div>
                           }
                           {
                               infoToggle ? (
                                <div className='transition-all delay-300 animate-fade-in'>
                                <InputField labelText={'First name'} name={user.data.properties.FIRST || 'N/A'}/>
                                <InputField labelText={'Last name'} name={user.data.properties.LAST || 'N/A'}/>
                                <InputField labelText={'Nationality'} name={user.data.properties.COUNTRY || 'N/A'}/>
                                <InputField labelText={'Adress'} name={user.data.properties.ADDR|| 'N/A'}/>
                                <InputField labelText={'Nationality'} name={user.data.properties.PNR || 'N/A'}/>
                                <InputField labelText={'Date of birth'} name={user.data.properties.EMAIL || 'N/A'}/>
                                <InputField labelText={'Phone Number'} name={user.data.properties.PHONE || 'N/A'}/>
                                </div>
                            ) : ''
                                   
                         }

                        </div>
                        <div className='mt-5'>
                            <ActionButtons user={user} adminActions={adminActions} id={id} getData={getData}/>

                        </div>
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