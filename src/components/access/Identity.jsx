import React from 'react'
import { Modal } from '../shared/Modal';
import { InputField } from './InputField';
import Image from 'next/image';
import { FaExclamationTriangle, FaFileAlt } from 'react-icons/fa';

export const Identity = ({user,adminActions,toggle,setToggle,onHandleModal,onToggleHandler,buttonName}) => {
  return (
       <div className='grid grid-cols-2 gap-5 py-10 max-md:grid-cols-1'>
        <div className='bg-white border-2 rounded-md p-10 min-h-[400px] col-span-3 max-md:col-span-1 max-sm:p-0
        max-sm:pb-5 max-sm:overflow-auto'>
            <div className='flex justify-between item-center max-sm:text-center mb-10 max-sm:flex-col'>
                <h3 className='text-xl font-semibold max-sm:my-5'>Identity&nbsp;Information</h3>
                <>
                {
                user && user.data.properties.FIRST ? (
                    (() => {
                        const action = adminActions.find(a => a.actionTitle === user.data.state);
                        if(user && user.data.state.includes('Created')){
                            return               <div className={`flex items-center gap-2 px-3 py-1 rounded-lg bg-yellow-500 text-white
                            max-sm:mx-10 max-sm:mb-5`}>
                                <FaFileAlt/>
                                <span>Pending&nbsp;approval</span>
                            </div>
                        }
                         return action ? (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${action.bgColor} ${action.textColor}
                        max-sm:mx-10 max-sm:mb-5`}>
                               <action.icon />
                            <span>{action.actionTitle}</span>
                        </div>
                            ) : '';
                        })()
                ) : ''
                    }
                        </>
            </div>
            {
               user && user.data.properties.FIRST ? (
                    <div className=''>
                        <div className='grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:text-center max-sm:p-5'>
                            <InputField labelText={'First Name'} name={user.data.properties.FIRST || 'N/A'}/>
                            <InputField labelText={'Last Name'} name={user.data.properties.LAST || 'N/A'}/>
                            <InputField labelText={'Account'} name={user.data.account || 'N/A'}/>
                            <InputField labelText={'Phone'} name={user.data.properties.PHONE || 'N/A'}/>
                            <InputField labelText={'Personal Identity Number'} name={user.data.properties.PNR || 'N/A'}/>
                            <InputField labelText={'Address'} name={user.data.properties.ADDR || 'N/A'}/>
                            <InputField labelText={'Zip Code'} name={user.data.properties.ZIP || 'N/A'}/>
                            <InputField labelText={'Country'} name={user.data.properties.COUNTRY || 'N/A'}/>
                            <InputField labelText={'Email'} name={user.data.properties.EMAIL || 'N/A'}/>
                            <InputField labelText={'Identity Status'} name={user.data.state.includes('Created') ? 'Pending\u00A0approval' : user.data.state || 'N/A'}/>
                        </div>
                    </div> 
                ) : (
                    <div className='flex flex-col gap-5 justify-center items-center'>
                        <FaExclamationTriangle size={55} color="orange" />
                        <h1 className='text-xl font-semibold'>
                        Account&nbsp;does&nbsp;not&nbsp;have&nbsp;any&nbsp;Id</h1>
                        <div className='text-gray-500 text-lg'>
                            <p>This account doesn't have an identity verification yet.</p>
                        </div>
                    </div>
                )
                
            }
            {
                user && user.data.properties.FIRST ? (
                    
                <div className='mt-10 max-sm:p-5'>    
                <p className='text-lg mb-5'>Identity Actions</p>
                      {
                          toggle &&
                                            <Modal 
                                            text={`Are you sure you want to ${buttonName}?`}
                                            setToggle={setToggle}
                                            onHandleModal={onHandleModal}/>
                         }
                
                <div className='grid grid-cols-3 max-sm:grid-cols-1'>
        
                    {
                        adminActions.map((btn,index) => (
                            <button 
                            onClick={() => onToggleHandler(btn.actionTitle,btn.name)} key={index} className={`w-full 
                                ${btn.bgColor} ${btn.textColor} border-2 py-2 grid grid-cols-2 items-center pl-[20%] pr-[35%]
                                rounded-lg mb-2 cursor-pointer transition-opacity
                                hover:opacity-70`}>
                    
                    <btn.icon/>{btn.name}
                 </button>
                        ))
                    }
                    </div>
                </div>
                ) : ''

            }
        </div>
    </div>
  )
}
