'use client'
import { RedirectButton } from '@/components/access/RedirectButton';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DetailPage() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Ny state för att hantera laddning

    useEffect(() => {
        async function getData() {
            try {
                const res = await fetch(`http://localhost:3000/api/user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ userId: id })
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch user');
                }

                const data = await res.json();
                setUser(data);
            } catch (error) {
                console.error('Error fetching user:', error);
                setUser(undefined); // Indikerar att användaren inte hittades
            } finally {
                setLoading(false); // Avsluta laddning
            }
        }

        if (id) {
            getData();
        }
    }, [id]);

    return (
        <div className='flex justify-center items-center h-screen'>
            <div className='bg-white p-10 border-2 gap-5 flex justify-center items-center max-md:flex-col max-md:mt-[30%]'>

                {loading ? (
                    <h1 className='text-lg font-semibold'>Loading...</h1>
                ) : user === undefined ? (
                    <>
                        <h1 className='text-lg font-semibold'>Could not find the user</h1>
                        <div className='flex flex-col gap-5'>
                            <RedirectButton 
                                hrefText={'/list/access'}
                                classText={'py-4 px-6 w-full bg-black text-white rounded-md font-semibold hover:bg-black/50 transition-all'}
                                buttonName={'Back'}
                            />
                            <RedirectButton 
                                hrefText={'/list/access'}
                                classText={'py-4 px-6 w-full bg-black text-white rounded-md font-semibold hover:bg-black/50 transition-all'}
                                buttonName={'Manage User'}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className='w-[200px] h-[200px] rounded-full overflow-hidden max-sm:h-[150px] max-sm:w-[150px]'>
                            <Image
                                className='w-full h-full object-cover'
                                src={'https://res.cloudinary.com/drkty7j9v/image/upload/v1737114626/profil-ezgif.com-avif-to-jpg-converter_jkimmv.jpg'}
                                width={200}
                                height={200}
                                alt='Profile'
                            />
                        </div>
                        <div className='flex flex-col'>
                            <h1 className='text-2xl font-semibold text-center'>{user.name || user.account}</h1>
                            <div className='mt-5'>
                                <div className='grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-0 max-sm:mb-5'>
                                    <p className='border-b-2 border-black/50'>UserId:</p>
                                    <p className='font-semibold'>{user.id ? user.id.slice(0, 10) : 'N/A'}</p>
                                </div>
                                <div className='grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-0 max-sm:mb-5'>
                                    <p className='border-b-2 border-black/50'>Email:</p>
                                    <p className='font-semibold'>{user.email || '-'}</p>
                                </div>
                                <div className={`grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-0 max-sm:mb-5 ${user.name == '' ? 'hidden':''}`}>
                                    <p className='border-b-2 border-black/50'>Address:</p>
                                    <p className='font-semibold'>{user.addr || '-'}</p>
                                </div>
                                <div className={`grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-0 max-sm:mb-5 ${user.name == '' ? 'hidden':''}`}>
                                    <p className='border-b-2 border-black/50'>City:</p>
                                    <p className='font-semibold'>{user.city || '-'}</p>
                                </div>
                                <div className='grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-0'>
                                    <p className='border-b-2 border-black/50'>Status:</p>
                                    <p className='font-semibold'>{user.state || '-'}</p>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col gap-5'>
                            <RedirectButton 
                                hrefText={'/list/access'}
                                classText={'py-4 px-6 w-full bg-black text-white rounded-md font-semibold hover:bg-black/50 transition-all'}
                                buttonName={'Back'}
                            />
                            <RedirectButton 
                                hrefText={'/list/access'}
                                classText={'py-4 px-6 w-full bg-black text-white rounded-md font-semibold hover:bg-black/50 transition-all'}
                                buttonName={'Manage User'}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
