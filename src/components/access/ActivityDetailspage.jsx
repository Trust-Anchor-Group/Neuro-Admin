import React from 'react'
import { FaSignInAlt } from 'react-icons/fa'

export const ActivityDetailspage = ({tab}) => {

    const accountActivityArray = [
        {
            location:'Stockholm',
            date:'Mar 24, 2025, 08.30',
            ip:'IP.192.11.3.3'
        },
        {
            location:'Stockholm',
            date:'Mar 24, 2025, 08.30',
            ip:'IP.192.11.3.3'
        },
        {
            location:'Stockholm',
            date:'Mar 24, 2025, 08.30',
            ip:'IP.192.11.3.3'
        }
    ]


  return (
    <div>
    {tab === 'details' && (
        <>
            <div className='flex flex-col w-full bg-white h-[300px] border-2 rounded-xl p-5'>
                <p className='text-neuroDarkGray/70 mb-5 font-semibold'>Account Activity</p>
                {/* {accountActivityArray.map((item, index) => (
                    <div className='bg-neuroGray/70 rounded-xl mt-2 p-3' key={index}>
                        <div className='flex justify-between items-center'>
                            <div className='flex justify-center items-center rounded-full w-[35px] h-[35px] bg-neuroBlue/20'>
                                <FaSignInAlt className='text-neuroBlue' />
                            </div>
                            <div className='flex flex-col col-span-1 justify-center mr-[80px] items-center'>
                                <p className='font-bold text-lg'>Logged in</p>
                                <p className='text-neuroDarkGray/70 text-mono'>{item.location}</p>
                                <p className='text-neuroDarkGray/70'>{item.ip}</p>
                            </div>
                            <p className='col-span-2 text-neuroDarkGray/70'>{item.date}</p>
                        </div>
                    </div>
                ))} */}
            </div>
        </>
    )}
    {tab === 'identity' && (
        <>
            <div className='flex flex-col w-full h-[300px] bg-white border-2 rounded-xl p-5'>
                <p className='text-neuroDarkGray/70 mb-5 font-semibold'>Identity Activity</p>
                {/* {accountActivityArray.map((item, index) => (
                    <div className='bg-neuroGray/70 rounded-xl mt-2 p-3' key={index}>
                        <div className='flex justify-between items-center'>
                            <div className='flex justify-center items-center rounded-full w-[35px] h-[35px] bg-neuroBlue/20  max-md:hidden'>
                                <FaSignInAlt className='text-neuroBlue' />
                            </div>
                            <div className='flex flex-col col-span-1 justify-center mr-[80px] items-center'>
                                <p className='font-bold text-lg'>Logged in</p>
                                <p className='text-neuroDarkGray/70 text-mono'>{item.location}</p>
                                <p className='text-neuroDarkGray/70'>{item.ip}</p>
                            </div>
                            <p className='col-span-2 text-neuroDarkGray/70'>{item.date}</p>
                        </div>
                    </div>
                ))} */}
            </div>
        </>
    )}
</div>
  )
}
