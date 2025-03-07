'use client'
import { AdminContent } from '@/components/access/AdminContent'
import React, { Suspense} from 'react'

const AdminPage = () => {
  
//Suspense so that useSearchParams works

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminContent/>
      </Suspense>
    </div>
  )
}

export default AdminPage