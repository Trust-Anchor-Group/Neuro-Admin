'use client'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import config from '@/config/config';
import { FaArrowLeft, FaBan, FaSpinner } from 'react-icons/fa'
import Link from 'next/link'
import { InputField } from '@/components/access/InputField'
export default function DetailPage() {
    const { id } = useParams()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [userAccount, setUserAccount] = useState(null)
    
    useEffect(() => {
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
                // const slicedData = data.slice(1,data.length)
                setUser(data)
                // setUserAccount(slicedData)
            } catch (error) {
                console.error('Error fetching user:', error)
                setUser(undefined) 
            } finally {
                setLoading(false) 
            }
        }

        if (id) {
            getData()
        }
    }, [id])



    return (
        <div className='p-10'>
            <div>
            <h1 className="mb-2 text-xl font-semibold md:text-3xl">Identity&nbsp;Management</h1>
            <p className='text-lg opacity-70 max-sm:text-sm'>Manage identity verification and roles</p>
            </div>
            <div className='flex items-center gap-5 mt-10'>
                <Link href={'/list/access'}>
                    <FaArrowLeft className='transition-opacity size-6 hover:opacity-50'/>
                </Link>
                <h2 className='text-xl font-semibold md:text-2xl'>Accounts</h2>
            </div>
           {
            loading ? (
                <div className='flex justify-center items-center mt-12'>
                    <FaSpinner className='animate-spin text-5xl'/>
                </div>
                ) :
                <div className='grid grid-cols-4 gap-5 py-10 max-md:grid-cols-1'>
                    <div className='bg-white border-2 rounded-md p-10 min-h-[400px] col-span-3 max-md:col-span-1'>
                        <h3 className='text-xl font-semibold mb-3'>Personal Information</h3>
                        {
                           user && user ? (
                                <div className=''>
                                    <div className='grid grid-cols-2 gap-5'>
                                        <InputField labelText={'First Name'} name={user.data.properties.FIRST || 'N/A'}/>
                                        <InputField labelText={'Last Name'} name={user.data.properties.LAST || 'N/A'}/>
                                        <InputField labelText={'Account'} name={user.data.account || 'N/A'}/>
                                        <InputField labelText={'Email'} name={user.data.properties.EMAIL || 'N/A'}/>
                                        <InputField labelText={'Phone'} name={user.data.properties.PHONE || 'N/A'}/>
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
                    <button className='w-full flex justify-center border-2 cursor-pointer gap-2 items-center bg-red-500 py-2
                     rounded-lg mb-2 text-white transition-opacity
                     hover:opacity-70'><FaBan className="text-white" />Reject</button>
                    <button className='w-full bg-neuroGray border-2 py-2 rounded-lg mb-2 cursor-pointer transition-opacity
                     hover:opacity-70'>Mark as Obsolete</button>
                    </div>
                </div>
           } 
        </div>
    )
}
