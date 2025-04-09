import React, { useEffect, useState } from 'react'

export const ActionButtons = ({user,adminActions}) => {



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
                console.log(actionButtonName)
            }
        
            useEffect(() => {
                if(user){
                    console.log('State',user.data.state)
                }
            }, [user])
            

  return (
    <div>
                 {
                user && user.data.state === 'Created' ? (
                    
                <div className='mt-10 max-sm:p-5'>    
                      {
                          toggle &&
                                            <Modal 
                                            text={`Are you sure you want to ${buttonName}?`}
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
                                    ${btn.bgColor} ${btn.textColor}  py-1.5 flex justify-center items-center
                                    font-semibold gap-2
                                    rounded-xl cursor-pointer transition-opacity hover:opacity-70`}
                                    >
                                <btn.icon aria-hidden="true"/> {btn.name}
                            </button>
                         
                        ))
                }
                    </div>
                </div>
                ) :  <div className='mt-10 max-sm:p-5'>    
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

            }
    </div>
  )
}
