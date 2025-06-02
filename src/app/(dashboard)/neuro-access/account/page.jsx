
import { AccessContet } from '@/components/access/AccessContet'

import React, { Suspense} from 'react'
import { FaSpinner } from 'react-icons/fa'

const AccountPage = () => {

  return (
    <div>
      
      <Suspense fallback={<div className="absolute inset-1 bg-white/50 flex items-center justify-center z-50">
                  <FaSpinner className="animate-spin text-4xl text-gray-500" />
                </div>}>
        <AccessContet/>
      </Suspense>

    </div>
  )
}

export default AccountPage