'use client'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import config from '@/config/config';
import { FaArrowLeft, FaBan, FaCheck, FaExclamationTriangle, FaFileAlt, FaIdBadge, FaShieldAlt, FaSignInAlt, FaSpinner, FaTimesCircle, FaUser, FaUserFriends } from 'react-icons/fa'
import { pendingAction } from '@/components/access/pendingFetch';
import { AccountDetails } from '@/components/access/AccountDetails';
import Link from 'next/link';
import { Identity } from '@/components/access/Identity';
import { ActivityDetailspage } from './ActivityDetailspage';

export default function DetailPageContent() {
    const { id } = useParams()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()
    
    const tab = searchParams.get('tab') || 'details'

    
    const router = useRouter()
    
    
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
                const errorText = await res.text()
                console.error('Fetch error details:', errorText)
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



    


    return (
        <div className=''>
            <div className='border-b-2 flex items-center pb-5'>
                {
                    user && (
                        <div className='flex items-center gap-5 max-sm:flex-col'>
                            <div className=''>
                                <button aria-label='Back to Access Page' className='flex 
                                items-center gap-5 border-2 p-2 rounded-lg' onClick={() => router.push('/list/access')}>
                                    <FaArrowLeft className='transition-opacity size-5 hover:opacity-50'/>
                                    Back
                                </button>
                            </div>
                            <div className='flex flex-col gap-3 max-sm:items-center'>
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
            <div className='grid grid-cols-2 max-md:grid-cols-1'>

            {
                loading ? (
                    <div className='flex justify-center items-center mt-12'>
                    <FaSpinner className='animate-spin text-5xl'/>
                </div>
                ) :
                <>
              {tab === 'details' && (
                  <AccountDetails user={user}/>
                )
                
            }
              {
                  tab === 'identity' && (
                      <Identity user={user}
                      id={id} getData={getData}
                 />
                     
                    )
                }
              </>
           } 
             <div className=''>
                                    
                <nav className="grid grid-cols-2 w-full py-3 text-center rounded-lg font-semibold">
                    <Link href={`/list/access/detailpage/${id}/?tab=details&page=1`}>
                        <div className={`flex items-center justify-center rounded-xl gap-2 py-2 border-2 text-lg ${tab === 'details' ?
                            'bg-neuroPurpleLight text-neuroPurpleDark  duration-300' : 'bg-white/90 text-neuroTextBlack/60'}`}>
                                <FaUser className='max-md:hidden' size={14} /><span>Account</span></div>
                    </Link>
                    <Link href={`/list/access/detailpage/${id}/?tab=identity&page=1`}>
                    <div className={`flex items-center justify-center rounded-xl gap-2 py-2 border text-lg ${tab === 'identity' ?
                        'bg-neuroPurpleLight text-neuroPurpleDark duration-300' : 'bg-white/90 text-neuroTextBlack/60'}`}>
                         <FaShieldAlt className='max-md:hidden'/><span>ID&nbsp;application</span></div>
                    </Link>
                                
                    </nav>
                        <ActivityDetailspage tab={tab}/>
            </div>
        </div>
    </div>
    )
}
