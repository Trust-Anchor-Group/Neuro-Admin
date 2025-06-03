import Image from 'next/image'
import React from 'react'

export const ImageComponent = ({user}) => {
  return (
    <div>
    {
            user?.attachments ?
        <div className='w-[128px] h-[128px] rounded-3xl overflow-hidden'>
            <Image
                className='w-full h-full object-cover'
                src={`data:image/png;base64,${user?.attachments}`}
                width={1200}
                height={1200}
                alt='Profile'
                />
        </div>
            :               
          <div className='w-[128px] h-[128px] rounded-3xl overflow-hidden'>
        <Image
            className='w-full h-full object-cover'
            src={`https://res.cloudinary.com/drkty7j9v/image/upload/v1737114626/profil-ezgif.com-avif-to-jpg-converter_jkimmv.jpg`}
            width={1200}
            height={1200}
            alt='Profile'
            />
            </div>
   }
    </div>
  )
}
