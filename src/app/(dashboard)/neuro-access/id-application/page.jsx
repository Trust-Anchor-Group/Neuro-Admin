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
      <section className="mx-5 mb-6 min-h-[42vh] rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[var(--brand-text)]">Account recovery applications</h1>
      </section>
      <Suspense fallback={
        <div className="absolute inset-1 bg-white/50  flex items-center justify-center z-50">
        <FaSpinner className="animate-spin text-4xl text-gray-500" /></div>}>
        <AccessContent/>
      </Suspense>
      </ThemeProvider>
    </div>
  )
}

export default PendingIDs
