
import DetailPageContent from '@/components/access/DetailPageContent'
import React, { Suspense} from 'react'
import { FaSpinner } from 'react-icons/fa'

const DetailPage = ({params}) => {
  
  return (
    <div className=''>
      <Suspense fallback={<div className="absolute inset-1 bg-white/50  flex items-center justify-center z-50">
                        <FaSpinner className="animate-spin text-4xl text-gray-500" />
                      </div>}>
        <DetailPageContent params={params}/>
      </Suspense>
    </div>
  )
}

export default DetailPage