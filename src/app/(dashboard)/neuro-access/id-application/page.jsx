'use client'
import { AccessContent } from '@/components/access/AccessContent'
import { theme } from '@/components/access/accountTableList'
import { ThemeProvider } from '@mui/material'
import React, { Suspense} from 'react'
import { FaSpinner } from 'react-icons/fa'

const PendingIDs = () => {
  
//Suspense so that useSearchParams works

  return (
    <div className="min-h-[calc(100vh-63px)] bg-[#f3f4f6] py-6">
      <ThemeProvider theme={theme}>
      <Suspense fallback={
        <div className="absolute inset-1 bg-white/50  flex items-center justify-center z-50">
        <FaSpinner className="animate-spin text-4xl text-gray-500" /></div>}>
        <div className="space-y-8">
          <AccessContent applicationType="AccountRecovery" title="Account recovery applications" />
          <AccessContent applicationType="ID" title="ID applications" />
        </div>
      </Suspense>
      </ThemeProvider>
    </div>
  )
}

export default PendingIDs
