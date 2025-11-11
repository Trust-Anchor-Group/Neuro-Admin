import React from 'react'
import { useLanguage, content } from '../../../context/LanguageContext'

export const ActivityDetailspage = ({tab}) => {
    const { language } = useLanguage();
    const t = content[language];

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
    <div className='h-full '>
    {tab === 'details' && (
        <>
            <div className='relative flex justify-center items-center bg-[var(--brand-navbar)] border-2 border-[var(--brand-border)] rounded-xl h-full p-5 max-sm:h-[300px]'>
                <p className='absolute top-[3vh] left-[2vw] text-[var(--brand-text)] mb-5 text-text20 font-semibold max-sm:text-center max-sm:text-lg'>{t?.activity?.accountActivity || 'Account Activity'}</p>
                <h2 className=' text-gray-500 text-xl'>{t?.activity?.comingSoon || 'Coming soon'}</h2>
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
            <div className='relative flex items-center justify-center h-full bg-[var(--brand-navbar)] border-2 border-[var(--brand-border)] rounded-xl p-5 max-sm:h-[300px]'>
                <p className='absolute top-[3vh] left-[2vw] text-(var(--brand-text)) mb-5 text-text20 font-semibold max-sm:text-center max-sm:text-lg'>{t?.activity?.identityActivity || 'Identity Activity'}</p>
                <h2 className='text-center text-gray-500 text-xl'>{t?.activity?.comingSoon || 'Coming soon'}</h2>
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
