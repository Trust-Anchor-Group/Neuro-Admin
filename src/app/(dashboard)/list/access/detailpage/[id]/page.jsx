'use client'
import DetailPageContent from '@/components/access/DetailPageContent'
import React, { Suspense} from 'react'

const DetailPage = () => {
  
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <DetailPageContent/>
      </Suspense>
    </div>
  )
}

export default DetailPage