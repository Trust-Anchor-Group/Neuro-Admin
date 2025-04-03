'use client'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import config from '@/config/config';
import { FaArrowLeft, FaBan, FaCheck, FaExclamationTriangle, FaFileAlt, FaSpinner, FaTimesCircle } from 'react-icons/fa'
import { pendingAction } from '@/components/access/pendingFetch';
import { AccountDetails } from '@/components/access/AccountDetails';
import Link from 'next/link';
import { Identity } from '@/components/access/Identity';

export default function DetailPageContent() {
    const { id } = useParams()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()
    
    const tab = searchParams.get('tab') || 'details'

    const adminActions = [
        {actionTitle:'Approved', bgColor:'bg-green-500', icon:FaCheck,textColor:'text-white',name:'Approve'},
        {actionTitle:'Rejected', bgColor:'bg-red-500', icon:FaBan,textColor:'text-white',name:'Reject'},
        {actionTitle:'Obsoleted', bgColor:'bg-obsoletedRed', icon:FaTimesCircle,textColor:'text-white',name:'Obsolete'},
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
            <div className='border-b-2 flex items-center pb-5'>
                {
                    user && (
                        <div className='flex items-center gap-5 max-sm:flex-col'>
                            <div className=''>
                                <button className='flex items-center gap-5 border-2 p-2 rounded-lg' onClick={() => router.push('/list/access')}>
                                    <FaArrowLeft className='transition-opacity size-5 hover:opacity-50'/>
                                    Back
                                </button>
                            </div>
                            <div className='flex flex-col gap-3'>
                                <div className='flex items-center gap-2'>
                                    <p className='text-3xl font-semibold'>{user.data.properties.FIRST || user.data.account}</p>
                                    <p className='text-3xl font-semibold'>{user.data.properties.LAST || ''}</p>
                                </div>
                                <div>
                                    <p className='text-xl opacity-50'>{user.data.properties.EMAIL}</p>
                                </div>
                            </div>
                        </div>
                        
                    )
                }
            </div>
            <nav className="grid grid-cols-2 w-[50%] py-2 px-4 mt-5 bg-gray-200 text-center rounded-lg">
                    <Link href={`/list/access/detailpage/${id}/?tab=details&page=1`}>
                    <p className={`text-lg ${tab === 'details' ? 'bg-white/90 rounded-lg duration-300' : 'text-gray-600'}`}>Account details</p>
                    </Link>
                    <Link href={`/list/access/detailpage/${id}/?tab=identity&page=1`}>
                    <p className={`text-lg ${tab === 'identity' ? 'bg-white/90 rounded-lg duration-300' : 'text-gray-600'}`}>Identity</p>
                    </Link>
            </nav>
           {
            loading ? (
                <div className='flex justify-center items-center mt-12'>
                    <FaSpinner className='animate-spin text-5xl'/>
                </div>
                ) :
              <>
              {tab === 'details' && (
                <AccountDetails user={user} 
                adminActions={adminActions} 
                toggle={toggle}
                setToggle={setToggle} 
                onHandleModal={onHandleModal}
                onToggleHandler={onToggleHandler}
                buttonName={buttonName}/>
              )

              }
              {
                tab === 'identity' && (
                    <Identity user={user}
                     adminActions={adminActions} 
                     toggle={toggle} setToggle={setToggle} 
                     onHandleModal={onHandleModal}
                     onToggleHandler={onToggleHandler}
                     buttonName={buttonName}/>
                     
                )
              }
              </>
           } 
        </div>
    )
}
