'use client'
import { PaginatedList } from '@/components/access/PaginatedList'
import React, { useState } from 'react'

const AccessPage = () => {



  return (
    <div>
        <div className='flex justify-center items-center h-screen my-10'>
            <PaginatedList/>
        </div>
    </div>
  )
}

export default AccessPage