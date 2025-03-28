'use client'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import config from '@/config/config';
import { FaArrowLeft, FaBan, FaCheck, FaExclamationTriangle, FaPlusCircle, FaSpinner, FaTimesCircle } from 'react-icons/fa'
import { InputField } from '@/components/access/InputField'
import { pendingAction } from '@/components/access/pendingFetch';
import { Modal } from '@/components/shared/Modal';
export default function DetailPage() {
    const { id } = useParams()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const adminActions = [
        {actionTitle:'Approved', bgColor:'bg-neuroGreen', icon:FaCheck,textColor:'text-white',name:'Approve'},
        {actionTitle:'Rejected', bgColor:'bg-red-500', icon:FaBan,textColor:'text-white',name:'Reject'},
        {actionTitle:'Obsoleted', bgColor:'bg-red-500', icon:FaTimesCircle,textColor:'text-white',name:'Obsolete'},
        {actionTitle:'Compromised', bgColor:'bg-orange-500', icon:FaExclamationTriangle,textColor:'text-white',name:'Compromise'},
    ]

    const router = useRouter()
    const [toggle, setToggle] = useState(false)
    const [actionButtonName, setActionButtonName] = useState('')
    const [buttonName, setButtonName] = useState('')
    
    async function getData() {
        try {
             const url = `${config.protocol}://${config.origin}/api/legalIdentity`;
             const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({  legalIdentity: id })
            })

            if (!res.ok) {
                throw new Error('Failed to fetch user')
            }

            const data = await res.json()
            console.log('New ID',data)
            setUser(data)
  
        } catch (error) {
            console.error('Error fetching user:', error)
            setUser(undefined) 
        } finally {
            setLoading(false) 
        }
    }
    useEffect(() => {

        if (id) {
            getData()
        }
    }, [id])


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


    return (
        <div className='p-10'>
            <div>
            <h1 className="mb-2 text-xl font-semibold md:text-3xl">Identity&nbsp;Management</h1>
            <p className='text-lg opacity-70 max-sm:text-sm'>Manage identity verification and roles</p>
            </div>
            <div className='flex items-center gap-5 mt-10'>
                <button onClick={() => router.back()}>
                    <FaArrowLeft className='transition-opacity size-6 hover:opacity-50'/>
                </button>
            </div>
           {
            loading ? (
                <div className='flex justify-center items-center mt-12'>
                    <FaSpinner className='animate-spin text-5xl'/>
                </div>
                ) :
                <div className='grid grid-cols-4 gap-5 py-10 max-md:grid-cols-1'>
                    <div className='bg-white border-2 rounded-md p-10 min-h-[400px] col-span-3 max-md:col-span-1 max-sm:p-0
                    max-sm:pb-5 max-sm:overflow-auto'>
                        <div className='flex justify-between max-sm:flex-col max-sm:text-center mb-10 max-sm:mb-0'>
                            <h3 className='text-xl font-semibold max-sm:my-5'>Personal&nbsp;Information</h3>
                            <>
                            {
                            user && user.data.state && (() => {
                                    const action = adminActions.find(a => a.actionTitle === user.data.state);
                                     return action ? (
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${action.bgColor} ${action.textColor}
                                    max-sm:mx-10 max-sm:mb-5`}>
                                           <action.icon />
                                        <span>{action.actionTitle}</span>
                                    </div>
                                        ) : '';
                                    })()
                                }
                                    </>
                        </div>
                        {
                           user && user ? (
                                <div className=''>
                                    <div className='grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:text-center'>
                                        <InputField labelText={'First Name'} name={user.data.properties.FIRST || 'N/A'}/>
                                        <InputField labelText={'Last Name'} name={user.data.properties.LAST || 'N/A'}/>
                                        <InputField labelText={'Account'} name={user.data.account || 'N/A'}/>
                                        <InputField labelText={'Phone'} name={user.data.properties.PHONE || 'N/A'}/>
                                        <InputField labelText={'Personal Identity Number'} name={user.data.properties.PNR || 'N/A'}/>
                                        <InputField labelText={'Address'} name={user.data.properties.ADDR || 'N/A'}/>
                                        <InputField labelText={'Zip Code'} name={user.data.properties.ZIP || 'N/A'}/>
                                        <InputField labelText={'Country'} name={user.data.properties.COUNTRY || 'N/A'}/>
                                        <InputField labelText={'Email'} name={user.data.properties.EMAIL || 'N/A'}/>
                                    </div>
                                </div> 
                            ) : (
                                <p>No user data available</p>
                            )
                            
                        }
                    </div>
                    <div className='flex flex-col bg-white border-2 rounded-md p-5'>
                    <h2 className='text-xl mb-5'>Profile Picture</h2>
                    {
                        user && user.data.attachments.length === 0 ?
                        <div className='border-2 mb-5 overflow-hidden min-h-[200px]'>
                        <Image
                            className='w-full h-full object-cover'
                            src={`https://res.cloudinary.com/drkty7j9v/image/upload/v1737114626/profil-ezgif.com-avif-to-jpg-converter_jkimmv.jpg`}
                            width={1200}
                            height={1200}
                            alt='Profile'
                            />
                    </div>:               
                        <div className='border-2 mb-5 overflow-hidden min-h-[200px]'>
                            <Image
                                className='w-full h-full object-cover'
                                src={`data:image/png;base64,${user.data.attachments[0].data}`}
                                width={1200}
                                height={1200}
                                alt='Profile'
                                />
                        </div>
                    }
 
                    <p className='text-gray-500 mb-5'>Actions</p>
                          {
                                                toggle &&
                                                <Modal 
                                                text={`Are you sure you want to ${buttonName}?`}
                                                setToggle={setToggle}
                                                onHandleModal={onHandleModal}/>
                             }
                    
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
