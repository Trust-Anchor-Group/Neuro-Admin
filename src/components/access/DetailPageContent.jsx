'use client'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import config from '@/config/config';
import { FaArrowLeft, FaShieldAlt, FaSpinner, FaUser} from 'react-icons/fa'
import { AccountDetails, DisplayDetails } from '@/components/access/Buttons/DisplayDetails';
import Link from 'next/link';
import { Identity } from '@/components/access/Identity';
import { ActivityDetailspage } from './ActivityDetailspage';
import { TabNavigation } from '../shared/TabNavigation';


export default function DetailPageContent() {
    const { id } = useParams()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()
    const [isAccount, setIsAccount] = useState(false)
    const ref = searchParams.get('ref')
    const tab = searchParams.get('tab') || 'details'
    const [backPath, setBackPath] = useState(null)
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
            
            setIsAccount(true)
            setUser(data.data)
  
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
        
            setUser(data.data)
  
        } catch (error) {
            console.error('Error fetching user:', error)
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

    useEffect(() => {
      if(ref){
        setBackPath(ref)
      }
    }, [])
    
  const fieldsToShowMetadata = [
    { label: "ID status", key: "state" },
    { label: "ID created", key: "created" },
  ]

    const fieldsToShow = [
        { label: "Account", key: "account" },
        { label: "Email", key: "properties.EMAIL" },
        { label: "Country", key: "properties.COUNTRY" },
        { label: "Phone", key: "properties.PHONE" },
        { label: "Created", key: "created" }
      ];

      const fieldsToShowIdentity = [
        { label: "First Name", key: "properties.LAST" },
        { label: "Nationality", key: "properties.COUNTRY" },
        { label: "Address", key: "properties.ADDR" },
        { label: "Date of birth", key: "properties.PNR" },
        { label: "Phone", key: "properties.PHONE" },
        
      ];
    
      const fieldsToShowWithNoID = [
        { label: "Account", key: "data.userName" },
        { label: "Email", key: "data.eMail" },
        { label: "Country", key: "data.country" },
        { label: "Phone", key: "data.phoneNr" },
        { label: "Created", key: "data.created" },
      ];

    return (
        <div className='p-5'>


        <div className='flex mb-5 gap-5 max-sm:flex-col'>
            <div className=''>
                <button aria-label='Back to Access Page' className='flex 
                items-center gap-5 border-2 p-2 rounded-lg' onClick={() => backPath ? router.push(backPath) : router.back()}>
                    <FaArrowLeft className='transition-opacity size-5 hover:opacity-50'/>
                    Back
                </button>
            </div>
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
                  <DisplayDetails 
                  fieldsToShow={isAccount ? fieldsToShowWithNoID : fieldsToShow}
                  userData={user}
                  title={'Account Information'}/>
                )
                
            }
              {
                  tab === 'identity' && (
                      <Identity user={user}
                      id={id} getData={getData}
                      fieldsToShow={fieldsToShowIdentity}
                       fieldsToShowMetaData={fieldsToShowMetadata}
                 />
                     
                    )
                }
              </>
           } 
             <div className=''>
                    <TabNavigation tab={tab} id={id} gridCols={'grid-cols-2'} tabArray={[
                        {
                            title:'Account',
                            href:'/neuro-access/detailpage',
                            tabDesination:'details&page',
                            icon:FaUser,
                            tabRef:'details'
                        },
                        {   
                            title:'Identity',
                            href:'/neuro-access/detailpage',
                            tabDesination:'identity',
                            icon:FaShieldAlt,
                            tabRef:'identity'

                        }
                    ]}/> 

                    <div className='pt-5'>
                        <ActivityDetailspage tab={tab}/>
                    </div>
            </div>
        </div>
    </div>
    )
}
