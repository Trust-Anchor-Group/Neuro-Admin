'use client'
import DetailPageContent from '@/components/access/DetailPageContent'
import React, { Suspense} from 'react'

const DetailPage = ({params}) => {
  
  return (
    <div className=''>
      <Suspense fallback={<div>Loading...</div>}>
        <DetailPageContent params={params}/>
      </Suspense>
    </div>
  )
}

export default DetailPage