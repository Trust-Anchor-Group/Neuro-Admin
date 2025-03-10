'use client'
import { RedirectButton } from '@/components/access/RedirectButton'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import config from '@/config/config';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa'
import Link from 'next/link'
import { InputField } from '@/components/access/InputField'
export default function DetailPage() {
    const { id } = useParams()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function getData() {
            try {
                 const url = `${config.protocol}://${config.origin}/api/user`;
                 const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ userId: id })
                })

                if (!res.ok) {
                    throw new Error('Failed to fetch user')
                }

                const data = await res.json()
                setUser(data)
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
                    <FaArrowLeft/>
                </Link>
                <h2 className='text-xl font-semibold md:text-2xl'>Identity Details</h2>
            </div>
           {
            loading ? (
                <div className='flex justify-center items-center mt-12'>
                    <FaSpinner className='animate-spin text-5xl'/>
                </div>
                ) :
                <div className='grid grid-cols-2 gap-5 py-10'>
                    <div className='bg-white border-2 rounded-md p-5'>
                        <h3 className='text-xl font-semibold mb-3'>Personal Information</h3>
                        {
                            user &&
                            <div>
                                <InputField labelText={'First Name'} name={user.name}/>
                            </div> 
                            
                        }
                    </div>
                    <div className='bg-white border-2 rounded-md'>
                        <div className='w-[200px] h-[200px] rounded-full overflow-hidden max-sm:h-[150px] max-sm:w-[150px]'>
                            <Image
                                className='w-full h-full object-cover'
                                src={'https://res.cloudinary.com/drkty7j9v/image/upload/v1737114626/profil-ezgif.com-avif-to-jpg-converter_jkimmv.jpg'}
                                width={1200}
                                height={1200}
                                alt='Profile'
                            />
                        </div>
                    </div>
                </div>
           } 
        </div>
    )
}
