import Image from 'next/image'
import React from 'react'

export const ImageComponent = ({user}) => {
  let profilePhoto = null;
  if (user?.attachments) {
    profilePhoto = user.attachments.find(att => att.fileName === 'ProfilePhoto.jpg');
  }

  return (
    <div>
      {user?.attachments ? (
        <div className='w-[128px] h-[128px] rounded-3xl overflow-hidden'>
          {profilePhoto?.data ? (
            <img
              src={`data:image/jpeg;base64,${profilePhoto.data}`}
              alt={profilePhoto.fileName || 'Applicant Photo'}
              className="w-32 h-32 rounded-lg object-cover border"
            />
          ) : (
            <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center text-sm text-gray-500 border">
              No photo
            </div>
          )}
        </div>
      ) : user?.imageUrl ? (
        <div className='w-[128px] h-[128px] rounded-3xl overflow-hidden'>
          <Image
            className='w-full h-full object-cover'
            src={`${user?.imageUrl?.imageUrl}`} 
            width={1200}
            height={1200}
            alt='Profile'
          />
        </div>
      ) : (
        <div className='w-[128px] h-[128px] rounded-3xl overflow-hidden'>
          <Image
            className='w-full h-full object-cover'
            src={`https://res.cloudinary.com/drkty7j9v/image/upload/v1737114626/profil-ezgif.com-avif-to-jpg-converter_jkimmv.jpg`}
            width={1200}
            height={1200}
            alt='Profile'
          />
        </div>
      )}
    </div>
  )
}
