import React, { useEffect, useState } from 'react'
import { Modal } from '@/components/shared/Modal'
import { pendingAction } from '../pendingFetch'
import { getModalText } from '@/utils/getModalText'

export const ActionButtons = ({user,adminActions,id,getData}) => {



    const [toggle, setToggle] = useState(false)
    const [actionButtonName, setActionButtonName] = useState('')
    const [buttonName, setButtonName] = useState('')

            async function onHandleModal(){
                try {
                    await pendingAction(id,actionButtonName)
                    getData()
                    setToggle(false)
                 } catch (error) {
                     console.log(error)
                 }
            }
        
            function onToggleHandler(btnName,btnText){
                setToggle((prev => !prev))
                setActionButtonName(btnName)
                setButtonName(btnText)
            }

            

  return (
    <div>
                 {
                user && user.state === 'Created' && (
                    
                <div className='mt-10 max-sm:p-5'>    
                      {
                          toggle &&
                            <Modal
                            text={getModalText(actionButtonName, buttonName)}
                            setToggle={setToggle}
                            onHandleModal={onHandleModal}/>
                         }
                
                <div className='grid grid-cols-2 gap-2 max-sm:grid-cols-1'>
        
                {
                    adminActions
                        .filter(btn => btn.actionTitle === 'Approved' || btn.actionTitle === 'Rejected')
                        .map((btn, index) => (
                        
                            <button
                                aria-label='' 
                                onClick={() => onToggleHandler(btn.actionTitle, btn.name)} 
                                key={index}
                                className={`w-full 
                                    ${btn.bgColor} ${btn.textColor} shadow-sm  py-1 flex justify-center items-center
                                    font-semibold gap-2
                                    rounded-lg cursor-pointer transition-opacity hover:opacity-70`}
                                    >
                                <btn.icon aria-hidden="true"/> {btn.name}
                            </button>
                         
                        ))
                }
                    </div>
                </div>
                ) }


                        {
                user && user.state === 'Obsoleted' && (
                    
                <div className='mt-10 max-sm:p-5'>    
                      {
                          toggle &&
                                            <Modal 
                                            text={getModalText(actionButtonName, buttonName)}
                                            setToggle={setToggle}
                                            onHandleModal={onHandleModal}/>
                         }
                
                <div className='grid grid-cols-2 gap-2 max-sm:grid-cols-1'>
        
                {
                    adminActions
                        .filter(btn => btn.actionTitle === 'Compromised')
                        .map((btn, index) => (
                        
                            <button
                                aria-label='' 
                                onClick={() => onToggleHandler(btn.actionTitle, btn.name)} 
                                key={index}
                                className={`w-full 
                                    ${btn.bgColor} ${btn.textColor} shadow-sm  py-1 flex justify-center items-center
                                    font-semibold gap-2
                                    rounded-lg cursor-pointer transition-opacity hover:opacity-70`}
                                    >
                                <btn.icon aria-hidden="true"/> {btn.name}
                            </button>
                         
                        ))
                }
                    </div>
                </div>
                ) }

                {
                user && !['Created', 'Obsoleted'].includes(user.state) && (
                    <div className='mt-10 max-sm:p-5'>    
                    {
                        toggle &&
                        <Modal 
                        text={getModalText(actionButtonName, buttonName)}
                        setToggle={setToggle}
                        onHandleModal={onHandleModal}
                        />
                    }

                    <div className='grid grid-cols-2 gap-2 max-sm:grid-cols-1'>
                        {
                        adminActions
                            .filter(btn => btn.actionTitle === 'Compromised' || btn.actionTitle === 'Obsoleted')
                            .map((btn, index) => (
                            <button
                                aria-label='' 
                                onClick={() => onToggleHandler(btn.actionTitle, btn.name)} 
                                key={index}
                                className={`w-full 
                                ${btn.bgColor} ${btn.textColor} shadow-sm py-1 flex justify-center items-center
                                font-semibold gap-2
                                rounded-lg cursor-pointer transition-opacity hover:opacity-70`}
                            >
                                <btn.icon aria-hidden="true" /> {btn.name}
                            </button>
                            ))
                        }
                    </div>
                    </div>
                )
                }
    </div>
  )
}
