'use client'
import { RedirectButton } from '@/components/access/RedirectButton';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DetailPage() {

    const { id } = useParams()
    console.log(id)
    const [user, setUser] = useState(null)

   useEffect(() => {
     async function getData(){
 
       const res = await fetch(`http://localhost:3000/api/user?id=${id}`, {
         method:'GET',
         headers:{
           'Content-Type':'application/json',       
         },
         credentials:'include'
       })
 
       const data = await res.json()
       setUser(data)
       console.log(data)

     }
 
     if(id){
         getData()
     }
   }, [id])
    


    return (
        <div className='flex justify-center items-center h-screen'>
            <div className='bg-white p-10 border-2 gap-5 flex justify-center items-center max-md:flex-col'>
            {
                user ?
                <>
            <div className='w-[200px] h-[200px] rounded-full overflow-hidden max-sm:h-[150px] max-sm:w-[150px]'>
                <Image
                className='w-full h-full object-cover'
                src={'https://res.cloudinary.com/drkty7j9v/image/upload/v1737114626/profil-ezgif.com-avif-to-jpg-converter_jkimmv.jpg'}
                width={1200}
                height={1200}
                alt='Profile'/>
            </div>
            <div className='flex flex-col'>
                <h1 className='text-2xl font-semibold text-center'>{user.name}</h1>
                <div className='mt-5'>
                    <div className='grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-0 max-sm:mb-5'>
                        <p className='border-b-2 border-black/50'>UserId:</p>
                        <p className='font-semibold'> {user.id}</p>
                    </div>
                    <div className='grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-0 max-sm:mb-5'>
                        <p className='border-b-2 border-black/50'>Email:</p>
                        <p className='font-semibold'> {user.email}</p>
                    </div>
                    <div className='grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-0 max-sm:mb-5'>
                        <p className='border-b-2 border-black/50'>AccessLevel:</p>
                        <p className='font-semibold'></p>
                    </div>
                    <div className='grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-0'>
                        <p className='border-b-2 border-black/50'>Status:</p>
                        <p className='font-semibold'></p>
                    </div>
                    
                </div>
            </div>
            <div className='flex flex-col gap-5'>
                <RedirectButton hrefText={'/list/access'}
                 classText={'py-4 px-6 w-full bg-black text-white rounded-md font-semibold max-sm:py-2 max-sm:px-4  hover:bg-black/50 transition-all'}
                 buttonName={'Back'}/>
                <RedirectButton hrefText={'/list/access'}
                buttonName={'Manage User'} 
                classText={'py-4 px-6 w-full bg-black text-white rounded-md font-semibold max-sm:py-2 max-sm:px-4 hover:bg-black/50 transition-all'}/>
            </div>
                </>
                :
                <>
                <h1 className='flex justify-center items-center text-lg'>Could not find the user</h1>
                <div className='flex flex-col gap-5'>
                <RedirectButton hrefText={'/list/access'}
                 classText={'py-4 px-6 w-full bg-black text-white rounded-md font-semibold max-sm:py-2 max-sm:px-4  hover:bg-black/50 transition-all'}
                 buttonName={'Back'}/>
                <RedirectButton hrefText={'/list/access'}
                buttonName={'Manage User'} 
                classText={'py-4 px-6 w-full bg-black text-white rounded-md font-semibold max-sm:py-2 max-sm:px-4 hover:bg-black/50 transition-all'}/>
            </div>
                </>
            }
            </div>
        </div>
    );
}
