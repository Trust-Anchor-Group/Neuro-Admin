'use client'
import { AccessContet } from '@/components/access/AccessContet'
import React, { Suspense} from 'react'

const AccessPage = () => {
  
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <AccessContet/>
      </Suspense>
    </div>
  )
}

export default AccessPage