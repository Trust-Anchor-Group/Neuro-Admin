import React, { useEffect, useState } from 'react'
import emailjs from 'emailjs-com';
import { Modal } from '@/components/shared/Modal'
import { pendingAction } from '../pendingFetch'
import { getModalText } from '@/utils/getModalText'
import { messageEmail } from '@/utils/messageEmail';

export const ActionButtons = ({user,adminActions,id,getData}) => {

    const [toggle, setToggle] = useState(false)
    const [actionButtonName, setActionButtonName] = useState('')
    const [buttonName, setButtonName] = useState('')
    const [loading, setLoading] = useState(false)

            async function onHandleModal(){
                setLoading(true)
                try {
                const changeState = await pendingAction(id,actionButtonName)
                    
                if(changeState.status === 200){
                
                const { title, message } = messageEmail(actionButtonName)

                const result = await emailjs.send(
                    process.env.NEXT_PUBLIC_EMAILJ_SERVICE_ID,
                    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
                    {
                    to_email: user.properties.EMAIL,
                    name: user.properties.FIRST,
                    title,
                    message
                    },
                    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
                );
                
                getData()
                setToggle(false)

                }
                 } catch (error) {
                     console.log(error)
                 }finally{
                    setLoading(false)
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
                    
                <div className='mt-5 max-sm:p-5'>    
                      {
                          toggle &&
                            <Modal
                            text={getModalText(actionButtonName, buttonName)}
                            setToggle={setToggle}
                            onHandleModal={onHandleModal}
                            loading={loading}/>
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
                    
                <div className='mt-5 max-sm:p-5'>    
                      {
                          toggle &&
                                            <Modal 
                                            text={getModalText(actionButtonName, buttonName)}
                                            setToggle={setToggle}
                                            onHandleModal={onHandleModal}
                                            loading={loading}/>
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
                    <div className='mt-5 max-sm:p-5'>    
                    {
                        toggle &&
                        <Modal 
                        text={getModalText(actionButtonName, buttonName)}
                        setToggle={setToggle}
                        onHandleModal={onHandleModal}
                        loading={loading}
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
