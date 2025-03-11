'use client'
import { AdminContent } from '@/components/access/AdminContent'
import React, { Suspense} from 'react'

const AdminPage = () => {
  
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminContent/>
      </Suspense>
    </div>
  )
}

export default AdminPage