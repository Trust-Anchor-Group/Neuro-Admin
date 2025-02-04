'use server';

import { getUser } from '@/app/utils/getUser';
import { RedirectButton } from '@/components/access/RedirectButton';
import { cookies } from 'next/headers';
import Image from 'next/image';

export default async function DetailPage() {
    const userId = (await cookies()).get('selectedUserId')?.value

    if (!userId) {
        return <p>Ingen användare vald</p>;
    }

    const user = await getUser(userId); 

    return (
        <div className='flex justify-center items-center h-screen'>
            <div className='bg-white p-10 border-2 gap-5 flex max-md:flex-col max-md:justify-center max-md:items-center'>
            {
                user &&
                <>
            <div className='w-[200px] h-[200px] rounded-full overflow-hidden'>
                <Image
                className='w-full h-full object-cover'
                src={user[0].Image || 'https://res.cloudinary.com/drkty7j9v/image/upload/v1737114626/profil-ezgif.com-avif-to-jpg-converter_jkimmv.jpg'}
                width={1200}
                height={1200}
                alt='Profile'/>
            </div>
            <div className='flex flex-col'>
                <h1 className='text-2xl font-semibold text-center'>{user[0].name}</h1>
                <div className='mt-5'>
                    <div className='grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-0 max-sm:mb-5'>
                        <p className='border-b-2 border-black/50'>UserId:</p>
                        <p className='font-semibold'> {user[0].userId}</p>
                    </div>
                    <div className='grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-0 max-sm:mb-5'>
                        <p className='border-b-2 border-black/50'>Email:</p>
                        <p className='font-semibold'> {user[0].email}</p>
                    </div>
                    <div className='grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-0 max-sm:mb-5'>
                        <p className='border-b-2 border-black/50'>AccessLevel:</p>
                        <p className='font-semibold'> {user[0].accessLevel}</p>
                    </div>
                    <div className='grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-0'>
                        <p className='border-b-2 border-black/50'>Status:</p>
                        <p className='font-semibold'> {user[0].status}</p>
                    </div>
                    
                </div>
            </div>
            <div className='flex flex-col gap-5'>
                <RedirectButton hrefText={'/list/access'}
                 classText={'py-4 px-6 w-full bg-black text-white rounded-md font-semibold hover:bg-black/50 transition-all'}
                 buttonName={'Back'}/>
                <RedirectButton hrefText={'/list/access'}
                buttonName={'Manage User'} 
                classText={'py-4 px-6 w-full bg-black text-white rounded-md font-semibold hover:bg-black/50 transition-all'}/>
            </div>
                </>
            }
            </div>
        </div>
    );
}
