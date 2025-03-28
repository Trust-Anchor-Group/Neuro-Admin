import React from 'react'
import { Modal } from '../shared/Modal';
import { InputField } from './InputField';
import Image from 'next/image';

export const AccountDetails = ({user}) => {
  return (
    <div className='flex flex-col gap-5 w-full py-10 max-md:grid-cols-1'>
    <div className='bg-white border-2 rounded-md p-10  max-md:col-span-1 max-sm:p-0
    max-sm:pb-5 max-sm:overflow-auto'>
        <div className='flex justify-between max-sm:flex-col max-sm:text-center mb-10 max-sm:mb-0'>
            <h3 className='text-xl font-semibold max-sm:my-5'>Account&nbsp;Information</h3>
        </div>
        {
           user && user ? (
                <div className=''>
                    <div className='grid grid-cols-1 gap-5 max-sm:grid-cols-1 max-sm:px-5'>
                        <div className='flex gap-3'>

                             {
                                 user && user.data.attachments.length === 0 ?
                                 <div className='w-[100px] h-[100px] rounded-full overflow-hidden'>
                                <Image
                                    className='w-full h-full object-cover'
                                    src={`https://res.cloudinary.com/drkty7j9v/image/upload/v1737114626/profil-ezgif.com-avif-to-jpg-converter_jkimmv.jpg`}
                                    width={1200}
                                    height={1200}
                                    alt='Profile'
                                    />
                            </div>:               
                                <div className='w-[100px] h-[100px] rounded-full overflow-hidden'>
                                    <Image
                                        className='w-full h-full object-cover'
                                        src={`data:image/png;base64,${user.data.attachments[0].data}`}
                                        width={1200}
                                        height={1200}
                                        alt='Profile'
                                        />
                                </div>
                            }
                            <div className='flex justify-center items-center'>
                                <p className='text-lg font-semibold'>{user.data.properties.FIRST + ' ' + user.data.properties.LAST || 'N/A'}</p>
                            </div>
                        </div>
                        <InputField labelText={'Full Name'} name={user.data.properties.FIRST + ' ' + user.data.properties.LAST || 'N/A'}/>
                        <InputField labelText={'Phone'} name={user.data.properties.PHONE || 'N/A'}/>
                        <InputField labelText={'Email'} name={user.data.properties.EMAIL || 'N/A'}/>
                    </div>
                </div> 
            ) : (
                <p>No user data available</p>
            )
            
        }
    </div>
   
</div>
  )
}
