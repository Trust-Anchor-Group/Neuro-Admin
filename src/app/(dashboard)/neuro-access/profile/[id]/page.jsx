import { fetchProfile } from '@/components/access/fetchProfile'
import ProfileContent from '@/components/access/ProfileContent'
import React, { Suspense } from 'react'

const ProfilePage = async ({params}) => {

  const id = params?.id
  const profileData = await fetchProfile(id)

  return (
    <div>
      <ProfileContent profileData={profileData} />
    </div>
  )
}

export default ProfilePage