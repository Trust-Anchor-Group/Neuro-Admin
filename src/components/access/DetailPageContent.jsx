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
    
    async function getAccounts(){
        try {
            const url = `${config.protocol}://${config.origin}/api/account`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({  userName: id })
            })
            
            if (!res.ok) {
                const errorText = await res.text()
                console.error('Fetch error details:', errorText)
                throw new Error('Failed to fetch user')
            }
            
            const data = await res.json()
            console.log('New Account',data)
        
            setUser(data)
  
        } catch (error) {
            console.error('Error fetching user:', error)
            setUser(undefined) 
        } finally {
            setLoading(false) 
        }
    }
    
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
        if (!id) {
            console.log('No ID found');
            return;
        }
        // Check if its Account with userName or Id
        const isEmail = id.includes('%40');
  

        if (!isEmail) {
            getAccounts();
 
        } else {
            getData();
   
        }
    }, [id]);



    


    return (
        <div className='p-5'>
              
                
                        <div className='flex mb-5 gap-5 max-sm:flex-col'>
                            <div className=''>
                                <button aria-label='Back to Access Page' className='flex 
                                items-center gap-5 border-2 p-2 rounded-lg' onClick={() => router.push('/list/access')}>
                                    <FaArrowLeft className='transition-opacity size-5 hover:opacity-50'/>
                                    Back
                                </button>
                            </div>
                            
                            { user?.data?.properties  ?
                            <div className='flex flex-col max-sm:items-center'>
                                <div className='flex items-center gap-2'>   
                                    <p className='text-3xl font-semibold max-sm:text-lg'>{user.data.properties.FIRST || user.data.account}</p>
                                    <p className='text-3xl font-semibold max-sm:text-lg'>{user.data.properties.LAST || ''}</p>
                                </div>
                                <div>
                                    <p className='text-xl opacity-50 max-sm:text-sm'>{user.data.properties.EMAIL}</p>
                                </div>
                            </div> 
                            :               
                            <div className='flex flex-col max-sm:items-center'>
                            <div className='flex items-center gap-2'>
                                    <p className='text-3xl font-semibold max-sm:text-lg'>{user?.data?.account?.userName}</p>
                            </div>
                            <div>
                                <p className='text-xl opacity-50 max-sm:text-sm'>{user?.data?.account?.eMail}</p>
                            </div>
                        </div> 
                            }
                        </div>
                        
             
        <div className=' flex items-center '>
          
            </div>
            <div className='grid grid-cols-2 gap-5 max-md:grid-cols-1'>

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
                                    
                <nav className="grid grid-cols-2 w-full text-center rounded-lg bg-white/90 font-semibold">
                    <Link href={`/list/access/detailpage/${id}/?tab=details&page=1`}>
                        <div className={`flex items-center justify-center text-text16 rounded-lg gap-2 py-3  ${tab === 'details' ?
                            'bg-aprovedPurple/15 text-neuroPurpleDark  duration-300' : 'bg-white/90 text-neuroTextBlack/60'}`}>
                                <FaUser className='max-md:hidden' size={14} /><span>Account</span></div>
                    </Link>
                    <Link href={`/list/access/detailpage/${id}/?tab=identity&page=1`}>
                    <div className={`flex items-center justify-center rounded-lg gap-2 py-3 text-text16 ${tab === 'identity' ?
                        'bg-aprovedPurple/15 text-neuroPurpleDark duration-300' : 'bg-white/90 text-neuroTextBlack/60'}`}>
                         <FaShieldAlt className='max-md:hidden'/><span>Identity</span></div>
                    </Link>
                                
                    </nav>
                    <div className='pt-5'>
                        <ActivityDetailspage tab={tab}/>
                    </div>
            </div>
        </div>
    </div>
    )
}
