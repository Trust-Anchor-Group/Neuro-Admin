'use client'
import { AccessContet } from '@/components/access/AccessContet'
import { theme } from '@/components/access/accountTableList'
import { ThemeProvider } from '@mui/material'
import React, { Suspense} from 'react'

const PendingIDs = () => {
  
//Suspense so that useSearchParams works

  return (
    <div>
      <ThemeProvider theme={theme}>
      <Suspense fallback={<div>Loading...</div>}>
        <AccessContet/>
      </Suspense>
      </ThemeProvider>
    </div>
  )
}

export default PendingIDs